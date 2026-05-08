import type { Activity, HostReview, Photo, UserProfile } from "@/lib/types";
import { apiClient, getApiErrorMessage, uploadFile } from "./client";

export const profilesApi = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const { data } = await apiClient.get<UserProfile>(`/api/profiles/${userId}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load profile"));
    }
  },

  getActivities: async (
    userId: string,
    predicate: "future" | "past" | "hosting",
  ): Promise<Activity[]> => {
    try {
      const { data } = await apiClient.get<Activity[]>(
        `/api/profiles/${userId}/activities?predicate=${predicate}`,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load profile activities"));
    }
  },

  editProfile: async (payload: { displayName: string; bio?: string | null }): Promise<void> => {
    try {
      await apiClient.put("/api/profiles", payload);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update profile"));
    }
  },

  getPhotos: async (userId: string): Promise<Photo[]> => {
    try {
      const { data } = await apiClient.get<Photo[]>(`/api/profiles/${userId}/photos`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load photos"));
    }
  },

  addPhoto: async (file: File): Promise<Photo> => {
    try {
      return await uploadFile<Photo>("/api/profiles/add-photo", file);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to upload photo"));
    }
  },

  deletePhoto: async (photoId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/profiles/${photoId}/photos`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete photo"));
    }
  },

  setMainPhoto: async (photoId: string): Promise<void> => {
    try {
      await apiClient.put(`/api/profiles/${photoId}/setMain`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to set main photo"));
    }
  },

  followToggle: async (userId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/profiles/${userId}/follow`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update follow status"));
    }
  },

  getFollowList: async (
    userId: string,
    predicate: "followers" | "followings",
  ): Promise<UserProfile[]> => {
    try {
      const { data } = await apiClient.get<UserProfile[]>(
        `/api/profiles/${userId}/follow-list?predicate=${predicate}`,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load follow list"));
    }
  },

  getHostReviews: async (userId: string, limit = 100): Promise<HostReview[]> => {
    try {
      const { data } = await apiClient.get<HostReview[]>(
        `/api/profiles/${userId}/reviews?limit=${limit}`,
      );
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load host reviews"));
    }
  },
};
