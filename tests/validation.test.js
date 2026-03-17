import test from "node:test";
import assert from "node:assert/strict";
import { blockStatusSchema, onboardingSchema } from "../lib/validation.js";

test("onboarding schema accepts valid setup payload", () => {
  const parsed = onboardingSchema.parse({
    name: "Antonio",
    mission: "Become disciplined and stop wasting time.",
    customCategory: "Business",
    workSchedule: [{ day: 1, start: "09:00", end: "17:00" }]
  });

  assert.equal(parsed.name, "Antonio");
  assert.equal(parsed.customCategory, "Business");
});

test("onboarding schema rejects blank name", () => {
  assert.throws(() => onboardingSchema.parse({
    name: "",
    mission: "Valid mission",
    workSchedule: [{ day: 1, start: "09:00", end: "17:00" }]
  }));
});

test("block status schema rejects unknown status", () => {
  assert.throws(() => blockStatusSchema.parse({
    planDayId: "0d65b3d3-8cb6-4f04-83bf-a4d9dfd9c2f3",
    blockId: "16d45d31-1215-41c2-a6df-f902dc4959ec",
    status: "hacked"
  }));
});
