import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getEvent, requestSeat } from "../api/events";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import type { Event as DinnerEvent } from "../api/types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; event: DinnerEvent };
type RequestState = "idle" | "sending" | "sent" | "failed";

export function EventDetailPage() {
  // useParams reads :id from the URL. Its type is string | undefined
  const { id } = useParams();
  // useSearchParams reads ?invite=... from the URL
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite") ?? undefined;

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");

  useEffect(() => {
    // Guard: if the URL has no id, there's nothing to load
    if (!id) {
      setState({ status: "error", message: "This dinner link is incomplete." });
      return;
    }
    getEvent(id, inviteToken)
      .then((data) => setState({ status: "loaded", event: data.event }))
      .catch(() => setState({ status: "error", message: "This dinner isn't available." }));
  }, [id, inviteToken]);

  if (state.status === "loading") {
    return <main className="page"><p>Loading dinner...</p></main>;
  }
  if (state.status === "error") {
    return <main className="page"><p className="help-text">{state.message}</p></main>;
  }

  const event = state.event;
  const emailValid = /^\S+@\S+\.\S+$/.test(guestEmail);
  const formValid = guestName.trim().length > 0 && emailValid;

  async function handleRequest() {
    if (!id) return;
    setRequestState("sending");
    try {
      await requestSeat(id, { guestName, guestEmail, dietaryRestrictions: [] });
      setRequestState("sent");
    } catch {
      setRequestState("failed");
    }
  }

  return (
    <main className="page">
      <h1>{event.title}</h1>
      <p className="help-text">{event.location}</p>
      <p className="help-text">
        {new Date(event.startsAt).toLocaleDateString("en-GB", { dateStyle: "full" })}
      </p>
      <p>£{(event.seatPriceCents / 100).toFixed(2)} per seat</p>
      <p className="help-text">{event.seatsRemaining} seats remaining</p>

      {requestState === "sent" ? (
        <p>Request sent. The host will review it and email you.</p>
      ) : (
        <>
          <h2>Request a seat</h2>
          <Input id="guestName" label="Your name" value={guestName}
            onChange={(e) => setGuestName(e.target.value)} />
          <Input id="guestEmail" label="Email address" type="email" value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            helpText="The host replies to this address" />
          {requestState === "failed" && (
            <p className="help-text">Something went wrong. Try again.</p>
          )}
          {/* Disabled until the name and a valid email are entered */}
          <Button onClick={handleRequest} disabled={!formValid || requestState === "sending"}>
            {requestState === "sending" ? "Sending..." : "Request seat"}
          </Button>
        </>
      )}
    </main>
  );
}