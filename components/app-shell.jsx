"use client";

import { useState } from "react";
import { TAB_ITEMS } from "@/lib/defaults";
import { ChatTab } from "@/components/chat-tab";
import { PlanTab } from "@/components/plan-tab";
import { ProgressTab } from "@/components/progress-tab";
import { SetupSheet } from "@/components/setup-sheet";
import { AuthGate } from "@/components/auth-gate";
import { useAppState } from "@/lib/store";

export function AppShell() {
  const [activeTab, setActiveTab] = useState("chat");
  const { state, hydrated } = useAppState();

  const incompleteSetup = !state.profile.name || !state.profile.mission;

  return (
    <AuthGate>
      <main className="shell">
        <section className="hero-card">
          <p className="eyebrow">TPAI Life Coach</p>
          <div className="hero-row">
            <div>
              <h1>Structure your free time before doomscrolling steals it.</h1>
              <p className="subtle">
                Morning check-ins, intentional time blocks, and a dashboard that shows your real momentum.
              </p>
            </div>
            <div className="hero-chip">
              <span>{hydrated && state.user ? state.user.mode : "loading"}</span>
              <strong>{state.profile.timezone}</strong>
            </div>
          </div>
        </section>

        <nav className="tab-bar" aria-label="Primary">
          {TAB_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeTab === item.id ? "tab active" : "tab"}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="tab-panel">
          {activeTab === "chat" && <ChatTab onOpenPlan={() => setActiveTab("plan")} />}
          {activeTab === "plan" && <PlanTab />}
          {activeTab === "progress" && <ProgressTab />}
        </section>

        {incompleteSetup && <SetupSheet />}
      </main>
    </AuthGate>
  );
}
