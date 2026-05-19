import { NextRequest, NextResponse } from "next/server";
import { getVertical } from "@/lib/verticals/registry";
import type { VerticalKey } from "@/lib/verticals/registry";
import { notFound } from "@/lib/api/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const vertical = getVertical(key as VerticalKey);

  if (!vertical || vertical.status !== "active") {
    return notFound("Vertical not found");
  }

  const { defaultServices, defaultBufferMinutes, defaultCancellationHours, messagingTone, bookingPageHints } = vertical;

  return NextResponse.json({
    data: { key, defaultServices, defaultBufferMinutes, defaultCancellationHours, messagingTone, bookingPageHints },
    _links: { self: { href: `/api/v1/verticals/${key}/defaults`, method: "GET" } },
  });
}
