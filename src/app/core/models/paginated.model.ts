export interface PaginatedResult<T> {
  offset: number;
  size: number;
  count: number;
  data: T[];
}
