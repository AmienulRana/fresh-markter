
export interface RawPagination {
  page?: number
  current_page?: number
  total_count?: number
  per_page?: number
  total_page?: number
  total_pages?: number
}

export interface ApiEnvelope<T> {
  message?: string
  data: T
  pagination?: RawPagination
}

export interface Pagination {
  page: number
  perPage: number
  totalCount: number
  totalPages: number
}

export interface Paginated<T> {
  items: T[]
  pagination: Pagination
}

export interface ListParams {
  search?: string
  page?: number
  limit?: number
  orderBy?: string
  orderType?: 'asc' | 'desc'
}

export interface HealthStatus {
  status?: string
  message?: string
}
