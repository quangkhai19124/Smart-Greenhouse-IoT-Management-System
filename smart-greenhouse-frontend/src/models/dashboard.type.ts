export interface IResponseSensorsData {
    sensorName: string;
    value: number;
    time: string;
}

export interface IHourlyAvgData {
    time: string;
    dht20humi: number;
    dht20temp: number;
    lightsensor: number;
    soilhumi: number;
}