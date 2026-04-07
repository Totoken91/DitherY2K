import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export interface GuestbookEntry {
  name: string;
  message: string;
  date: string;
}

// GET: return all guestbook entries
export async function GET() {
  if (!redis) {
    return Response.json({ entries: [] });
  }
  const entries =
    (await redis.lrange<GuestbookEntry>("guestbook", 0, 99)) ?? [];
  return Response.json({ entries });
}

// POST: add a guestbook entry
export async function POST(req: NextRequest) {
  if (!redis) {
    return Response.json({ error: "Guestbook not configured" }, { status: 503 });
  }

  const body = await req.json();
  const name = String(body.name || "").trim().slice(0, 50);
  const message = String(body.message || "").trim().slice(0, 280);

  if (!name || !message) {
    return Response.json({ error: "Name and message required" }, { status: 400 });
  }

  const entry: GuestbookEntry = {
    name,
    message,
    date: new Date().toISOString().split("T")[0],
  };

  // Prepend (newest first), cap at 100 entries
  await redis.lpush("guestbook", entry);
  await redis.ltrim("guestbook", 0, 99);

  return Response.json({ entry });
}
