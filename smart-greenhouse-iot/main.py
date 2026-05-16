from yolobit import *
from yolobit_wifi import wifi
from aiot_rgbled import RGBLed
from aiot_dht20 import DHT20
from aiot_lcd1602 import LCD1602
from aiot_ir_receiver import *
from umqtt.simple import MQTTClient
import time

# =======================
# LOG FUNCTION
# =======================
def log(msg):
    t = time.localtime()
    stamp = "{:02d}:{:02d}:{:02d}".format(t[3], t[4], t[5])
    print("[{}] {}".format(stamp, msg))

# =======================
# WIFI
# =======================
wifi.connect_wifi("ACLAB", "ACLAB2023")
log("WiFi connected!")

# =======================
# ADAFRUIT IO MQTT
# =======================
AIO_USERNAME = ""
AIO_KEY = ""
AIO_SERVER = "io.adafruit.com"
CLIENT_ID = "yolobit_aiot"

mqtt = MQTTClient(
    CLIENT_ID, AIO_SERVER,
    user=AIO_USERNAME, password=AIO_KEY,
    port=1883
)
mqtt.connect()
log("MQTT connected!")

# =======================
# FEEDS
# =======================
FEED_TEMP  = AIO_USERNAME + "/feeds/dht20temp"
FEED_HUMI  = AIO_USERNAME + "/feeds/dht20humi"
FEED_LIGHT = AIO_USERNAME + "/feeds/lightsensor"
FEED_SOIL  = AIO_USERNAME + "/feeds/soilhumi"
FEED_LED   = AIO_USERNAME + "/feeds/switch1"
FEED_PUMP  = AIO_USERNAME + "/feeds/switch"

# =======================
# MODULES
# =======================
dht = DHT20()
LIGHT_PIN = pin1
SOIL_PIN = pin2
rgb = RGBLed(pin14.pin, 4)
PUMP = pin10
lcd = LCD1602()

# =======================
# IR REMOTE
# =======================
ir = IR_RX(Pin(pin0.pin, Pin.IN))
ir.start()
log("IR ready (A/B LED, C/D pump)")

# =======================
# RESET DEVICES
# =======================
for i in range(4):
    rgb.show(i, (0, 0, 0))
PUMP.write_analog(0)
log("All devices OFF at startup")

# =======================
# LCD FUNCTIONS
# =======================
def show_sensor_lcd(temp, humi, light, soil):
    lcd.clear()
    lcd.move_to(0, 0)
    lcd.putstr("T:{} H:{}".format(temp, humi))
    lcd.move_to(0, 1)
    lcd.putstr("L:{} S:{}".format(light, soil))

def show_message(msg):
    lcd.clear()
    lcd.move_to(0, 0)
    lcd.putstr(msg)

def show_message_3s(msg, temp, humi, light, soil):
    show_message(msg)
    time.sleep(3)
    show_sensor_lcd(temp, humi, light, soil)

# =======================
# GLOBAL SENSOR VALUES
# =======================
last_temp  = 0
last_humi  = 0
last_light = 0
last_soil  = 0

# =======================
# LED FUNCTIONS
# =======================
def set_all(color):
    for i in range(4):
        rgb.show(i, color)

def set_color_by_power(power):
    if power <= 25:
        color = (255, 0, 0)
    elif power <= 50:
        color = (255, 255, 0)
    elif power <= 75:
        color = (0, 255, 0)
    else:
        color = (0, 0, 255)
    set_all(color)

# =======================
# CONTROL HANDLERS
# =======================
def handle_led(state, power):
    global last_temp, last_humi, last_light, last_soil

    if state == 1:
        set_color_by_power(power)
        log("LED ON P={}".format(power))
        show_message_3s("LED ON P={}".format(power),
                        last_temp, last_humi, last_light, last_soil)
    else:
        set_all((0,0,0))
        log("LED OFF")
        show_message_3s("LED OFF",
                        last_temp, last_humi, last_light, last_soil)

def handle_pump(state, power):
    global last_temp, last_humi, last_light, last_soil

    if state == 1:
        duty = round(power / 100 * 1023)
        log("PUMP ON duty={}".format(duty))
        PUMP.write_analog(duty)
        show_message_3s("PUMP ON P={}".format(power),
                        last_temp, last_humi, last_light, last_soil)
    else:
        log("PUMP OFF")
        PUMP.write_analog(0)
        show_message_3s("PUMP OFF",
                        last_temp, last_humi, last_light, last_soil)

handlers = {
    FEED_LED: handle_led,
    FEED_PUMP: handle_pump
}

# =======================
# MQTT CALLBACK
# =======================
def callback(topic, msg):
    topic = topic.decode()
    msg = msg.decode()
    log("MQTT recv → {} : {}".format(topic, msg))

    parts = msg.split(":")
    if len(parts) != 3:
        log("Invalid MQTT format, expect SRC:state:power")
        return

    src, state, power = parts
    state = int(state)
    power = int(power)

    log("SRC={} STATE={} POWER={}".format(src, state, power))

    # ONLY BACKEND CAN CONTROL DEVICES
    if src == "BE":
        if topic in handlers:
            handlers[topic](state, power)
    else:
        log("IOT message → no control executed")

mqtt.set_callback(callback)
mqtt.subscribe(FEED_LED)
mqtt.subscribe(FEED_PUMP)
log("Subscribed LED + PUMP")

# =======================
# READ SENSOR ON STARTUP
# =======================
temperature = dht.dht20_temperature()
humidity    = dht.dht20_humidity()
light_value = LIGHT_PIN.read_analog()
soil_raw    = SOIL_PIN.read_analog()
soil_percent = int(soil_raw * 100 / 4095)

last_temp  = temperature
last_humi  = humidity
last_light = light_value
last_soil  = soil_percent

show_sensor_lcd(temperature, humidity, light_value, soil_percent)

# =======================
# MAIN LOOP
# =======================
last = time.ticks_ms()

while True:
    code = ir.get_code()
    
    if code:
        if code not in [IR_REMOTE_A, IR_REMOTE_B, IR_REMOTE_C, IR_REMOTE_D]:
            log("IR noise ignored ({})".format(code))
        else:
            if code == IR_REMOTE_A:
                log("Remote A → LED ON (local)")
                handle_led(1, 100)
                mqtt.publish(FEED_LED, "IOT:1:100")
    
            elif code == IR_REMOTE_B:
                log("Remote B → LED OFF (local)")
                handle_led(0, 0)
                mqtt.publish(FEED_LED, "IOT:0:0")
    
            elif code == IR_REMOTE_C:
                log("Remote C → PUMP ON (local)")
                handle_pump(1, 100)
                mqtt.publish(FEED_PUMP, "IOT:1:100")
    
            elif code == IR_REMOTE_D:
                log("Remote D → PUMP OFF (local)")
                handle_pump(0, 0)
                mqtt.publish(FEED_PUMP, "IOT:0:0")


    ir.clear_code()
    time.sleep_ms(20)

    mqtt.check_msg()

    # SEND SENSOR VALUES EVERY 15 SEC
    if time.ticks_diff(time.ticks_ms(), last) >= 15000:
        last = time.ticks_ms()

        try:
            temperature = dht.dht20_temperature()
            humidity    = dht.dht20_humidity()
        except:
            temperature = None
            humidity    = None

        light_value = LIGHT_PIN.read_analog()
        soil_raw = SOIL_PIN.read_analog()
        soil_percent = int(soil_raw * 100 / 4095)

        last_temp  = temperature
        last_humi  = humidity
        last_light = light_value
        last_soil  = soil_percent

        show_sensor_lcd(temperature, humidity, light_value, soil_percent)

        if temperature is not None:
            mqtt.publish(FEED_TEMP, str(temperature))
            mqtt.publish(FEED_HUMI, str(humidity))

        mqtt.publish(FEED_LIGHT, str(light_value))
        mqtt.publish(FEED_SOIL,  str(soil_percent))
