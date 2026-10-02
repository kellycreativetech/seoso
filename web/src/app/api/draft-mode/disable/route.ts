import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

// Leaves draft mode and returns to the page the editor was on.
// Uses a relative redirect: behind Netlify, request.url is the internal deploy URL, not the public one.
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const target = request.nextUrl.searchParams.get("redirect") ?? "/";
  redirect(target.startsWith("/") && !target.startsWith("//") ? target : "/");
}
