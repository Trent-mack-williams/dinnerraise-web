import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getEvent, requestSeat } from "../api/events";
import { createCheckout, getSeat } from "../api/seats";
import { getErrorMessage } from "../api/errors";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import type { Event as DinnerEvent, Seat } from "../api/types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; event: DinnerEvent };

type RequestState = "idle" | "sending" | "failed";

// One localStorage key per dinner, so requests for different dinners don't overwrite each other
function savedSeatKey(eventId: string) {
  return `dinnerraise:seat:${eventId}`;
}

// Plain-language message for each status a guest can see
const statusMessage: Record<Seat["status"], string> = {
  PENDING: "Your request is with the host. Come back to this page once it's approved to pay.",
  AWAITING_PAYMENT: "The host has approved your seat. Pay now to confirm it.",
  CONFIRMED: "Your seat is confirmed. See you at the dinner.",
  DECLINED: "The host couldn't offer you a seat this time.",
  CANCELLED: "This seat was cancelled.",
};

export function EventDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite") ?? undefined;

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");

  // The guest's saved seat, if they've requested one for this dinner
  const [seatId, setSeatId] = useState<string | null>(null);
  const [seatStatus, setSeatStatus] = useState<Seat["status"] | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setState({ status: "error", message: "This dinner link is incomplete." });
      return;
    }
    getEvent(id, inviteToken)
      .then((data) => setState({ status: "loaded", event: data.event }))
      .catch(() => setState({ status: "error", message: "This dinner isn't available." }));
  }, [id, inviteToken]);

  // On opening the page, look for a seat this browser saved earlier and check its status
  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(savedSeatKey(id));
    if (!saved) return;

    getSeat(saved)
      .then((data) => {
        setSeatId(saved);
        setSeatStatus(data.seat.status);
      })
      .catch(() => {
        // The seat no longer exists, so forget it
        localStorage.removeItem(savedSeatKey(id));
      });
  }, [id]);

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
      const response = await requestSeat(id, {
        guestName,
        guestEmail,
        dietaryRestrictions: [],
      });
      // Save the seat so the guest can come back to it later
      localStorage.setItem(savedSeatKey(id), response.seat.id);
      setSeatId(response.seat.id);
      setSeatStatus(response.seat.status);
      setRequestState("idle");
    } catch {
      setRequestState("failed");
    }
  }

  async function handlePay() {
    if (!seatId) return;
    setPaying(true);
    setPayError(null);
    try {
      const result = await createCheckout(seatId);
      // Send the guest to Stripe's hosted payment page
      window.location.href = result.url;
    } catch (err) {
      setPayError(getErrorMessage(err, "We couldn't start payment. Try again."));
      setPaying(false);
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

      {seatId && seatStatus ? (
        <section className="event-card">
          <h2>Your seat</h2>
          <p>{statusMessage[seatStatus]}</p>
          {seatStatus === "AWAITING_PAYMENT" && (
            <>
              <Button onClick={handlePay} disabled={paying}>
                {paying ? "Opening payment..." : "Pay now"}
              </Button>
              {payError && <p className="help-text">{payError}</p>}
            </>
          )}
        </section>
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