export const PRESET_CATEGORIES = [
  { id: "fitness", label: "Fitness", color: "#2f7f62" },
  { id: "finance", label: "Finance", color: "#b36a12" },
  { id: "faith", label: "Faith", color: "#6a4ecf" },
  { id: "learning", label: "Learning", color: "#2463eb" },
  { id: "relationships", label: "Relationships", color: "#c23d74" },
  { id: "content", label: "Content", color: "#cc4b2f" },
  { id: "focus", label: "Phone Use", color: "#2c2c34" }
];

export const DEFAULT_PROFILE = {
  name: "",
  timezone: "America/Toronto",
  mission: "",
  planningStyle: "balanced",
  reminderWindow: 15
};

export const DEFAULT_WORK_SCHEDULE = [
  { day: 1, start: "09:00", end: "17:00" },
  { day: 2, start: "09:00", end: "17:00" },
  { day: 3, start: "09:00", end: "17:00" },
  { day: 4, start: "09:00", end: "17:00" },
  { day: 5, start: "09:00", end: "17:00" }
];

export function createDemoState() {
  const now = new Date().toISOString();

  return {
    user: null,
    profile: {
      ...DEFAULT_PROFILE,
      name: "Antonio",
      mission: "Build a peaceful, disciplined, faith-filled life with momentum every day."
    },
    categories: [
      ...PRESET_CATEGORIES,
      { id: "custom-social", label: "Social", color: "#1f8f82", custom: true }
    ],
    goals: [
      { id: "goal-1", title: "Save $5,000 for emergency fund", categoryId: "finance", priority: "high", status: "active" },
      { id: "goal-2", title: "Publish two short videos per week", categoryId: "content", priority: "medium", status: "active" }
    ],
    habits: [
      { id: "habit-1", title: "Morning prayer", categoryId: "faith", type: "build", cadence: "daily", streak: 9, status: "active" },
      { id: "habit-2", title: "No doomscrolling before work", categoryId: "focus", type: "avoid", cadence: "daily", streak: 4, status: "active" },
      { id: "habit-3", title: "Workout session", categoryId: "fitness", type: "build", cadence: "4x-week", streak: 2, status: "active" }
    ],
    workSchedule: DEFAULT_WORK_SCHEDULE,
    scheduleExceptions: [],
    chatMessages: [
      {
        id: "msg-1",
        role: "assistant",
        content: "We can turn your free time into deliberate growth blocks. Start with what matters most today.",
        createdAt: now
      }
    ],
    checkIns: [],
    planDay: null,
    memoryItems: [
      {
        id: "mem-1",
        kind: "identity",
        title: "Best energy before work",
        summary: "User does best with focused work and spiritual routines before the job starts.",
        tags: ["energy", "morning"],
        relevance: 0.88,
        createdAt: now
      }
    ],
    progressSnapshots: []
  };
}

export const TAB_ITEMS = [
  { id: "chat", label: "Chat" },
  { id: "plan", label: "Plan" },
  { id: "progress", label: "Progress" }
];
