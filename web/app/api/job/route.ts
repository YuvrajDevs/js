import { NextResponse } from "next/server"; import fs from "node:fs";
import { patchJob, runOnce, detach, resumePath } from "@/lib/server";
// POST {id, action: "status"|"tailor"|"apply", status?}
export async function POST(req: Request) {
  const { id, action, status } = await req.json();
  try {
    if (action === "status") patchJob(id, { status });
    else if (action === "tailor") { await runOnce("tailor", [id]); return NextResponse.json({ ok: true, resume: fs.readFileSync(resumePath(id), "utf8") }); }
    else if (action === "apply") { detach("apply", [id]); }
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 400 }); }
}
