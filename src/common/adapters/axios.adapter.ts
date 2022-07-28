import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { HttpAdaptar } from '../interfaces/http-adapter.interface';

@Injectable()
export class AxiosAdapter implements HttpAdaptar {
  private axios: AxiosInstance = axios;
  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await axios.get<T>(url);
      return data;
    } catch (error) {
      console.log(error);
      throw new Error('This is an error - Check logs');
    }
  }
}
