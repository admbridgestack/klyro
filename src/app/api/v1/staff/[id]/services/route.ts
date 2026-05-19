import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { assignServicesSchema } from "@/lib/schemas/staff";

export async function POST(
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
  const parsed = assignServicesSchema.safeParse(body);
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

  const { service_ids } = parsed.data;

  return NextResponse.json({
    data: { staff_id: id, service_ids },
    _links: { self: { href: `/api/v1/staff/${id}/services`, method: "POST" } },
  });
}
