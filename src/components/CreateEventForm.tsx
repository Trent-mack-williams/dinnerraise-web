import { useState } from "react";
import { createEvent } from "../api/host";
import { getErrorMessage } from "../api/errors";
import { Button } from "./Button";
import { Input } from "./Input";

type Props = { onCreated: () => void };

export function CreateEventForm({ onCreated }: Props) {
  // Every input is text here, even the numbers. We convert on submit
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");     // e.g. "2027-12-15T19:00"
  const [priceText, setPriceText] = useState("");   // pounds, e.g. "19.99"
  const [capacityText, setCapacityText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false); // a checkbox gives a real boolean
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert once here, so the checks and the submit use the same numbers
  const priceNumber = Number(priceText);
  const capacityNumber = Number(capacityText);

  const formValid =
    title.trim().length > 0 &&
    location.trim().length > 0 &&
    startsAt !== "" &&
    priceNumber > 0 &&
    Number.isInteger(capacityNumber) &&
    capacityNumber >= 1;

  function reset() {
    setTitle("");
    setLocation("");
    setStartsAt("");
    setPriceText("");
    setCapacityText("");
    setIsPrivate(false);
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      await createEvent({
        title: title.trim(),
        location: location.trim(),
        // datetime-local is in the browser's local time. toISOString converts it to UTC
        startsAt: new Date(startsAt).toISOString(),
        // Pounds to pence. Math.round stops floating point errors, e.g. 19.99 * 100
        seatPriceCents: Math.round(priceNumber * 100),
        capacity: capacityNumber,
        isPrivate,
      });
      reset();
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't create that dinner. Check the details."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="event-card">
      <h2>Create a dinner</h2>

      <Input id="title" label="Dinner title" value={title}
        onChange={(e) => setTitle(e.target.value)}
        helpText="Example: Spring supper for the school garden" />

      <Input id="location" label="Location" value={location}
        onChange={(e) => setLocation(e.target.value)}
        helpText="Example: 12 High Street, London" />

      <Input id="startsAt" label="Date and time" type="datetime-local" value={startsAt}
        onChange={(e) => setStartsAt(e.target.value)} />

      <Input id="price" label="Price per seat (£)" type="number" min="0" step="0.01"
        value={priceText} onChange={(e) => setPriceText(e.target.value)}
        helpText="Example: 25 or 19.99" />

      <Input id="capacity" label="Number of seats" type="number" min="1" step="1"
        value={capacityText} onChange={(e) => setCapacityText(e.target.value)} />

      <label className="checkbox-row">
        <input type="checkbox" checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)} />
        Invite only. Hidden from the public list
      </label>

      {error && <p className="help-text">{error}</p>}

      {/* Disabled until every field is valid */}
      <Button onClick={handleCreate} disabled={!formValid || saving}>
        {saving ? "Creating..." : "Create dinner"}
      </Button>
    </section>
  );
}