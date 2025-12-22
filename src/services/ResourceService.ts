import Resource from "../models/ResourceModel";
import { IResource } from "../interfaces/ResourceInterface";
import { QueryBuilder } from "../utilities/QueryBuilder";

class ResourceService {
  async createResource(data: IResource): Promise<IResource | null> {
    try {
      return await Resource.create(data);
    } catch (error) {
      console.error("Error creating resource (ResourceService):", error);
      return null;
    }
  }

  /**
   * Get all resources with pagination and filters
   */
  async getAllResources(
    page: number = 1,
    limit: number = 10,
    filters: {
      country?: string;
      resourceType?: string;
      department?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {}
  ) {
    try {
      const queryBuilder = new QueryBuilder<IResource>(Resource);

      // Apply filters
      const filterObj: any = {};
      if (filters.country) filterObj.country = filters.country;
      if (filters.resourceType) filterObj.resourceType = filters.resourceType;
      if (filters.department) filterObj.department = filters.department;

      queryBuilder
        .filter(filterObj)
        .search(filters.search, ["title", "description"])
        .sort(filters.sortBy || "createdAt", filters.sortOrder || "desc")
        .paginate(page, limit)
        .populate({ path: "createdBy", select: "fullName email" } as any);

      const result = await queryBuilder.execute();

      return {
        resources: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      console.error("Error getting resources (ResourceService):", error);
      return null;
    }
  }

  /**
   * Get a single resource by ID
   */
  async getResourceById(resourceId: string): Promise<IResource | null> {
    try {
      const resource = await Resource.findById(resourceId).populate(
        "createdBy",
        "fullName email"
      );
      return resource;
    } catch (error) {
      console.error("Error getting resource by ID (ResourceService):", error);
      return null;
    }
  }

  /**
   * Update a resource
   */
  async updateResource(
    resourceId: string,
    updates: {
      title?: string;
      resourceType?: string;
      country?: string;
      description?: string;
      images?: string[];
    }
  ): Promise<IResource | null> {
    try {
      const resource = await Resource.findByIdAndUpdate(
        resourceId,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate("createdBy", "fullName email");
      return resource;
    } catch (error) {
      console.error("Error updating resource (ResourceService):", error);
      return null;
    }
  }

  /**
   * Delete a resource
   */
  async deleteResource(resourceId: string): Promise<boolean> {
    try {
      const result = await Resource.findByIdAndDelete(resourceId);
      return !!result;
    } catch (error) {
      console.error("Error deleting resource (ResourceService):", error);
      return false;
    }
  }
}

export default new ResourceService();
