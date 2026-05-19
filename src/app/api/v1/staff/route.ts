import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { createStaffSchema } from "@/lib/schemas/staff";

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

  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true);

  if (error) return internalError();

  return NextResponse.json({
    data,
    meta: { total: data.length },
    _links: { self: { href: "/api/v1/staff", method: "GET" } },
  });
}

export async function POST(req: NextRequest) {
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
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    const e = parsed.error.issues[0];
    return validationError(e?.message ?? "Validation error", e?.path.join("."));
  }

  const { display_name, slug, user_id } = parsed.data;

  const { data, error } = await supabase
    .from("staff")
    .insert({ display_name, slug, user_id: user_id ?? null, business_id: businessId })
    .select()
    .single();

  if (error) return internalError();

  return NextResponse.json(
    {
      data,
      _links: { self: { href: `/api/v1/staff/${data.id}`, method: "GET" } },
    },
    {
      status: 201,
      headers: { Location: `/api/v1/staff/${data.id}` },
    },
  );
}
