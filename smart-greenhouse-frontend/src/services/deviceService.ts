import axios from 'axios';
import { API_BASE } from '@/api';

export interface IDevice {
  id: number;
  adaDevName: string;
  deviceName: string;
  description: string;
  status: string;
  mode?: string;
}

export interface ICreateDeviceRequest {
  adaDevName: string;
  deviceName: string;
  description: string;
  status: string;
  mode: string;
}

export interface IUpdateDeviceRequest {
  id: number;
  adaDevName: string;
  deviceName: string;
  description: string;
  status: string;
}

export interface IDeleteDeviceRequest {
  adaDevName: string;
}

export interface IApiResponse<T> {
  EC: number;
  EM: string;
  DT: T;
}

class DeviceService {
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

  async getAllDevices(page?: number, limit?: number): Promise<IDevice[]> {
    let url = `${API_BASE}/device/getAllDevice`;
    if (page && limit) {
      url += `?page=${page}&limit=${limit}`;
    }
    
    const response = await axios.get<IApiResponse<IDevice[]>>(url, {
      headers: this.getAuthHeaders(),
    });
    
    if (response.data.EC === 0) {
      return response.data.DT;
    }
    throw new Error(response.data.EM);
  }

  async createDevice(data: ICreateDeviceRequest): Promise<IDevice> {
    const response = await axios.post<IApiResponse<IDevice>>(
      `${API_BASE}/device/createNewDevice`,
      data,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC === 0) {
      return response.data.DT;
    }
    throw new Error(response.data.EM);
  }

  async updateDevice(data: IUpdateDeviceRequest): Promise<void> {
    const response = await axios.put<IApiResponse<string>>(
      `${API_BASE}/device/editDeviceInfor`,
      data,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC !== 0) {
      throw new Error(response.data.EM);
    }
  }

  async deleteDevice(data: IDeleteDeviceRequest): Promise<void> {
    const response = await axios.delete<IApiResponse<string>>(
      `${API_BASE}/device/deleteDevice`,
      {
        data,
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC !== 0) {
      throw new Error(response.data.EM);
    }
  }

  async getNewDeviceFeedName(): Promise<string[]> {
    const response = await axios.get<IApiResponse<string[]>>(
      `${API_BASE}/device/getNewDeviceFeedName`,
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

export default new DeviceService();

