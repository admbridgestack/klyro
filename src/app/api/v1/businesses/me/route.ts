import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, validationError, internalError } from "@/lib/api/errors";
import { updateBusinessSchema } from "@/lib/schemas/business";
import type { Database } from "@/types/database";

type BusinessUpdate = Database["public"]["Tables"]["businesses"]["Update"];

export async function GET() {
  const supabase = await createClient();
  let businessId: string;
  try {
    businessId = await getOwnerBusinessId(supabase);
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    if (e instanceof BusinessNotFoundError) return notFound("No business found");
    return internalError();
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (error || !business) {
    return notFound("Business not found");
  }

  return NextResponse.json({
    data: business,
    _links: {
      self: { href: "/api/v1/businesses/me", method: "GET" },
      update: { href: "/api/v1/businesses/me", method: "PATCH" },
    },
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  let businessId: string;
  try {
    businessId = await getOwnerBusinessId(supabase);
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    if (e instanceof BusinessNotFoundError) return notFound("No business found");
    return internalError();
  }

  const body = await req.json();
  const parsed = updateBusinessSchema.partial().safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const msg = issue?.message ?? "Validation error";
    const field = issue?.path[0] !== undefined ? String(issue.path[0]) : undefined;
    return validationError(msg, field);
  }

  const d = parsed.data;
  const updates: BusinessUpdate = {
    ...(d.name !== undefined && { name: d.name }),
    ...(d.vertical !== undefined && { vertical: d.vertical }),
    ...(d.default_language !== undefined && { default_language: d.default_language }),
    ...(d.default_currency !== undefined && { default_currency: d.default_currency }),
    ...(d.whatsapp_number !== undefined && { whatsapp_number: d.whatsapp_number }),
    ...(d.sms_enabled !== undefined && { sms_enabled: d.sms_enabled }),
    ...(d.email_enabled !== undefined && { email_enabled: d.email_enabled }),
    ...(d.default_cancellation_hours !== undefined && { default_cancellation_hours: d.default_cancellation_hours }),
  };

  const { data: updated, error } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", businessId)
    .select()
    .single();

  if (error || !updated) {
    return internalError();
  }

  return NextResponse.json({
    data: updated,
    _links: {
      self: { href: "/api/v1/businesses/me", method: "GET" },
      update: { href: "/api/v1/businesses/me", method: "PATCH" },
    },
  });
}
