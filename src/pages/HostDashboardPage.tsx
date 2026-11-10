import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyEvents, updateSeatStatus } from "../api/host";
import { getErrorMessage } from "../api/errors";
import { Button } from "../components/Button";
import { CreateEventForm } from "../components/CreateEventForm";
import type { HostEvent } from "../api/types";
import { InviteForm } from "../components/InviteForm";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; events: HostEvent[] };
  

export function HostDashboardPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Errors from approve, decline or create. Shown above the list, not instead of it
  const [actionError, setActionError] = useState<string | null>(null);

  function load() {
    getMyEvents()
      .then((data) => setState({ status: "loaded", events: data.events }))
      .catch(() => setState({ status: "error", message: "We couldn't load your dinners." }));
  }

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      navigate("/");
      return;
    }
    load();
  }, [navigate]);

  async function handleDecision(seatId: string, decision: "CONFIRMED" | "DECLINED") {
    setActionError(null);
    try {
      await updateSeatStatus(seatId, decision);
      load();
    } catch (err) {
      setActionError(getErrorMessage(err, "That change didn't save. Try again."));
    }
  }

  if (state.status === "loading") {
    return <main className="page"><p>Loading your dinners...</p></main>;
  }
  if (state.status === "error") {
    return <main className="page"><p className="help-text">{state.message}</p></main>;
  }

  return (
    <main className="page">
      <h1>Your dinners</h1>

      <CreateEventForm onCreated={load} />

      {actionError && <p className="help-text">{actionError}</p>}

      {state.events.length === 0 && <p>You haven't created any dinners yet.</p>}

      {state.events.map((event) => {
        const pending = event.seats.filter((s) => s.status === "PENDING");
        const booked = event.seats.filter(
          (s) => s.status === "AWAITING_PAYMENT" || s.status === "CONFIRMED",
        );

        return (
          <article key={event.id} className="event-card">
            <h2>{event.title}</h2>
            <p className="help-text">{event.location}</p>
            <p className="help-text">
              {booked.length} of {event.capacity} seats taken, {pending.length} awaiting your decision
            </p>

            <h3>Requests</h3>
            {pending.length === 0 && <p className="help-text">No new requests.</p>}
            {pending.map((seat) => (
              <div key={seat.id} className="seat-row">
                <p>
                  <strong>{seat.guestName}</strong>
                  <span className="status-badge">Pending</span>
                </p>
                <p className="help-text">{seat.guestEmail}</p>
                <Button onClick={() => handleDecision(seat.id, "CONFIRMED")}>Approve</Button>
                <Button variant="secondary" onClick={() => handleDecision(seat.id, "DECLINED")}>
                  Decline
                </Button>
              </div>
            ))}

            <h3>Booked</h3>
            {booked.length === 0 && <p className="help-text">No seats booked yet.</p>}
            {booked.map((seat) => (
              <p key={seat.id} className="help-text">
                {seat.guestName}, {seat.status === "CONFIRMED" ? "paid" : "awaiting payment"}
              </p>
            ))}
            {event.isPrivate && <InviteForm eventId={event.id} />}
            <Link to={`/events/${event.id}`}>View public page</Link>
          </article>
        );
      })}
    </main>
  );
}