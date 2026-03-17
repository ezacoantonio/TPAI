"use client";

import { useEffect, useState, useTransition } from "react";
import { useAppState } from "@/lib/store";
import { DEFAULT_WORK_SCHEDULE, PRESET_CATEGORIES } from "@/lib/defaults";

export function SetupSheet() {
  const { state, actions } = useAppState();
  const [name, setName] = useState(state.profile.name || "");
  const [mission, setMission] = useState(state.profile.mission || "");
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setName(state.profile.name || "");
    setMission(state.profile.mission || "");
  }, [state.profile.name, state.profile.mission]);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      name: name.trim(),
      mission: mission.trim(),
      customCategory: customCategory.trim(),
      workSchedule: state.workSchedule?.length ? state.workSchedule : DEFAULT_WORK_SCHEDULE
    };

    if (!payload.name || !payload.mission) {
      setError("Name and mission are required.");
      return;
    }

    startTransition(async () => {
      if (state.user?.mode === "supabase" && state.user.accessToken) {
        try {
          const response = await fetch("/api/onboarding", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${state.user.accessToken}`
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "Unable to save setup.");
          }

          const nextState = await response.json();
          actions.replaceState(nextState, state.user);
          setCustomCategory("");
          return;
        } catch (submissionError) {
          setError(submissionError.message);
          return;
        }
      }

      actions.updateProfile({ name: payload.name, mission: payload.mission });
      actions.updateWorkSchedule(payload.workSchedule);
      if (payload.customCategory) {
        actions.addCategory(payload.customCategory);
      }
      setCustomCategory("");
    });
  }

  return (
    <div className="overlay">
      <form className="setup-sheet" onSubmit={handleSubmit}>
        <p className="eyebrow">Quick setup</p>
        <h2>Give your coach enough context to guide the day.</h2>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Antonio" />
        </label>
        <label>
          Life mission right now
          <textarea value={mission} onChange={(event) => setMission(event.target.value)} rows={4} placeholder="Build a disciplined, healthy, faith-filled life and stop wasting my free time." />
        </label>
        <label>
          Add one custom category
          <input value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} placeholder="Business, family, creativity..." />
        </label>

        <div className="preset-list">
          {PRESET_CATEGORIES.map((category) => (
            <span key={category.id} className="mini-badge">
              {category.label}
            </span>
          ))}
        </div>

        <button type="submit" className="primary-button" disabled={pending}>Save setup</button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}
