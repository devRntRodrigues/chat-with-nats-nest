import type { AxiosRequestConfig } from 'axios';
import apiClient from './api';

export type ApiResponse<T, M = unknown> = {
  data: T;
  meta?: M;
};

export async function apiGet<T, M = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T, M>>(url, config);
  return data.data;
}

export async function apiPost<TRes, TBody = unknown, M = unknown>(
  url: string,
  body: TBody,
  config?: AxiosRequestConfig
): Promise<TRes> {
  const { data } = await apiClient.post<ApiResponse<TRes, M>>(url, body, config);
  return data.data;
}
