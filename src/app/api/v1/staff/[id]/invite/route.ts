import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: { code: "NOT_IMPLEMENTED", message: "Staff invites are not available yet." } },
    { status: 501 },
  );
}
