import type { Activity, HostReview, Photo, UserProfile } from "@/lib/types";
import { request, uploadFile } from "./base";

export const profilesApi = {
  getProfile: (userId: string) => request<UserProfile>(`/api/profiles/${userId}`),
  getActivities: (userId: string, predicate: "future" | "past" | "hosting") =>
    request<Activity[]>(`/api/profiles/${userId}/activities?predicate=${predicate}`),
  editProfile: (data: { displayName: string; bio?: string | null }) =>
    request<void>("/api/profiles", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getPhotos: (userId: string) => request<Photo[]>(`/api/profiles/${userId}/photos`),
  addPhoto: (file: File) => uploadFile<Photo>("/api/profiles/add-photo", file),
  deletePhoto: (photoId: string) =>
    request<void>(`/api/profiles/${photoId}/photos`, {
      method: "DELETE",
    }),
  setMainPhoto: (photoId: string) =>
    request<void>(`/api/profiles/${photoId}/setMain`, {
      method: "PUT",
    }),
  followToggle: (userId: string) =>
    request<void>(`/api/profiles/${userId}/follow`, {
      method: "POST",
    }),
  getFollowList: (userId: string, predicate: "followers" | "followings") =>
    request<UserProfile[]>(`/api/profiles/${userId}/follow-list?predicate=${predicate}`),
  getHostReviews: (userId: string, limit = 100) =>
    request<HostReview[]>(`/api/profiles/${userId}/reviews?limit=${limit}`),
};
