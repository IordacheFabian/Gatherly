import type { LoginForm, RegisterForm, UserInfo } from "@/lib/types";
import { API_BASE, request } from "./base";

export const accountApi = {
  register: (data: RegisterForm) =>
    request<void>("/api/account/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: LoginForm) =>
    request<void>("/api/account/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  confirmEmail: (userId: string, token: string) =>
    request<{ message: string }>("/api/account/confirm-email", {
      method: "POST",
      body: JSON.stringify({ userId, token }),
    }),
  deleteAccount: (password: string) =>
    request<{ message: string }>("/api/account/delete-account", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () =>
    request<void>("/api/account/logout", {
      method: "POST",
    }),
  getUserInfo: async () => {
    const response = await fetch(`${API_BASE}/api/account/user-info`, {
      credentials: "include",
    });
    if (response.status === 204) return null;
    if (!response.ok) return null;
    return (await response.json()) as UserInfo;
  },
};
