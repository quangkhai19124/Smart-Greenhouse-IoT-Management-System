from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

# Load models
pump_clf = joblib.load("pump_switch.pkl")
pump_power_reg = joblib.load("pump_power.pkl")
pump_duration_reg = joblib.load("pump_duration.pkl")

light_switch_clf = joblib.load("light_switch.pkl")
light_power_reg = joblib.load("light_power.pkl")
light_duration_reg = joblib.load("light_duration.pkl")


@app.post("/predict")
def predict(data: dict):

    sample = pd.DataFrame([{
        "temperature": data["temperature"],
        "humidity": data["humidity"],
        "soil_moisture": data["soil_moisture"],
        "light": data["light"]
    }])

    # PUMP
    pump = int(pump_clf.predict(sample)[0])
    if pump == 1:
        pump_power = float(pump_power_reg.predict(sample)[0])
        pump_duration = float(pump_duration_reg.predict(sample)[0])
    else:
        pump_power = 0
        pump_duration = 0

    # LIGHT
    light = int(light_switch_clf.predict(sample)[0])
    if light == 1:
        light_power = float(light_power_reg.predict(sample)[0])
        light_duration = float(light_duration_reg.predict(sample)[0])
    else:
        light_power = 0
        light_duration = 0

    return {
        "pump": pump,
        "pump_power": pump_power,
        "pump_duration": pump_duration,
        "light": light,
        "light_power": light_power,
        "light_duration": light_duration
    }

