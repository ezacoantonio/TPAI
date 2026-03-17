import { PRESET_CATEGORIES, DEFAULT_WORK_SCHEDULE, createEmptyState } from "@/lib/defaults";
import { computeProgressSnapshot } from "@/lib/planner";

function seedAssistantMessage() {
  return [
    {
      id: "msg-1",
      role: "assistant",
      content: "We can turn your free time into deliberate growth blocks. Start with what matters most today.",
      createdAt: new Date().toISOString()
    }
  ];
}

async function ensurePresetCategories(client, userId) {
  const { data: existing } = await client
    .from("life_categories")
    .select("label")
    .eq("user_id", userId);

  const existingLabels = new Set((existing || []).map((item) => item.label.toLowerCase()));
  const missing = PRESET_CATEGORIES.filter((category) => !existingLabels.has(category.label.toLowerCase())).map((category) => ({
    user_id: userId,
    label: category.label,
    color: category.color,
    is_custom: false
  }));

  if (missing.length) {
    await client.from("life_categories").insert(missing);
  }
}

function toClientState({
  profile,
  categories,
  goals,
  habits,
  workSchedule,
  chatMessages,
  memoryItems,
  progressSnapshots,
  planDay
}) {
  const base = createEmptyState();

  return {
    ...base,
    profile: profile || base.profile,
    categories: categories?.length ? categories : base.categories,
    goals: goals || [],
    habits: habits || [],
    workSchedule: workSchedule?.length ? workSchedule : DEFAULT_WORK_SCHEDULE,
    chatMessages: chatMessages?.length ? chatMessages : seedAssistantMessage(),
    memoryItems: memoryItems || [],
    progressSnapshots: progressSnapshots || [],
    planDay: planDay || null
  };
}

export async function loadUserState(client, user) {
  await ensurePresetCategories(client, user.id);

  const [
    profileResult,
    categoriesResult,
    goalsResult,
    habitsResult,
    scheduleResult,
    messagesResult,
    memoryResult,
    progressResult,
    planDayResult
  ] = await Promise.all([
    client.from("user_profiles").select("*").eq("id", user.id).maybeSingle(),
    client.from("life_categories").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    client.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    client.from("habits").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    client.from("work_schedule_entries").select("*").eq("user_id", user.id).order("weekday", { ascending: true }),
    client.from("chat_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true }).limit(20),
    client.from("memory_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(12),
    client.from("progress_snapshots").select("*").eq("user_id", user.id).order("day", { ascending: false }).limit(7),
    client.from("plan_days").select("*, plan_blocks(*)").eq("user_id", user.id).order("day", { ascending: false }).limit(1).maybeSingle()
  ]);

  const profile = profileResult.data
    ? {
        name: profileResult.data.full_name || "",
        timezone: profileResult.data.timezone,
        mission: profileResult.data.mission || "",
        planningStyle: profileResult.data.planning_style || "balanced",
        reminderWindow: profileResult.data.reminder_window || 15
      }
    : null;

  const categories = (categoriesResult.data || []).map((item) => ({
    id: item.id,
    label: item.label,
    color: item.color || "#1f8f82",
    custom: item.is_custom
  }));

  const goals = (goalsResult.data || []).map((item) => ({
    id: item.id,
    title: item.title,
    categoryId: item.category_id,
    priority: item.priority,
    status: item.status
  }));

  const habits = (habitsResult.data || []).map((item) => ({
    id: item.id,
    title: item.title,
    categoryId: item.category_id,
    type: item.habit_type,
    cadence: item.cadence,
    streak: item.streak,
    status: item.status
  }));

  const workSchedule = (scheduleResult.data || []).map((item) => ({
    day: item.weekday,
    start: item.start_time,
    end: item.end_time
  }));

  const chatMessages = (messagesResult.data || []).map((item) => ({
    id: item.id,
    role: item.role,
    content: item.content,
    createdAt: item.created_at
  }));

  const memoryItems = (memoryResult.data || []).map((item) => ({
    id: item.id,
    kind: item.kind,
    title: item.title,
    summary: item.summary,
    tags: item.tags || [],
    relevance: item.relevance,
    createdAt: item.created_at
  }));

  const progressSnapshots = (progressResult.data || []).map((item) => ({
    id: item.id,
    date: item.day,
    completedBlocks: item.completed_blocks,
    skippedBlocks: item.skipped_blocks,
    activeHabits: item.active_habits,
    strongestStreak: item.strongest_streak
  }));

  const planDay = planDayResult.data
    ? {
        id: planDayResult.data.id,
        date: planDayResult.data.day,
        status: planDayResult.data.status,
        focusSummary: planDayResult.data.focus_summary || "",
        blocks: (planDayResult.data.plan_blocks || []).sort((a, b) => a.start_time.localeCompare(b.start_time)).map((block) => ({
          id: block.id,
          planDayId: planDayResult.data.id,
          title: block.title,
          categoryId: block.category_id,
          categoryLabel: block.category_label || "Personal",
          source: block.source,
          status: block.status,
          start: block.start_time,
          end: block.end_time,
          notes: block.notes || "",
          reminderOffsetMinutes: block.reminder_offset_minutes || 15
        }))
      }
    : null;

  return toClientState({
    profile,
    categories,
    goals,
    habits,
    workSchedule,
    chatMessages,
    memoryItems,
    progressSnapshots,
    planDay
  });
}

export async function saveOnboarding(client, user, payload) {
  const { name, mission, customCategory, workSchedule } = payload;

  await client.from("user_profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: name,
    mission,
    timezone: "America/Toronto",
    planning_style: "balanced",
    reminder_window: 15
  });

  await ensurePresetCategories(client, user.id);

  if (customCategory) {
    const { data: existingCategory } = await client
      .from("life_categories")
      .select("id")
      .eq("user_id", user.id)
      .ilike("label", customCategory)
      .maybeSingle();

    if (!existingCategory) {
      await client.from("life_categories").insert({
        user_id: user.id,
        label: customCategory,
        color: "#1f8f82",
        is_custom: true
      });
    }
  }

  await client.from("work_schedule_entries").delete().eq("user_id", user.id);
  await client.from("work_schedule_entries").insert(
    workSchedule.map((entry) => ({
      user_id: user.id,
      weekday: entry.day,
      start_time: entry.start,
      end_time: entry.end,
      reminder_offset_minutes: 15
    }))
  );

  return loadUserState(client, user);
}

export async function persistChatAndPlan(client, user, latestUserMessage, result, habits) {
  const planDate = result.plan.date;

  if (latestUserMessage) {
    await client.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: latestUserMessage.content
    });

    await client.from("memory_items").insert({
      user_id: user.id,
      kind: "reflection",
      title: "Check-in insight",
      summary: latestUserMessage.content.slice(0, 180),
      tags: ["chat", "daily"],
      relevance: 0.7
    });
  }

  await client.from("chat_messages").insert({
    user_id: user.id,
    role: "assistant",
    content: result.reply
  });

  const { data: planDay, error: planError } = await client
    .from("plan_days")
    .upsert({
      user_id: user.id,
      day: planDate,
      status: "draft",
      focus_summary: result.plan.focusSummary
    }, {
      onConflict: "user_id,day"
    })
    .select("*")
    .single();

  if (planError) {
    throw planError;
  }

  await client.from("plan_blocks").delete().eq("plan_day_id", planDay.id);

  if (result.plan.blocks.length) {
    await client.from("plan_blocks").insert(
      result.plan.blocks.map((block) => ({
        plan_day_id: planDay.id,
        category_id: null,
        category_label: block.categoryLabel,
        title: block.title,
        start_time: block.start,
        end_time: block.end,
        status: block.status,
        source: block.source,
        notes: block.notes,
        reminder_offset_minutes: block.reminderOffsetMinutes || 15
      }))
    );
  }

  const { data: persistedBlocks } = await client
    .from("plan_blocks")
    .select("*")
    .eq("plan_day_id", planDay.id)
    .order("start_time", { ascending: true });

  const persistedPlan = {
    id: planDay.id,
    date: planDay.day,
    status: planDay.status,
    focusSummary: planDay.focus_summary || "",
    blocks: (persistedBlocks || []).map((block) => ({
      id: block.id,
      planDayId: planDay.id,
      title: block.title,
      categoryId: block.category_id,
      categoryLabel: block.category_label || "Personal",
      source: block.source,
      status: block.status,
      start: block.start_time,
      end: block.end_time,
      notes: block.notes || "",
      reminderOffsetMinutes: block.reminder_offset_minutes || 15
    }))
  };

  const snapshot = computeProgressSnapshot({
    habits,
    planDay: persistedPlan,
    date: `${planDate}T00:00:00.000Z`
  });

  await client.from("progress_snapshots").upsert({
    user_id: user.id,
    day: snapshot.date,
    completed_blocks: snapshot.completedBlocks,
    skipped_blocks: snapshot.skippedBlocks,
    active_habits: snapshot.activeHabits,
    strongest_streak: snapshot.strongestStreak
  }, {
    onConflict: "user_id,day"
  });

  return persistedPlan;
}

export async function updatePlanBlockStatus(client, user, payload, habits) {
  const { planDayId, blockId, status } = payload;
  const { data: planDay } = await client
    .from("plan_days")
    .select("*")
    .eq("id", planDayId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!planDay) {
    throw new Error("Plan day not found.");
  }

  const { data: updatedBlock, error } = await client
    .from("plan_blocks")
    .update({ status })
    .eq("id", blockId)
    .eq("plan_day_id", planDayId)
    .select("*")
    .single();

  if (error || !updatedBlock) {
    throw error || new Error("Plan block not found.");
  }

  const { data: blocks } = await client
    .from("plan_blocks")
    .select("*")
    .eq("plan_day_id", planDayId)
    .order("start_time", { ascending: true });

  const plan = {
    id: planDay.id,
    date: planDay.day,
    status: planDay.status,
    focusSummary: planDay.focus_summary || "",
    blocks: (blocks || []).map((block) => ({
      id: block.id,
      planDayId: planDay.id,
      title: block.title,
      categoryId: block.category_id,
      categoryLabel: block.category_label || "Personal",
      source: block.source,
      status: block.status,
      start: block.start_time,
      end: block.end_time,
      notes: block.notes || "",
      reminderOffsetMinutes: block.reminder_offset_minutes || 15
    }))
  };

  const snapshot = computeProgressSnapshot({
    habits,
    planDay: plan,
    date: `${plan.date}T00:00:00.000Z`
  });

  await client.from("progress_snapshots").upsert({
    user_id: user.id,
    day: snapshot.date,
    completed_blocks: snapshot.completedBlocks,
    skipped_blocks: snapshot.skippedBlocks,
    active_habits: snapshot.activeHabits,
    strongest_streak: snapshot.strongestStreak
  }, {
    onConflict: "user_id,day"
  });

  return { plan, snapshot };
}
