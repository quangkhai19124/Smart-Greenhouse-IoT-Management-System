export interface Device {
  id: string;
  name: string;
  description: string;
  mode: string;
  status: boolean;
}

export interface ILogData {
  id: number;
  dev_Id: number;
  time: string;
  description: string;
  value: string;
  mode: string;
}

export interface IDeviceDashboardData {
  id: number;
  deviceName: string;
  description: string;
  status: string;
  mode: string;
  updatedAt: string;
}

export interface IToggleDeviceParams {
  id: number;
}

export interface IDeviceStatusData {
  id: number;
  deviceName: string;
  adaDevName: string;
  status: string;
  power: string;
  runtimeLog: string;
}

export interface IResDeviceDataLogs {
  logs: ILogData[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface IResDeviceToggleCount {
  date: string;
  onCount: number;
  offCount: number;
}

export interface IResDeviceSetting {
  id: number;
  description: string;
  deviceName: string;
  power: number;
  adaDevName: string;
  status: string;
  mode: string;
  setRule: ISetRule[];
  schedules: ISchedule[];
}

export interface ISetRule {
  id: number;
  power: number;
  status: string;
  rules: IRule[];
}

export interface IRule {
  id: number;
  setID: number;
  operator: string;
  condition: number;
}

export interface ISchedule {
  id: number;
  timeStart: string;
  timeEnd: string;
  actionDay: string;
  status: string;
  power: number;
}

export interface IChangeModeParams {
  id: number | undefined;
  mode: string;
}

export interface IResChangeMode {
  EM: string;
  EC: number;
}