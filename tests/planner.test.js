import test from "node:test";
import assert from "node:assert/strict";
import { createSuggestedPlan, getFreeTimePockets } from "../lib/planner.js";

test("getFreeTimePockets finds windows around work hours", () => {
  const pockets = getFreeTimePockets(
    [
      { day: 1, start: "09:00", end: "17:00" }
    ],
    "2026-03-16T07:00:00.000Z"
  );

  assert.deepEqual(pockets, [
    { start: 360, end: 540 },
    { start: 1020, end: 1320 }
  ]);
});

test("createSuggestedPlan returns actionable blocks", () => {
  const plan = createSuggestedPlan({
    goals: [{ id: "goal-1", title: "Study", categoryId: "learning", priority: "high", status: "active" }],
    habits: [{ id: "habit-1", title: "Workout", categoryId: "fitness", type: "build", cadence: "daily", status: "active" }],
    categories: [
      { id: "learning", label: "Learning" },
      { id: "fitness", label: "Fitness" }
    ],
    workSchedule: [{ day: 1, start: "09:00", end: "17:00" }],
    date: "2026-03-16T07:00:00.000Z"
  });

  assert.equal(plan.status, "draft");
  assert.ok(plan.blocks.length >= 2);
  assert.equal(plan.blocks[0].status, "suggested");
});
