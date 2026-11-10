import { useEffect, useState } from "react";
import { getEvents } from "../api/events";
import type { Event } from "../api/types";
import { Link } from "react-router-dom";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; events: Event[] };

export function EventListPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  // Runs once when the page opens. The empty [] means "no dependencies"
  useEffect(() => {
    getEvents()
      .then((data) => setState({ status: "loaded", events: data.events }))
      .catch(() => setState({ status: "error", message: "We couldn't load dinners. Try again." }));
  }, []);

  if (state.status === "loading") {
    return <main className="page"><p>Loading dinners...</p></main>;
  }

  if (state.status === "error") {
    return <main className="page"><p className="help-text">{state.message}</p></main>;
  }

  // Here TypeScript knows state.events exists
  return (
    <main className="page">
      <h1>Upcoming dinners</h1>
      <p className="help-text"><Link to="/login">Host sign in</Link></p>
      {state.events.length === 0 && <p>No dinners are scheduled yet. Check back soon.</p>}
      {state.events.map((event) => (
        <article key={event.id} className="event-card">
          <h2>{event.title}</h2>
          <p className="help-text">{event.location}</p>
          <p className="help-text">
            {new Date(event.startsAt).toLocaleDateString("en-GB", { dateStyle: "full" })}
          </p>
          <p>£{(event.seatPriceCents / 100).toFixed(2)} per seat</p>
          <p className="help-text">{event.seatsRemaining} seats remaining</p>
          <Link to={`/events/${event.id}`} className="btn btn-secondary">View dinner</Link>
        </article>
      ))}
    </main>
  );
}