import { NextResponse } from "next/server";
import { saveOnboarding } from "@/lib/persistence";
import { requireSupabaseUser } from "@/lib/supabase-server";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request) {
  const { client, user, error } = await requireSupabaseUser(request);
  if (error || !client || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = onboardingSchema.parse(await request.json());
    const state = await saveOnboarding(client, user, payload);
    return NextResponse.json(state);
  } catch (saveError) {
    return NextResponse.json({ error: saveError.message || "Unable to save onboarding." }, { status: 400 });
  }
}
