import type {
  Activity,
  ActivityReview,
  BaseActivityForm,
  CheckoutSession,
  PageList,
  WishlistGroup,
} from "@/lib/types";
import { request, uploadFile } from "./base";

export const activitiesApi = {
  list: (cursor?: string | null) => {
    const url = cursor
      ? `/api/activities?cursor=${encodeURIComponent(cursor)}&pageSize=10`
      : "/api/activities?pageSize=10";
    return request<PageList<Activity, string>>(url);
  },
  details: (id: string) => request<Activity>(`/api/activities/${id}`),
  create: (activity: BaseActivityForm) =>
    request<string>("/api/activities", {
      method: "POST",
      body: JSON.stringify(activity),
    }),
  edit: (id: string, activity: BaseActivityForm) =>
    request<void>(`/api/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...activity, id }),
    }),
  remove: (id: string) =>
    request<void>(`/api/activities/${id}`, {
      method: "DELETE",
    }),
  toggleAttendance: (id: string) =>
    request<void>(`/api/activities/${id}/attend`, {
      method: "POST",
    }),
  approveBooking: (activityId: string, userId: string) =>
    request<void>(`/api/activities/${activityId}/bookings/${userId}/approve`, {
      method: "POST",
    }),
  rejectBooking: (activityId: string, userId: string) =>
    request<void>(`/api/activities/${activityId}/bookings/${userId}/reject`, {
      method: "POST",
    }),
  mockCheckout: (activityId: string) =>
    request<CheckoutSession>(`/api/activities/${activityId}/checkout/mock`, {
      method: "POST",
    }),
  getReviews: (activityId: string, limit = 100) =>
    request<ActivityReview[]>(`/api/activities/${activityId}/reviews?limit=${limit}`),
  addOrUpdateReview: (activityId: string, payload: { rating: number; body: string }) =>
    request<ActivityReview>(`/api/activities/${activityId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadPhoto: (id: string, file: File) =>
    uploadFile<{ publicId: string; url: string }>(`/api/activities/${id}/photo`, file),
  toggleSaved: (activityId: string) =>
    request<{ isSaved: boolean }>(`/api/activities/${activityId}/save`, {
      method: "POST",
    }),
  getSavedActivities: () => request<Activity[]>("/api/activities/saved"),
  addToWishlist: (activityId: string, wishlistName: string) =>
    request<void>(`/api/activities/${activityId}/wishlists`, {
      method: "POST",
      body: JSON.stringify({ wishlistName }),
    }),
  removeFromWishlist: (activityId: string, wishlistName: string) =>
    request<void>(
      `/api/activities/${activityId}/wishlists/${encodeURIComponent(wishlistName)}`,
      {
        method: "DELETE",
      },
    ),
  getWishlists: () => request<WishlistGroup[]>("/api/activities/wishlists"),
  trackView: (activityId: string) =>
    request<void>(`/api/activities/${activityId}/view`, {
      method: "POST",
    }),
  getRecentlyViewed: (limit = 20) =>
    request<Activity[]>(`/api/activities/recently-viewed?limit=${limit}`),
  getRecommended: (limit = 12) =>
    request<Activity[]>(`/api/activities/recommended?limit=${limit}`),
};
