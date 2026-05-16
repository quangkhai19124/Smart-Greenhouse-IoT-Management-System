import axios from 'axios';
import { API_BASE } from '@/api';

export interface IUser {
  id: number;
  email: string;
  username: string;
  role: string;
  status: string;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
  username: string;
  role: string;
  status: string;
}

export interface IUpdateUserRequest {
  email: string;
  username: string;
  role: string;
  status: string;
}

export interface IDeleteUserRequest {
  email: string;
}

export interface IApiResponse<T> {
  EC: number;
  EM: string;
  DT: T;
}

class UserService {
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

  async getAllUsers(): Promise<IUser[]> {
    const response = await axios.get<IApiResponse<IUser[]>>(
      `${API_BASE}/allUser`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC === 0) {
      return response.data.DT;
    }
    throw new Error(response.data.EM);
  }

  async createUser(data: ICreateUserRequest): Promise<void> {
    const response = await axios.post<IApiResponse<string>>(
      `${API_BASE}/admin/createNewUser`,
      data,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC !== 0) {
      throw new Error(response.data.EM);
    }
  }

  async updateUser(data: IUpdateUserRequest): Promise<void> {
    const response = await axios.put<IApiResponse<string>>(
      `${API_BASE}/admin/editUserInfor`,
      data,
      {
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC !== 0) {
      throw new Error(response.data.EM);
    }
  }

  async deleteUser(data: IDeleteUserRequest): Promise<void> {
    const response = await axios.delete<IApiResponse<string>>(
      `${API_BASE}/deleteUser`,
      {
        data,
        headers: this.getAuthHeaders(),
      }
    );
    
    if (response.data.EC !== 0) {
      throw new Error(response.data.EM);
    }
  }
}

export default new UserService();

