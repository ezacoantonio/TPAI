import { NextResponse } from "next/server";
import { loadUserState, updatePlanBlockStatus } from "@/lib/persistence";
import { requireSupabaseUser } from "@/lib/supabase-server";
import { blockStatusSchema } from "@/lib/validation";

export async function PATCH(request) {
  const { client, user, error } = await requireSupabaseUser(request);
  if (error || !client || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = blockStatusSchema.parse(await request.json());
    const currentState = await loadUserState(client, user);
    const result = await updatePlanBlockStatus(client, user, payload, currentState.habits);
    return NextResponse.json(result);
  } catch (updateError) {
    return NextResponse.json({ error: updateError.message || "Unable to update plan block." }, { status: 400 });
  }
}
