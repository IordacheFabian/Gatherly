import type {
  Activity,
  ActivityReview,
  BaseActivityForm,
  CheckoutSession,
  PageList,
  WishlistGroup,
} from "@/lib/types";
import { apiClient, getApiErrorMessage, uploadFile } from "./client";

export const activitiesApi = {
  list: async (cursor?: string | null): Promise<PageList<Activity, string>> => {
    try {
      const url = cursor
        ? `/api/activities?cursor=${encodeURIComponent(cursor)}&pageSize=10`
        : "/api/activities?pageSize=10";
      const { data } = await apiClient.get<PageList<Activity, string>>(url);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load activities"));
    }
  },

  details: async (id: string): Promise<Activity> => {
    try {
      const { data } = await apiClient.get<Activity>(`/api/activities/${id}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load activity"));
    }
  },

  create: async (activity: BaseActivityForm): Promise<string> => {
    try {
      const { data } = await apiClient.post<string>("/api/activities", activity);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create activity"));
    }
  },

  edit: async (id: string, activity: BaseActivityForm): Promise<void> => {
    try {
      await apiClient.put(`/api/activities/${id}`, { ...activity, id });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update activity"));
    }
  },

  remove: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/activities/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete activity"));
    }
  },

  toggleAttendance: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/api/activities/${id}/attend`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update attendance"));
    }
  },

  approveBooking: async (activityId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/activities/${activityId}/bookings/${userId}/approve`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to approve booking"));
    }
  },

  rejectBooking: async (activityId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/activities/${activityId}/bookings/${userId}/reject`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to reject booking"));
    }
  },

  mockCheckout: async (activityId: string): Promise<CheckoutSession> => {
    try {
      const { data } = await apiClient.post<CheckoutSession>(`/api/activities/${activityId}/checkout/mock`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Checkout failed"));
    }
  },

  getReviews: async (activityId: string, limit = 100): Promise<ActivityReview[]> => {
    try {
      const { data } = await apiClient.get<ActivityReview[]>(`/api/activities/${activityId}/reviews?limit=${limit}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load reviews"));
    }
  },

  addOrUpdateReview: async (
    activityId: string,
    payload: { rating: number; body: string },
  ): Promise<ActivityReview> => {
    try {
      const { data } = await apiClient.post<ActivityReview>(`/api/activities/${activityId}/reviews`, payload);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to submit review"));
    }
  },

  uploadPhoto: async (id: string, file: File): Promise<{ publicId: string; url: string }> => {
    try {
      return await uploadFile<{ publicId: string; url: string }>(`/api/activities/${id}/photo`, file);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to upload photo"));
    }
  },

  toggleSaved: async (activityId: string): Promise<{ isSaved: boolean }> => {
    try {
      const { data } = await apiClient.post<{ isSaved: boolean }>(`/api/activities/${activityId}/save`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update saved status"));
    }
  },

  getSavedActivities: async (): Promise<Activity[]> => {
    try {
      const { data } = await apiClient.get<Activity[]>("/api/activities/saved");
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load saved activities"));
    }
  },

  addToWishlist: async (activityId: string, wishlistName: string): Promise<void> => {
    try {
      await apiClient.post(`/api/activities/${activityId}/wishlists`, { wishlistName });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to add to wishlist"));
    }
  },

  removeFromWishlist: async (activityId: string, wishlistName: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/activities/${activityId}/wishlists/${encodeURIComponent(wishlistName)}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to remove from wishlist"));
    }
  },

  getWishlists: async (): Promise<WishlistGroup[]> => {
    try {
      const { data } = await apiClient.get<WishlistGroup[]>("/api/activities/wishlists");
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load wishlists"));
    }
  },

  trackView: async (activityId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/activities/${activityId}/view`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to track view"));
    }
  },

  getRecentlyViewed: async (limit = 20): Promise<Activity[]> => {
    try {
      const { data } = await apiClient.get<Activity[]>(`/api/activities/recently-viewed?limit=${limit}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load recently viewed"));
    }
  },

  getRecommended: async (limit = 12): Promise<Activity[]> => {
    try {
      const { data } = await apiClient.get<Activity[]>(`/api/activities/recommended?limit=${limit}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load recommendations"));
    }
  },
};
