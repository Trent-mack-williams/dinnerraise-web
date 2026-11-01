import { apiClient } from "./client";
import type { LoginResponse } from "./types";
import type { GuestEmailResponse } from "./types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
}

// Finds or creates a guest by email. No password, no token
export async function signInGuest(email: string): Promise<GuestEmailResponse> {
  const response = await apiClient.post<GuestEmailResponse>("/auth/guest-email", { email });
  return response.data;
}