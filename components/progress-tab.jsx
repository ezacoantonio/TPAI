"use client";

import { useAppState } from "@/lib/store";

export function ProgressTab() {
  const { state, actions } = useAppState();
  const latest = state.progressSnapshots[0];

  return (
    <div className="stack">
      <div className="metrics-grid">
        <div className="metric-card">
          <span>Strongest streak</span>
          <strong>{latest?.strongestStreak || 0}</strong>
        </div>
        <div className="metric-card">
          <span>Completed blocks</span>
          <strong>{latest?.completedBlocks || 0}</strong>
        </div>
        <div className="metric-card">
          <span>Active habits</span>
          <strong>{latest?.activeHabits || state.habits.length}</strong>
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Habits and streaks</p>
            <h2>Protect the promises that shape your life.</h2>
          </div>
        </div>

        <div className="habit-list">
          {state.habits.map((habit) => (
            <article key={habit.id} className="habit-card">
              <div>
                <h3>{habit.title}</h3>
                <p className="subtle">{habit.type === "avoid" ? "Avoidance streak" : "Build streak"} · {habit.cadence}</p>
              </div>
              <div className="habit-actions">
                <strong>{habit.streak} days</strong>
                <button type="button" className="secondary-button" onClick={() => actions.completeHabit(habit.id)}>
                  Log win
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Goals in motion</p>
            <h2>What your current system is feeding.</h2>
          </div>
        </div>
        <div className="goal-list">
          {state.goals.map((goal) => (
            <article key={goal.id} className="goal-card">
              <strong>{goal.title}</strong>
              <span>{goal.priority} priority</span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
