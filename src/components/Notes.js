import { useEffect, useState } from "react";

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function Notes() {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/notes")
      .then((response) => {
        if (!response.ok) {
          throw new Error("load");
        }
        return response.json();
      })
      .then((data) => {
        if (alive) {
          setNotes(Array.isArray(data.notes) ? data.notes : []);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (alive) {
          setStatus("error");
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, body }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "The note could not be saved.");
        return;
      }
      setNotes((current) => [data.note, ...current]);
      setBody("");
      setStatus("ready");
    } catch {
      setError("The note could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notes">
      <p className="notes-lead">
        Leave a note. It is saved on this site, so Ruitong can read it later. Anyone who opens Notes can see the notes left here.
      </p>
      <form className="notes-form" onSubmit={onSubmit}>
        <label>
          Name
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            maxLength={40}
            placeholder="Your name"
            autoComplete="nickname"
          />
        </label>
        <label>
          Note
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={800}
            rows={4}
            required
            placeholder="Say hello, or leave a thought."
          />
        </label>
        <button type="submit" disabled={saving || !body.trim()}>
          {saving ? "Saving…" : "Leave note"}
        </button>
        {error && <p className="notes-error">{error}</p>}
      </form>
      <div className="notes-list" aria-live="polite">
        {status === "loading" && <p>Loading notes…</p>}
        {status === "error" && <p className="notes-error">Notes could not be loaded.</p>}
        {status === "ready" && notes.length === 0 && <p>No notes yet.</p>}
        {notes.map((note) => (
          <article key={note.id} className="notes-card">
            <header>
              <strong>{note.author}</strong>
              <time dateTime={note.createdAt}>{formatWhen(note.createdAt)}</time>
            </header>
            <p>{note.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
