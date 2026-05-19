import { NextResponse } from "next/server";
import { getActiveVerticals } from "@/lib/verticals/registry";

export async function GET() {
  const verticals = getActiveVerticals().map(
    ({ key, displayName, icon, emoji, status, defaultBufferMinutes, defaultCancellationHours, messagingTone, bookingPageHints }) => ({
      key,
      displayName,
      icon,
      emoji,
      status,
      defaultBufferMinutes,
      defaultCancellationHours,
      messagingTone,
      bookingPageHints,
    }),
  );

  return NextResponse.json({
    data: verticals,
    meta: { total: verticals.length },
    _links: { self: { href: "/api/v1/verticals", method: "GET" } },
  });
}
