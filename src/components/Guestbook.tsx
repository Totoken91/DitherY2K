"use client";

import { useEffect, useState, useCallback } from "react";

interface GuestbookEntry {
  name: string;
  message: string;
  date: string;
}

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/guestbook");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchEntries();
  }, [isOpen, fetchEntries]);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) return;
    setSending(true);
    setStatus("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      if (res.ok) {
        setName("");
        setMessage("");
        setStatus("Thanks for signing!! 📝");
        fetchEntries();
      } else {
        setStatus("Error... try again!");
      }
    } catch {
      setStatus("Error... try again!");
    }
    setSending(false);
  };

  if (!isOpen) {
    return (
      <button
        className="btn-retro"
        onClick={() => setIsOpen(true)}
        style={{ fontSize: "11px" }}
      >
        {"📖 Sign Guestbook!"}
      </button>
    );
  }

  return (
    <div className="sidebar-section" style={{ maxHeight: "400px", overflowY: "auto" }}>
      <div className="sidebar-title glow-pink">{"📖 Guestbook 📖"}</div>

      {/* Form */}
      <div style={{ marginBottom: "6px" }}>
        <input
          type="text"
          placeholder="Your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          className="select-retro"
          style={{ marginBottom: "3px", color: "#000" }}
        />
        <textarea
          placeholder="Leave a message!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
          rows={2}
          className="select-retro"
          style={{ marginBottom: "3px", resize: "none", color: "#000" }}
        />
        <button
          className="btn-retro"
          onClick={handleSubmit}
          disabled={sending || !name.trim() || !message.trim()}
          style={{ width: "100%", fontSize: "11px" }}
        >
          {sending ? "Signing..." : "✍️ Sign it!"}
        </button>
        {status && (
          <div style={{ color: "#00ff00", fontSize: "10px", textAlign: "center", marginTop: "2px" }}>
            {status}
          </div>
        )}
      </div>

      <hr className="rainbow-hr" />

      {/* Entries */}
      {entries.length === 0 ? (
        <div style={{ color: "#808080", fontSize: "10px", textAlign: "center" }}>
          No entries yet... be the first!!
        </div>
      ) : (
        entries.map((entry, i) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid #333",
              padding: "3px 0",
              fontSize: "10px",
            }}
          >
            <div>
              <span style={{ color: "#ffff00", fontWeight: "bold" }}>{entry.name}</span>
              <span style={{ color: "#808080" }}> — {entry.date}</span>
            </div>
            <div style={{ color: "#00ffff" }}>{entry.message}</div>
          </div>
        ))
      )}

      <button
        className="btn-retro"
        onClick={() => setIsOpen(false)}
        style={{ width: "100%", fontSize: "10px", marginTop: "4px" }}
      >
        Close
      </button>
    </div>
  );
}
