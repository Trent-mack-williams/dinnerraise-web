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

// One event, as returned by GET /events and GET /events/:id
export interface Event {
  id: string;
  hostId: string;
  title: string;
  cause: string | null;
  description: string | null;
  location: string;
  startsAt: string; // ISO date text, e.g. "2027-03-15T19:00:00.000Z"
  seatPriceCents: number;
  capacity: number;
  createdAt: string;
  seatsRemaining: number;
}

// What GET /events returns
export interface EventsResponse {
  events: Event[];
}