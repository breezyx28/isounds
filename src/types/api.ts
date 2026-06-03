export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
}
