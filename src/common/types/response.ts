export interface IResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message?: string | null;
  data?: T;
}
