import { LogicOperator, Operator } from "@/utils/enums";

export interface IObservationData {
  id: string;
  name: string;
  description: string;
  level: string;
}

export interface ISensorData {
    id: number;
    sensorName: string;
    name: string;
    description: string;
    status: string;
}

export interface ISensorDetailData {
    sensorName: string;
    name: string;
    description: string;
    maxValue: number;
    minValue: number;
    avgValue: number;
}

export interface IDailySensorData {
    date: string;
    averageValue: string;
}

export interface ISensorDataLogs {
    id: number;
    SDsensorId: number;
    SDataId: number;
    time: string;
    value: number;
}

export interface IResSensorLogs {
  logs: ISensorDataLogs[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface INotificationRules {
  id: number;
  logicOperator: LogicOperator | null;
  operator: Operator;
  condition: number;
}