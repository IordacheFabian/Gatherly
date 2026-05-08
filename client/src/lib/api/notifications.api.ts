import type { Notification } from "@/lib/types";
import { apiClient, getApiErrorMessage } from "./client";

export const notificationsApi = {
  list: async (limit = 50): Promise<Notification[]> => {
    try {
      const { data } = await apiClient.get<Notification[]>(`/api/notifications?limit=${limit}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to load notifications"));
    }
  },

  markRead: async (id: string): Promise<void> => {
    try {
      await apiClient.put(`/api/notifications/${id}/read`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to mark notification as read"));
    }
  },

  markAllRead: async (): Promise<void> => {
    try {
      await apiClient.put("/api/notifications/read-all");
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to mark all notifications as read"));
    }
  },
};
