import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { HttpCode } from './const';
import { Token } from './utils';

const BACKEND_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000';
const REQUEST_TIMEOUT = 5000;

export const createAPI = (): AxiosInstance => {
  const api = axios.create({
    baseURL: BACKEND_URL,
    timeout: REQUEST_TIMEOUT,
  });

  api.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      const token = Token.get();

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ error?: string }>) => {
      if (error.response?.status === HttpCode.NoAuth && Token.get()) {
        Token.drop();
      }

      toast.dismiss();
      const message = error.response?.data?.error ?? error.message;
      toast.warn(message);

      return Promise.reject(error);
    }
  );

  return api;
};
