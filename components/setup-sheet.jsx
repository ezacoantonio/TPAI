"use client";

import { useState } from "react";
import { useAppState } from "@/lib/store";
import { DEFAULT_WORK_SCHEDULE, PRESET_CATEGORIES } from "@/lib/defaults";

export function SetupSheet() {
  const { actions } = useAppState();
  const [name, setName] = useState("");
  const [mission, setMission] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    actions.updateProfile({ name, mission });
    actions.updateWorkSchedule(DEFAULT_WORK_SCHEDULE);
    if (customCategory.trim()) {
      actions.addCategory(customCategory.trim());
    }
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

        <button type="submit" className="primary-button">Save setup</button>
      </form>
    </div>
  );
}
