import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
  /vercel/i, /preview/i, /headless/i, /phantom/i, /puppeteer/i,
  /lighthouse/i, /chrome-lighthouse/i, /pagespeed/i, /gtmetrix/i,
  /pingdom/i, /uptimerobot/i,
];

function isBot(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") || "";
  if (!ua || ua.length < 10) return true;
  if (BOT_PATTERNS.some((p) => p.test(ua))) return true;
  // Vercel deployment probes often have these headers
  if (req.headers.get("x-vercel-deployment-url")) return true;
  if (req.headers.get("purpose") === "prefetch") return true;
  return false;
}

// GET: return current count
export async function GET() {
  if (!redis) {
    return Response.json({ count: 48731 }); // fallback
  }
  const count = (await redis.get<number>("visitor_count")) ?? 48731;
  return Response.json({ count });
}

// POST: increment counter (if not a bot)
export async function POST(req: NextRequest) {
  if (!redis) {
    return Response.json({ count: 48731 });
  }
  if (isBot(req)) {
    const count = (await redis.get<number>("visitor_count")) ?? 48731;
    return Response.json({ count, filtered: true });
  }
  const count = await redis.incr("visitor_count");
  return Response.json({ count });
}
