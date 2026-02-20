export interface AppError {
  code: string;
  message: string;
  status?: number;
  timestamp?: string;
  details?: any;
}
