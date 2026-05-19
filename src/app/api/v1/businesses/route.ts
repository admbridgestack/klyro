import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, validationError, internalError, toErrorResponse } from "@/lib/api/errors";
import { createBusinessSchema } from "@/lib/schemas/business";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return unauthorized();
  }

  const userId = authData.user.id;

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", userId)
    .single();

  if (userError || !userRow) {
    return internalError();
  }

  if (userRow.business_id !== null) {
    return toErrorResponse(409, "BOOKING_CONFLICT", "Business already exists for this user");
  }

  const body = await req.json();
  const parsed = createBusinessSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const msg = issue?.message ?? "Validation error";
    const field = issue?.path[0] !== undefined ? String(issue.path[0]) : undefined;
    return validationError(msg, field);
  }

  const { data: newBusiness, error: insertError } = await supabase
    .from("businesses")
    .insert(parsed.data)
    .select()
    .single();

  if (insertError || !newBusiness) {
    return internalError();
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ business_id: newBusiness.id })
    .eq("id", userId);

  if (updateError) {
    return internalError();
  }

  return NextResponse.json(
    {
      data: newBusiness,
      _links: { self: { href: "/api/v1/businesses/me", method: "GET" } },
    },
    {
      status: 201,
      headers: { Location: "/api/v1/businesses/me" },
    },
  );
}
