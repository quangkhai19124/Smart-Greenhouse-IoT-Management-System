import { API_BASE_URL } from "@/api";
import { IHourlyAvgData, IResponseSensorsData } from "@/models/dashboard.type";
import { io, Socket } from "socket.io-client";

class DashboardService {
    private socket: Socket | null;

    constructor() {
        this.socket = null;
    }

    connect(): void {
        if (!this.socket) {
            this.socket = io(API_BASE_URL);

            this.socket.on("connect", () => {
                console.log("Connected:", this.socket?.id);
            });

            this.socket.on("disconnect", () => {
                console.log("Disconnected from server");
            });
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    sensorData(callback: (data: IResponseSensorsData) => void): void {
        if( this.socket ) {
            this.socket.on("sensorData", callback);
        }
    }

    onSensorHourlyAvg(callback: (data: IHourlyAvgData[]) => void): void {
        if( this.socket ) {
            this.socket.on("sensorHourlyAvg", callback);
        }
    }

    onSensorLatestData(callback: (data: IResponseSensorsData[]) => void): void {
        if( this.socket ) {
            this.socket.on("sensorLatestData", callback);
        }
    }
}

export default DashboardService;
