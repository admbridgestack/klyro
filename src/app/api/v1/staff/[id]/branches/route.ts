import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { assignBranchesSchema } from "@/lib/schemas/staff";

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
  const parsed = assignBranchesSchema.safeParse(body);
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

  const { error: deleteError } = await supabase
    .from("staff_branches")
    .delete()
    .eq("staff_id", id);

  if (deleteError) return internalError();

  const { branch_ids } = parsed.data;

  if (branch_ids.length > 0) {
    const rows = branch_ids.map((bid) => ({ staff_id: id, branch_id: bid }));
    const { error: insertError } = await supabase.from("staff_branches").insert(rows);
    if (insertError) return internalError();
  }

  return NextResponse.json({
    data: { staff_id: id, branch_ids },
    _links: { self: { href: `/api/v1/staff/${id}/branches`, method: "POST" } },
  });
}
