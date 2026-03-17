"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createDemoState } from "@/lib/defaults";
import { computeProgressSnapshot, createSuggestedPlan } from "@/lib/planner";

const STORAGE_KEY = "tpai-demo-state-v1";
const AppStateContext = createContext(null);

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function buildMemoryFromMessage(message) {
  return {
    id: `memory-${crypto.randomUUID()}`,
    kind: "reflection",
    title: "Check-in insight",
    summary: message.slice(0, 180),
    tags: ["chat", "daily"],
    relevance: 0.7,
    createdAt: new Date().toISOString()
  };
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(() => cloneState(createDemoState()));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setState(JSON.parse(raw));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const actions = useMemo(() => ({
    setUser(user) {
      setState((current) => ({
        ...current,
        user
      }));
    },
    enterDemo() {
      setState(cloneState({
        ...createDemoState(),
        user: {
          email: "demo@tpai.app",
          mode: "demo"
        }
      }));
    },
    updateProfile(payload) {
      setState((current) => ({
        ...current,
        profile: {
          ...current.profile,
          ...payload
        }
      }));
    },
    addCategory(label) {
      const id = `custom-${label.toLowerCase().replace(/\s+/g, "-")}`;
      setState((current) => ({
        ...current,
        categories: [...current.categories, { id, label, color: "#1f8f82", custom: true }]
      }));
    },
    addGoal(goal) {
      setState((current) => ({
        ...current,
        goals: [...current.goals, { id: crypto.randomUUID(), status: "active", ...goal }]
      }));
    },
    addHabit(habit) {
      setState((current) => ({
        ...current,
        habits: [...current.habits, { id: crypto.randomUUID(), streak: 0, status: "active", ...habit }]
      }));
    },
    updateWorkSchedule(schedule) {
      setState((current) => ({
        ...current,
        workSchedule: schedule
      }));
    },
    appendMessage(message) {
      setState((current) => ({
        ...current,
        chatMessages: [...current.chatMessages, message],
        memoryItems: message.role === "user"
          ? [buildMemoryFromMessage(message.content), ...current.memoryItems].slice(0, 24)
          : current.memoryItems
      }));
    },
    setPlan(plan) {
      setState((current) => {
        const snapshot = computeProgressSnapshot({
          habits: current.habits,
          planDay: plan
        });
        return {
          ...current,
          planDay: plan,
          progressSnapshots: [
            snapshot,
            ...current.progressSnapshots.filter((item) => item.date !== snapshot.date)
          ]
        };
      });
    },
    generateLocalPlan() {
      setState((current) => {
        const planDay = createSuggestedPlan(current);
        const snapshot = computeProgressSnapshot({ habits: current.habits, planDay });
        return {
          ...current,
          planDay,
          progressSnapshots: [
            snapshot,
            ...current.progressSnapshots.filter((item) => item.date !== snapshot.date)
          ]
        };
      });
    },
    updatePlanBlock(blockId, updates) {
      setState((current) => {
        const blocks = (current.planDay?.blocks || []).map((block) => block.id === blockId ? { ...block, ...updates } : block);
        const planDay = current.planDay ? { ...current.planDay, blocks } : null;
        const snapshot = computeProgressSnapshot({ habits: current.habits, planDay });
        return {
          ...current,
          planDay,
          progressSnapshots: [
            snapshot,
            ...current.progressSnapshots.filter((item) => item.date !== snapshot.date)
          ]
        };
      });
    },
    completeHabit(habitId) {
      setState((current) => ({
        ...current,
        habits: current.habits.map((habit) => habit.id === habitId ? { ...habit, streak: (habit.streak || 0) + 1 } : habit)
      }));
    },
    resetDemo() {
      setState(cloneState(createDemoState()));
    }
  }), []);

  return (
    <AppStateContext.Provider value={{ state, actions, hydrated }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
