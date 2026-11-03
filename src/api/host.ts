import { apiClient } from "./client";
import type { HostEvent, CreateEventInput, CreateEventResponse } from "./types";


// Loads the logged-in host's events and their seats
export async function getMyEvents(): Promise<{ events: HostEvent[] }> {
  const response = await apiClient.get<{ events: HostEvent[] }>("/events/mine");
  return response.data;
}

// Approve (CONFIRMED) or decline (DECLINED) a pending seat
export async function updateSeatStatus(seatId: string, status: "CONFIRMED" | "DECLINED") {
  const response = await apiClient.patch(`/seats/${seatId}`, { status });
  return response.data;
}

// Creates a new event for the logged-in host
export async function createEvent(input: CreateEventInput): Promise<CreateEventResponse> {
  const response = await apiClient.post<CreateEventResponse>("/events", input);
  return response.data;
}