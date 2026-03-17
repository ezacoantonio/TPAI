import { NextResponse } from "next/server";
import { loadUserState } from "@/lib/persistence";
import { requireSupabaseUser } from "@/lib/supabase-server";

export async function GET(request) {
  const { client, user, error } = await requireSupabaseUser(request);
  if (error || !client || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await loadUserState(client, user);
    return NextResponse.json(state);
  } catch (loadError) {
    return NextResponse.json({ error: loadError.message || "Unable to load app state." }, { status: 500 });
  }
}
