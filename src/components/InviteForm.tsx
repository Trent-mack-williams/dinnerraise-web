import { useState } from "react";
import { createInvitation } from "../api/host";
import { getErrorMessage } from "../api/errors";
import { Button } from "./Button";
import { Input } from "./Input";

type Props = { eventId: string };

export function InviteForm({ eventId }: Props) {
  const [guestEmail, setGuestEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Same simple check as the sign-in page. The server validates fully
  const emailValid = /^\S+@\S+\.\S+$/.test(guestEmail);

  async function handleInvite() {
    setSaving(true);
    setError(null);
    setCopied(false);
    try {
      const response = await createInvitation(eventId, { guestEmail: guestEmail.trim() });
      setLink(response.invitation.link);
      setGuestEmail("");
    } catch (err) {
      setError(getErrorMessage(err, "That invite didn't send. Try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setError("Copy didn't work. Select the link and copy it by hand.");
    }
  }

  return (
    <section className="invite-box">
      <h3>Invite a guest</h3>
      <p className="help-text">Creates a personal link for one guest. Send it to them yourself.</p>

      <Input
        id={`invite-email-${eventId}`}
        label="Guest email address"
        type="email"
        value={guestEmail}
        onChange={(e) => setGuestEmail(e.target.value)}
        helpText="Example: friend@example.com"
      />

      {/* Disabled until the email looks valid */}
      <Button onClick={handleInvite} disabled={!emailValid || saving}>
        {saving ? "Creating link..." : "Create invite"}
      </Button>

      {error && <p className="help-text">{error}</p>}

      {link && (
        <div className="invite-result">
          <p className="help-text">Link for this guest. Share it privately:</p>
          <p className="link-text">{link}</p>
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? "Link copied" : "Copy link"}
          </Button>
        </div>
      )}
    </section>
  );
}