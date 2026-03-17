import { fromMinutes, toMinutes } from "./time.js";

const MORNING_START = 6 * 60;
const EVENING_END = 22 * 60;

function getScheduleForDay(schedule, date) {
  const day = new Date(date).getDay();
  return schedule.filter((entry) => entry.day === day);
}

function mergeBusySlots(slots) {
  const ordered = [...slots].sort((a, b) => a.start - b.start);
  return ordered.reduce((acc, slot) => {
    const prev = acc[acc.length - 1];
    if (!prev || slot.start > prev.end) {
      acc.push({ ...slot });
      return acc;
    }
    prev.end = Math.max(prev.end, slot.end);
    return acc;
  }, []);
}

export function getFreeTimePockets(schedule, date) {
  const daySchedule = getScheduleForDay(schedule, date).map((entry) => ({
    start: toMinutes(entry.start),
    end: toMinutes(entry.end)
  }));

  const busy = mergeBusySlots(daySchedule);
  const pockets = [];
  let cursor = MORNING_START;

  busy.forEach((slot) => {
    if (slot.start > cursor) {
      pockets.push({ start: cursor, end: slot.start });
    }
    cursor = Math.max(cursor, slot.end);
  });

  if (cursor < EVENING_END) {
    pockets.push({ start: cursor, end: EVENING_END });
  }

  return pockets.filter((pocket) => (pocket.end - pocket.start) >= 30);
}

function scoreGoal(goal) {
  const priorityScore = { high: 3, medium: 2, low: 1 }[goal.priority] || 1;
  return priorityScore;
}

export function createSuggestedPlan({ goals, habits, categories, workSchedule, date = new Date().toISOString() }) {
  const pockets = getFreeTimePockets(workSchedule, date);
  const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category]));
  const rankedItems = [
    ...habits.filter((habit) => habit.status === "active").map((habit) => ({
      id: habit.id,
      title: habit.title,
      categoryId: habit.categoryId,
      duration: habit.type === "avoid" ? 30 : 45,
      source: "habit",
      intensity: 3
    })),
    ...goals.filter((goal) => goal.status === "active").sort((a, b) => scoreGoal(b) - scoreGoal(a)).map((goal) => ({
      id: goal.id,
      title: goal.title,
      categoryId: goal.categoryId,
      duration: 60,
      source: "goal",
      intensity: scoreGoal(goal)
    }))
  ];

  const blocks = [];
  let itemIndex = 0;

  pockets.forEach((pocket, pocketIndex) => {
    let cursor = pocket.start;
    while (itemIndex < rankedItems.length && (cursor + 30) <= pocket.end) {
      const item = rankedItems[itemIndex];
      const duration = Math.min(item.duration, pocket.end - cursor);
      if (duration < 30) {
        break;
      }

      blocks.push({
        id: `block-${pocketIndex + 1}-${itemIndex + 1}`,
        title: item.title,
        categoryId: item.categoryId,
        categoryLabel: categoryMap[item.categoryId]?.label || "Personal",
        source: item.source,
        status: "suggested",
        start: fromMinutes(cursor),
        end: fromMinutes(cursor + duration),
        notes: item.source === "habit" ? "Small consistent win." : "Progress block toward a bigger goal.",
        reminderOffsetMinutes: 15
      });

      cursor += duration + 15;
      itemIndex += 1;
    }
  });

  return {
    date: new Date(date).toISOString().slice(0, 10),
    status: "draft",
    focusSummary: blocks.length
      ? `You have ${blocks.length} intentional blocks built around your work schedule.`
      : "Your day looks packed, so focus on one tiny win and protect your attention.",
    blocks
  };
}

export function computeProgressSnapshot({ habits, planDay, date = new Date().toISOString() }) {
  const completedBlocks = (planDay?.blocks || []).filter((block) => block.status === "done").length;
  const skippedBlocks = (planDay?.blocks || []).filter((block) => block.status === "skipped").length;
  const activeHabits = habits.filter((habit) => habit.status === "active").length;
  const streakCount = habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);

  return {
    id: `snapshot-${new Date(date).toISOString().slice(0, 10)}`,
    date: new Date(date).toISOString().slice(0, 10),
    completedBlocks,
    skippedBlocks,
    activeHabits,
    strongestStreak: streakCount
  };
}
