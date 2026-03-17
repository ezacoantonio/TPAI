import { NextResponse } from "next/server";
import { generateCoachReply } from "@/lib/ai";
import { loadUserState, persistChatAndPlan } from "@/lib/persistence";
import { requireSupabaseUser } from "@/lib/supabase-server";
import { chatPayloadSchema } from "@/lib/validation";

export async function POST(request) {
  try {
    const payload = chatPayloadSchema.parse(await request.json());
    const response = await generateCoachReply(payload);
    const auth = await requireSupabaseUser(request);

    if (auth.client && auth.user) {
      const persistedState = await loadUserState(auth.client, auth.user);
      const latestUserMessage = payload.chatMessages[payload.chatMessages.length - 1];
      response.plan = await persistChatAndPlan(
        auth.client,
        auth.user,
        latestUserMessage?.role === "user" ? latestUserMessage : null,
        response,
        persistedState.habits
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat route failed:", error);
    return NextResponse.json(
      { error: error.message || "Unable to process chat request." },
      { status: 500 }
    );
  }
}
