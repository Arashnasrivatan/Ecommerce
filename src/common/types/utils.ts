export interface IPaginationData {
  page: number;
  limit: number;
  totalPage: number;
  [key: string]: number;
}