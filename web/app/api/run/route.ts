import { NextResponse } from "next/server"; import { runState, startRun } from "@/lib/server";
export const dynamic = "force-dynamic";
export const GET = () => NextResponse.json(runState());
export async function POST(req: Request) {
  const { cmd } = await req.json();
  if (!["scan", "rank", "extract"].includes(cmd)) return NextResponse.json({ error: "bad cmd" }, { status: 400 });
  try { startRun(cmd); return NextResponse.json(runState()); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 409 }); }
}
