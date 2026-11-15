import { apiClient } from "./client";
import type { InviteConfirmResponse } from "./types";

// Confirms a guest's name against an invite token. Returns a Stripe checkout link
export async function confirmInvitation(
  token: string,
  guestName: string,
): Promise<InviteConfirmResponse> {
  const response = await apiClient.post<InviteConfirmResponse>(
    `/invitations/${token}/confirm`,
    { guestName, dietaryRestrictions: [] },
  );
  return response.data;
}