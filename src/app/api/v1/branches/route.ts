import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError, toErrorResponse } from "@/lib/api/errors";
import { createBranchSchema } from "@/lib/schemas/branch";

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  let businessId: string;
  try {
    businessId = await getOwnerBusinessId(supabase);
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    if (e instanceof BusinessNotFoundError) return notFound("No business found");
    return internalError();
  }

  const { data: branches, error } = await supabase
    .from("branches")
    .select("*")
    .eq("is_active", true);

  if (error) return internalError();

  return NextResponse.json({
    data: branches,
    meta: { total: branches.length },
    _links: {
      self: { href: "/api/v1/branches", method: "GET" },
      create: { href: "/api/v1/branches", method: "POST" },
    },
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
  const parsed = createBranchSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return validationError(issue?.message ?? "Validation error", issue?.path[0] !== undefined ? String(issue.path[0]) : undefined);
  }

  const { data: existing, error: slugError } = await supabase
    .from("branches")
    .select("id")
    .eq("slug", parsed.data.slug)
    .eq("business_id", businessId)
    .maybeSingle();

  if (slugError) return internalError();
  if (existing) return toErrorResponse(409, "BOOKING_CONFLICT", "Slug already in use", "slug");

  const { data: branch, error: insertError } = await supabase
    .from("branches")
    .insert({ ...parsed.data, business_id: businessId })
    .select()
    .single();

  if (insertError || !branch) return internalError();

  return NextResponse.json(
    {
      data: branch,
      _links: {
        self: { href: `/api/v1/branches/${branch.id}`, method: "GET" },
      },
    },
    {
      status: 201,
      headers: { Location: `/api/v1/branches/${branch.id}` },
    },
  );
}
