import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { updateStaffSchema } from "@/lib/schemas/staff";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  let businessId: string;
  try {
    businessId = await getOwnerBusinessId(supabase);
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    if (e instanceof BusinessNotFoundError) return notFound("No business found");
    return internalError();
  }

  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (error || !data) return notFound("Staff member not found");

  return NextResponse.json({
    data,
    _links: { self: { href: `/api/v1/staff/${id}`, method: "GET" } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  const parsed = updateStaffSchema.safeParse(body);
  if (!parsed.success) {
    const e = parsed.error.issues[0];
    return validationError(e?.message ?? "Validation error", e?.path.join("."));
  }

  const { data: existing } = await supabase
    .from("staff")
    .select("id")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!existing) return notFound("Staff member not found");

  const { invite_email: _ignored, ...updateFields } = parsed.data;

  const { data, error } = await supabase
    .from("staff")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return internalError();

  return NextResponse.json({
    data,
    _links: { self: { href: `/api/v1/staff/${id}`, method: "GET" } },
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  let businessId: string;
  try {
    businessId = await getOwnerBusinessId(supabase);
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    if (e instanceof BusinessNotFoundError) return notFound("No business found");
    return internalError();
  }

  const { data: existing } = await supabase
    .from("staff")
    .select("id")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!existing) return notFound("Staff member not found");

  const { error } = await supabase
    .from("staff")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return internalError();

  return new NextResponse(null, { status: 204 });
}
