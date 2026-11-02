import { apiClient } from "./client";
import type { EventsResponse } from "./types";

// Fetches all upcoming events. Public, no login needed
export async function getEvents(): Promise<EventsResponse> {
  const response = await apiClient.get<EventsResponse>("/events");
  return response.data;
}