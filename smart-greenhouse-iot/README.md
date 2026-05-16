# Smart Greenhouse IoT

This project is a smart greenhouse system using Yolobit and various sensors to monitor and control environmental conditions. It connects to WiFi and Adafruit IO for remote monitoring and control via MQTT.

## Features
- Monitors temperature, humidity, light, and soil moisture
- Controls RGB LED and water pump
- Displays sensor data on LCD
- Supports IR remote for local control
- Publishes sensor data to Adafruit IO feeds
- Receives control commands via MQTT

## Hardware Requirements
- Yolobit board
- DHT20 temperature & humidity sensor
- Light sensor (analog)
- Soil moisture sensor (analog)
- RGB LED (4 channels)
- Water pump (PWM control)
- LCD1602 display
- IR receiver

## Software Requirements
- Yolobit MicroPython libraries:
  - yolobit
  - yolobit_wifi
  - aiot_rgbled
  - aiot_dht20
  - aiot_lcd1602
  - aiot_ir_receiver
  - umqtt.simple
- Adafruit IO account (for MQTT)

## Setup
1. Connect all hardware modules to the Yolobit board as specified in the code.
2. Update WiFi credentials in `main..py`:
   ```python
   wifi.connect_wifi("<SSID>", "<PASSWORD>")
   ```
3. Set your Adafruit IO username and key in `main..py`:
   ```python
   AIO_USERNAME = "<your_username>"
   AIO_KEY = "<your_aio_key>"
   ```
4. Upload `main..py` to the Yolobit board.
5. Power on the system. The LCD will display sensor readings and status messages.

## Usage
- Use the IR remote to control LED and pump locally:
  - A: LED ON
  - B: LED OFF
  - C: Pump ON
  - D: Pump OFF
- Sensor data is sent to Adafruit IO every 15 seconds.
- You can control the LED and pump remotely by publishing messages to the respective Adafruit IO feeds.

## MQTT Message Format
Control messages must follow the format:
```
SRC:state:power
```
- `SRC`: "BE" for backend control, "IOT" for local control
- `state`: 1 (ON) or 0 (OFF)
- `power`: 0-100 (percentage)

Example:
```
BE:1:100
```

## License
MIT
