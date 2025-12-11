export interface CreateUserQueryParams {
  loginAfterCreate?: boolean;
}

export type DateFilter = "today" | "thisWeek" | "thisMonth";

export interface IQuery {
  role?: string;
  isAffiliate?: boolean;
  isActive?: boolean;
  status?: string;
  search?: string;
  searchFields?: string[];
  filter?: Record<string, any>;
  sort?: string;
  type?: string;
  page?: number;
  limit?: number;
  dateFilter?: DateFilter;
  includeStats?: boolean | "true";
}
