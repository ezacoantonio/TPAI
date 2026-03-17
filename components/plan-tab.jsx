"use client";

import { useAppState } from "@/lib/store";
import { formatTime } from "@/lib/time";

export function PlanTab() {
  const { state, actions } = useAppState();
  const plan = state.planDay;

  if (!plan) {
    return (
      <div className="section-card empty-state">
        <p className="eyebrow">Today&apos;s plan</p>
        <h2>No plan yet.</h2>
        <p className="subtle">Use the Chat tab to tell TPAI what matters today and generate your first time-blocked plan.</p>
        <button type="button" className="secondary-button" onClick={() => actions.generateLocalPlan()}>
          Generate a local starter plan
        </button>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Today&apos;s plan</p>
            <h2>{plan.focusSummary}</h2>
          </div>
          <span className="status-pill">{plan.status}</span>
        </div>

        <div className="timeline">
          {plan.blocks.map((block) => (
            <article key={block.id} className="timeline-card">
              <div className="timeline-top">
                <div>
                  <p className="timeline-time">{formatTime(block.start)} - {formatTime(block.end)}</p>
                  <h3>{block.title}</h3>
                </div>
                <span className={`mini-badge status-${block.status}`}>{block.status}</span>
              </div>
              <p className="subtle">{block.categoryLabel} · {block.notes}</p>
              <div className="button-row">
                <button type="button" className="secondary-button" onClick={() => actions.updatePlanBlock(block.id, { status: "approved" })}>
                  Approve
                </button>
                <button type="button" className="secondary-button" onClick={() => actions.updatePlanBlock(block.id, { status: "done" })}>
                  Done
                </button>
                <button type="button" className="ghost-button" onClick={() => actions.updatePlanBlock(block.id, { status: "skipped" })}>
                  Skip
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="section-card">
        <p className="eyebrow">Work schedule</p>
        <h2>The pockets your plan is built around.</h2>
        <div className="schedule-grid">
          {state.workSchedule.map((entry) => (
            <div key={`${entry.day}-${entry.start}`} className="schedule-pill">
              <strong>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][entry.day]}</strong>
              <span>{formatTime(entry.start)} - {formatTime(entry.end)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
