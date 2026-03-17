import OpenAI from "openai";
import { z } from "zod";
import { createSuggestedPlan } from "@/lib/planner";

const planSchema = z.object({
  focusSummary: z.string(),
  blocks: z.array(z.object({
    title: z.string(),
    categoryId: z.string(),
    categoryLabel: z.string(),
    start: z.string(),
    end: z.string(),
    notes: z.string(),
    source: z.string().default("ai"),
    status: z.string().default("suggested"),
    reminderOffsetMinutes: z.number().default(15)
  }))
});

function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function isDemoEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE !== "false";
}

function buildSystemPrompt() {
  return [
    "You are a compassionate life coach and daily planner.",
    "Turn the user's free time into realistic, kind, momentum-building blocks.",
    "Honor work hours and avoid overstuffing the day.",
    "Prefer concrete actions across faith, focus, fitness, finance, learning, relationships, and content when relevant.",
    "Return structured JSON only."
  ].join(" ");
}

export async function generateCoachReply(payload) {
  if (!hasOpenAI()) {
    if (!isDemoEnabled()) {
      throw new Error("OPENAI_API_KEY is required when demo mode is disabled.");
    }

    const plan = createSuggestedPlan(payload);
    return {
      reply: `You have ${plan.blocks.length} good opportunities to protect today. Start with the first meaningful block and treat it like an appointment with your future self.`,
      plan
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: buildSystemPrompt() },
      {
        role: "user",
        content: JSON.stringify({
          today: new Date().toISOString().slice(0, 10),
          profile: payload.profile,
          goals: payload.goals,
          habits: payload.habits,
          workSchedule: payload.workSchedule,
          memoryItems: payload.memoryItems?.slice(0, 8),
          recentMessages: payload.chatMessages?.slice(-6)
        })
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "day_plan",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            reply: { type: "string" },
            focusSummary: { type: "string" },
            blocks: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  categoryId: { type: "string" },
                  categoryLabel: { type: "string" },
                  start: { type: "string" },
                  end: { type: "string" },
                  notes: { type: "string" },
                  source: { type: "string" },
                  status: { type: "string" },
                  reminderOffsetMinutes: { type: "number" }
                },
                required: ["title", "categoryId", "categoryLabel", "start", "end", "notes"]
              }
            }
          },
          required: ["reply", "focusSummary", "blocks"]
        }
      }
    }
  });

  const parsed = JSON.parse(response.output_text);
  const plan = planSchema.parse({
    focusSummary: parsed.focusSummary,
    blocks: parsed.blocks
  });

  return {
    reply: parsed.reply,
    plan: {
      date: new Date().toISOString().slice(0, 10),
      status: "draft",
      ...plan,
      blocks: plan.blocks.map((block, index) => ({
        ...block,
        id: `ai-block-${index + 1}`
      }))
    }
  };
}
