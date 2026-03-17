import { z } from "zod";

export const workScheduleEntrySchema = z.object({
  day: z.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/)
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(80),
  mission: z.string().trim().min(3).max(500),
  customCategory: z.string().trim().max(60).optional().default(""),
  workSchedule: z.array(workScheduleEntrySchema).min(1)
});

export const blockStatusSchema = z.object({
  planDayId: z.string().uuid(),
  blockId: z.string().uuid(),
  status: z.enum(["suggested", "approved", "done", "skipped"])
});

export const chatPayloadSchema = z.object({
  profile: z.object({
    name: z.string().optional().default(""),
    timezone: z.string().optional().default("America/Toronto"),
    mission: z.string().optional().default(""),
    planningStyle: z.string().optional().default("balanced"),
    reminderWindow: z.number().optional().default(15)
  }),
  categories: z.array(z.object({
    id: z.string(),
    label: z.string(),
    color: z.string().optional()
  })).default([]),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    categoryId: z.string().nullable().optional(),
    priority: z.string().optional(),
    status: z.string().optional()
  })).default([]),
  habits: z.array(z.object({
    id: z.string(),
    title: z.string(),
    categoryId: z.string().nullable().optional(),
    type: z.string().optional(),
    cadence: z.string().optional(),
    streak: z.number().optional(),
    status: z.string().optional()
  })).default([]),
  workSchedule: z.array(workScheduleEntrySchema).default([]),
  memoryItems: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    summary: z.string()
  })).default([]),
  chatMessages: z.array(z.object({
    id: z.string().optional(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    createdAt: z.string().optional()
  })).default([])
});
