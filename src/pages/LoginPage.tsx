import { useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { login, signInGuest } from "../api/auth";

// "choose" shows the two buttons. "guest" and "host" show the email step for that role
type Step = "choose" | "guest" | "host";

export function LoginPage() {
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Checked before the button is enabled. Simple pattern check, the server validates fully
  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
  setLoading(true);
  setError(null);
  try {
    if (isHost) {
      const result = await login(email, password);
      localStorage.setItem("authToken", result.token);
      alert(`Signed in as host ${result.user.email}`);
    } else {
      const result = await signInGuest(email);
      alert(`Welcome, guest ${result.user.email}`);
    }
  } catch {
    setError("Something went wrong. Check your details and try again");
  } finally {
    setLoading(false);
  }
}

  if (step === "choose") {
    return (
      <main className="page">
        <h1>Welcome to DinnerRaise</h1>
        <p>Dinners that raise money for causes you care about.</p>
        <Button onClick={() => setStep("guest")}>I'm a guest</Button>
        <p className="help-text">Browse dinners and reserve a seat.</p>
        <Button variant="secondary" onClick={() => setStep("host")}>
          I'm a host
        </Button>
        <p className="help-text">Create dinners and invite guests.</p>
      </main>
    );
  }

  const isHost = step === "host";

  return (
    <main className="page">
      <Button variant="secondary" onClick={() => setStep("choose")}>
        Back
      </Button>
      <h1>{isHost ? "Host sign in" : "Guest sign in"}</h1>

      <Input
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        helpText="Example: john@example.com"
      />

      {isHost && (
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helpText="Hosts use a password to manage their dinners."
        />
      )}

      {error && <p className="help-text">{error}</p>}
      <Button onClick={handleSubmit} disabled={loading || !emailValid || (isHost && password.length < 8)}>
        {loading ? "Signing in..." : isHost ? "Sign in as host" : "Continue as guest"}
      </Button>
    </main>
  );
}