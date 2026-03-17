import { NextResponse } from "next/server";
import { generateCoachReply } from "@/lib/ai";

export async function POST(request) {
  try {
    const payload = await request.json();
    const response = await generateCoachReply(payload);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to process chat request." },
      { status: 500 }
    );
  }
}
