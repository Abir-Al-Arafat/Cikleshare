import { FilterQuery, Model, Document } from "mongoose";

export interface IPaginationOptions {
  page?: number;
  limit?: number;
}

export interface ISortOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IFilterOptions {
  [key: string]: any;
}

export interface ISearchOptions {
  searchFields?: string[];
  searchTerm?: string;
}

export interface IQueryOptions
  extends IPaginationOptions,
    ISortOptions,
    ISearchOptions {
  filters?: IFilterOptions;
  populate?: string | string[];
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Generic query builder for MongoDB with pagination, search, filter, and sort
 */
export class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private query: FilterQuery<T> = {};
  private sortOptions: any = { createdAt: -1 };
  private populateFields: string | string[] = "";
  private page: number = 1;
  private limit: number = 10;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Add filters to query
   */
  filter(filters: IFilterOptions): this {
    if (filters && Object.keys(filters).length > 0) {
      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== undefined &&
          filters[key] !== null &&
          filters[key] !== ""
        ) {
          (this.query as any)[key] = filters[key];
        }
      });
    }
    return this;
  }

  /**
   * Add text search to query
   */
  search(searchTerm?: string, searchFields?: string[]): this {
    if (searchTerm && searchFields && searchFields.length > 0) {
      const searchQuery = searchFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })) as FilterQuery<T>[];
      this.query.$or = searchQuery;
    } else if (searchTerm) {
      // Use text index search if no specific fields provided
      this.query.$text = { $search: searchTerm };
    }
    return this;
  }

  /**
   * Add sorting to query
   */
  sort(sortBy?: string, sortOrder?: "asc" | "desc"): this {
    if (sortBy) {
      this.sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    }
    return this;
  }

  /**
   * Add pagination to query
   */
  paginate(page?: number, limit?: number): this {
    this.page = page && page > 0 ? page : 1;
    this.limit = limit && limit > 0 ? limit : 10;
    return this;
  }

  /**
   * Add population to query
   */
  populate(fields: string | string[]): this {
    this.populateFields = fields;
    return this;
  }

  /**
   * Execute query and return paginated results
   */
  async execute(): Promise<IPaginationResult<T>> {
    const skip = (this.page - 1) * this.limit;

    const [data, total] = await Promise.all([
      this.model
        .find(this.query)
        .sort(this.sortOptions)
        .skip(skip)
        .limit(this.limit)
        .populate(this.populateFields as any),
      this.model.countDocuments(this.query),
    ]);

    const totalPages = Math.ceil(total / this.limit);

    return {
      data,
      pagination: {
        total,
        page: this.page,
        limit: this.limit,
        totalPages,
        hasNextPage: this.page < totalPages,
        hasPrevPage: this.page > 1,
      },
    };
  }

  /**
   * Execute query without pagination
   */
  async executeWithoutPagination(): Promise<T[]> {
    return await this.model
      .find(this.query)
      .sort(this.sortOptions)
      .populate(this.populateFields as any);
  }
}

/**
 * Helper function to build query from request query params
 */
export const buildQueryFromRequest = (queryParams: any): IQueryOptions => {
  const options: IQueryOptions = {
    page: parseInt(queryParams.page) || 1,
    limit: parseInt(queryParams.limit) || 10,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder === "asc" ? "asc" : "desc",
    searchTerm: queryParams.search || queryParams.searchTerm,
    searchFields: queryParams.searchFields
      ? queryParams.searchFields.split(",")
      : undefined,
    filters: {},
  };

  // Extract filters (any param that's not a special query param)
  const specialParams = [
    "page",
    "limit",
    "sortBy",
    "sortOrder",
    "search",
    "searchTerm",
    "searchFields",
    "populate",
  ];

  Object.keys(queryParams).forEach((key) => {
    if (!specialParams.includes(key) && queryParams[key]) {
      options.filters![key] = queryParams[key];
    }
  });

  if (queryParams.populate) {
    options.populate = queryParams.populate.split(",");
  }

  return options;
};
