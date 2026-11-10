import { apiClient } from "./client";
import type { CheckoutResponse, SeatStatusResponse } from "./types";

// Loads a seat's current status, so a returning guest sees where they stand
export async function getSeat(seatId: string): Promise<SeatStatusResponse> {
  const response = await apiClient.get<SeatStatusResponse>(`/seats/${seatId}`);
  return response.data;
}

// Starts Stripe Checkout for an approved seat. Returns the Stripe page address
export async function createCheckout(seatId: string): Promise<CheckoutResponse> {
  const response = await apiClient.post<CheckoutResponse>(`/payments/checkout/${seatId}`);
  return response.data;
}