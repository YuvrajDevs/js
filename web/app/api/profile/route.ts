import { NextResponse } from "next/server"; import fs from "node:fs"; import path from "node:path"; import YAML from "yaml"; import { ROOT } from "@/lib/server";
const P = path.join(ROOT, "profile/profile.yml"), EX = path.join(ROOT, "profile/profile.example.yml");
export const dynamic = "force-dynamic";
export const GET = () => NextResponse.json({ yaml: fs.readFileSync(fs.existsSync(P) ? P : EX, "utf8"), exists: fs.existsSync(P) });
export async function PUT(req: Request) {
  const { yaml } = await req.json();
  try { YAML.parse(yaml); } catch (e: any) { return NextResponse.json({ error: "Invalid YAML: " + e.message }, { status: 400 }); }
  fs.writeFileSync(P, yaml); return NextResponse.json({ ok: true });
}
