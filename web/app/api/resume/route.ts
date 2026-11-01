import { NextResponse } from "next/server"; import fs from "node:fs"; import { resumePath } from "@/lib/server";
export const dynamic = "force-dynamic";
export function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? ""; const p = resumePath(id);
  return fs.existsSync(p) ? NextResponse.json({ resume: fs.readFileSync(p, "utf8") }) : NextResponse.json({ resume: null });
}
