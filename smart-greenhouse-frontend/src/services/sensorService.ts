import axios from 'axios';
import { API_BASE } from '@/api';

export interface ISensor {
  id: number;
  sensorName: string;
  name: string;
  description: string;
  status: string;
}

export interface ICreateSensorRequest {
  sensorName: string;
  name: string;
  description: string;
  status: string;
}

export interface IUpdateSensorRequest {
  id: number;
  sensorName: string;
  name: string;
  description: string;
  status: string;
}

export interface IDeleteSensorRequest {
  id: number;
}

export interface IApiResponse<T> {
  EC: number;
  EM: string;
  DT: T;
}

class SensorService {
  private getAuthHeaders() {
    const identity = localStorage.getItem('identity');
    if (identity) {
      const parsed = JSON.parse(identity);
      return {
        Authorization: `Bearer ${parsed.access_token}`,
      };
    }
    return {};
  }

  async getAllSensors(): Promise<ISensor[]> {
    const response = await axios.get<IApiResponse<ISensor[]>>(
      `${API_BASE}/sensor/getAllSensor`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC === 0) {
      return response.data.DT;
    }
    throw new Error(response.data.EM);
  }

  async createSensor(data: ICreateSensorRequest): Promise<void> {
    const response = await axios.post<IApiResponse<string>>(
      `${API_BASE}/sensor/createSensor`,
      data,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC !== 0) {
      throw new Error(response.data.EM);
    }
  }

  async updateSensor(data: IUpdateSensorRequest): Promise<void> {
    const response = await axios.put<IApiResponse<string>>(
      `${API_BASE}/sensor/updateSensorInfor`,
      data,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC !== 0) {
      throw new Error(response.data.EM);
    }
  }

  async deleteSensor(data: IDeleteSensorRequest): Promise<void> {
    const response = await axios.delete<IApiResponse<string>>(
      `${API_BASE}/sensor/deleteSensor`,
      {
        data,
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC !== 0) {
      throw new Error(response.data.EM);
    }
  }

  async getNewSensorFeedName(): Promise<string[]> {
    const response = await axios.get<IApiResponse<string[]>>(
      `${API_BASE}/sensor/getNewSensorFeedName`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC === 0) {
      return response.data.DT;
    }
    throw new Error(response.data.EM);
  }
}

export default new SensorService();

