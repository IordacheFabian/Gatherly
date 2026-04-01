import type {
  Activity,
  BaseActivityForm,
  PageList,
  UserInfo,
  RegisterForm,
  LoginForm,
  UserProfile,
  Photo,
} from "@/lib/types";

const API_BASE = "";

class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = init.body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const fieldErrors =
      typeof payload === "object" && payload !== null && "errors" in payload
        ? (payload as { errors?: Record<string, string[]> }).errors
        : undefined;
    const message =
      typeof payload === "string"
        ? payload
        : fieldErrors
          ? Object.values(fieldErrors)[0]?.[0] || "Validation failed"
        : (payload as { title?: string; detail?: string })?.detail ||
          (payload as { title?: string })?.title ||
          "Request failed";
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const accountApi = {
  register: (data: RegisterForm) =>
    request<void>("/api/account/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: LoginForm) =>
    request<void>("/api/login?useCookies=true", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () =>
    request<void>("/api/account/logout", {
      method: "POST",
    }),
  getUserInfo: async () => {
    const response = await fetch("/api/account/user-info", {
      credentials: "include",
    });

    if (response.status === 204) return null;
    if (!response.ok) return null;

    return (await response.json()) as UserInfo;
  },
};

export const activitiesApi = {
  list: (cursor?: string | null) => {
    const url = cursor
      ? `/api/activities?cursor=${encodeURIComponent(cursor)}`
      : "/api/activities";
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
  uploadPhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/activities/${id}/photo`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(text || "Failed to upload activity photo", response.status);
    }

    return response.json() as Promise<{ publicId: string; url: string }>;
  },
};

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
  addPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/profiles/add-photo", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload photo");
    return (await response.json()) as Photo;
  },
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
};

export { ApiError };
