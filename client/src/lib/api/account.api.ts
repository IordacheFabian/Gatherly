import type { LoginForm, RegisterForm, UserInfo } from "@/lib/types";
import { apiClient, getApiErrorMessage } from "./client";

export const accountApi = {
  register: async (data: RegisterForm): Promise<void> => {
    try {
      await apiClient.post("/api/account/register", data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Registration failed"));
    }
  },

  login: async (data: LoginForm): Promise<void> => {
    try {
      await apiClient.post("/api/account/login", data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Login failed"));
    }
  },

  confirmEmail: async (userId: string, token: string): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post<{ message: string }>("/api/account/confirm-email", { userId, token });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Email confirmation failed"));
    }
  },

  deleteAccount: async (password: string): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post<{ message: string }>("/api/account/delete-account", { password });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to delete account"));
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/api/account/logout");
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Logout failed"));
    }
  },

  getUserInfo: async (): Promise<UserInfo | null> => {
    try {
      const { data } = await apiClient.get<UserInfo>("/api/account/user-info");
      return data ?? null;
    } catch {
      return null;
    }
  },
};
