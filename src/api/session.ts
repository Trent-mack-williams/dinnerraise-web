// Returns true only when a saved token exists AND the saved role is HOST
export function isHostSignedIn(): boolean {
  return (
    localStorage.getItem("authToken") !== null &&
    localStorage.getItem("authRole") === "HOST"
  );
}

// Forgets the saved sign-in
export function clearSession(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authRole");
}