import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { replaceAvailabilitySchema } from "@/lib/schemas/availability";

export async function GET(
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

  const branch_id = req.nextUrl.searchParams.get("branch_id");
  if (!branch_id) return validationError("branch_id is required", "branch_id");

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!staffRow) return notFound("Staff member not found");

  const { data: slots, error } = await supabase
    .from("staff_availability")
    .select("*")
    .eq("staff_id", id)
    .eq("branch_id", branch_id);

  if (error) return internalError();

  return NextResponse.json({
    data: slots,
    meta: { total: slots.length, staff_id: id, branch_id },
    _links: { self: { href: `/api/v1/staff/${id}/availability`, method: "GET" } },
  });
}

export async function PUT(
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
  const parsed = replaceAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    const e = parsed.error.issues[0];
    return validationError(e?.message ?? "Validation error", e?.path.join("."));
  }

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!staffRow) return notFound("Staff member not found");

  const { branch_id, slots } = parsed.data;

  const { error: deleteError } = await supabase
    .from("staff_availability")
    .delete()
    .eq("staff_id", id)
    .eq("branch_id", branch_id);

  if (deleteError) return internalError();

  if (slots.length > 0) {
    const rows = slots.map((s) => ({
      staff_id: id,
      branch_id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
    }));
    const { error: insertError } = await supabase.from("staff_availability").insert(rows);
    if (insertError) return internalError();
  }

  return NextResponse.json({
    data: { staff_id: id, branch_id, slots },
    _links: { self: { href: `/api/v1/staff/${id}/availability`, method: "GET" } },
  });
}
