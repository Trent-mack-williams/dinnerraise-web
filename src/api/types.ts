// Shape of a user, as returned by the API
export interface User {
  id: string;
  email: string;
  role: "HOST" | "GUEST";
  firstName?: string;
  lastName?: string;
}

// What POST /auth/login returns
export interface LoginResponse {
  token: string;
  user: User;
}

// What POST /auth/guest-email returns. Guests get no token
export interface GuestEmailResponse {
  user: User;
}