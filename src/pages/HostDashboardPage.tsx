import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyEvents, updateSeatStatus } from "../api/host";
import { Button } from "../components/Button";
import type { HostEvent } from "../api/types";
import axios from "axios";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; events: HostEvent[] };

export function HostDashboardPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  // Loads the events. Called on open and again after each approve or decline
  function load() {
    getMyEvents()
      .then((data) => setState({ status: "loaded", events: data.events }))
      .catch(() => setState({ status: "error", message: "We couldn't load your dinners." }));
  }

  useEffect(() => {
    // No saved token means nobody is signed in as a host
    if (!localStorage.getItem("authToken")) {
      navigate("/");
      return;
    }
    load();
  }, [navigate]);

  async function handleDecision(seatId: string, decision: "CONFIRMED" | "DECLINED") {
    try {
      await updateSeatStatus(seatId, decision);
      load();
    } catch (err) {
      // Axios puts the server's error text in err.response.data.error
      const message = axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : "That change didn't save. Try again.";
      setState({ status: "error", message });
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
      {state.events.length === 0 && <p>You haven't created any dinners yet.</p>}

      {state.events.map((event) => {
        // Pending requests need a decision. Confirmed or awaiting-payment seats are just listed
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

            <Link to={`/events/${event.id}`}>View public page</Link>
          </article>
        );
      })}
    </main>
  );
}