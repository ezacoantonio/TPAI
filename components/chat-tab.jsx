"use client";

import { useState, useTransition } from "react";
import { useAppState } from "@/lib/store";

export function ChatTab({ onOpenPlan }) {
  const { state, actions } = useAppState();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }

    const message = {
      id: crypto.randomUUID(),
      role: "user",
      content: draft.trim(),
      createdAt: new Date().toISOString()
    };

    actions.appendMessage(message);
    setDraft("");
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...state,
            chatMessages: [...state.chatMessages, message]
          })
        });

        if (!response.ok) {
          throw new Error("Unable to generate a coaching response.");
        }

        const payload = await response.json();
        actions.appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.reply,
          createdAt: new Date().toISOString()
        });
        actions.setPlan(payload.plan);
        onOpenPlan();
      } catch (submissionError) {
        setError(submissionError.message);
      }
    });
  }

  return (
    <div className="stack">
      <div className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Daily check-in</p>
            <h2>Talk through today with your coach.</h2>
          </div>
          <span className="status-pill">{pending ? "planning..." : "ready"}</span>
        </div>

        <div className="message-list">
          {state.chatMessages.map((message) => (
            <article key={message.id} className={message.role === "assistant" ? "message assistant" : "message user"}>
              <p>{message.content}</p>
            </article>
          ))}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Tell TPAI what matters today, where you are slipping, and what kind of day you want."
            rows={5}
          />
          <button type="submit" className="primary-button" disabled={pending}>
            Generate my day plan
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Memory</p>
            <h2>What the coach is remembering about you.</h2>
          </div>
        </div>
        <div className="pill-grid">
          {state.memoryItems.slice(0, 6).map((item) => (
            <div key={item.id} className="memory-pill">
              <strong>{item.title}</strong>
              <span>{item.summary}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
