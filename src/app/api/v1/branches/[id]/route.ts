import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { updateBranchSchema } from "@/lib/schemas/branch";

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

  void businessId;

  const { data: branch, error } = await supabase
    .from("branches")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !branch) return notFound();

  return NextResponse.json({
    data: branch,
    _links: {
      self: { href: `/api/v1/branches/${id}`, method: "GET" },
      update: { href: `/api/v1/branches/${id}`, method: "PATCH" },
      delete: { href: `/api/v1/branches/${id}`, method: "DELETE" },
    },
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

  void businessId;

  const body = await req.json();
  const parsed = updateBranchSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return validationError(issue?.message ?? "Validation error", issue?.path[0] !== undefined ? String(issue.path[0]) : undefined);
  }

  const { data: branch, error } = await supabase
    .from("branches")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !branch) return notFound();

  return NextResponse.json({
    data: branch,
    _links: {
      self: { href: `/api/v1/branches/${id}`, method: "GET" },
      update: { href: `/api/v1/branches/${id}`, method: "PATCH" },
      delete: { href: `/api/v1/branches/${id}`, method: "DELETE" },
    },
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

  void businessId;

  const { data: branch, error } = await supabase
    .from("branches")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error || !branch) return notFound();

  return new NextResponse(null, { status: 204 });
}
