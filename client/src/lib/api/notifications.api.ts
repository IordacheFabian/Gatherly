import type { Notification } from "@/lib/types";
import { request } from "./base";

export const notificationsApi = {
  list: (limit = 50) => request<Notification[]>(`/api/notifications?limit=${limit}`),
  markRead: (id: string) =>
    request<void>(`/api/notifications/${id}/read`, {
      method: "PUT",
    }),
  markAllRead: () =>
    request<void>("/api/notifications/read-all", {
      method: "PUT",
    }),
};
