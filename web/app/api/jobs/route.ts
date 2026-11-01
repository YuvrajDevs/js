import { readJobs } from "@/lib/server"; import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const GET = () => NextResponse.json(readJobs());
