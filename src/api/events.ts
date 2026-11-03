import { apiClient } from "./client";
import type { Event, EventsResponse, SeatRequestResponse } from "./types";

// Fetches all upcoming events. Public, no login needed
export async function getEvents(): Promise<EventsResponse> {
  const response = await apiClient.get<EventsResponse>("/events");
  return response.data;
}

export interface SeatRequestInput {
  guestName: string;
  guestEmail: string;
  dietaryRestrictions: string[];
}

// Requests a seat at an event. Creates a PENDING seat for the host to approve
export async function requestSeat(eventId: string, input: SeatRequestInput): Promise<SeatRequestResponse> {
  const response = await apiClient.post<SeatRequestResponse>(`/events/${eventId}/seats`, input);
  return response.data;
}

// Fetches one event. Pass the invite token for private events
export async function getEvent(eventId: string, inviteToken?: string): Promise<{ event: Event }> {
  const response = await apiClient.get<{ event: Event }>(`/events/${eventId}`, {
    params: inviteToken ? { invite: inviteToken } : undefined,
  });
  return response.data;
}
