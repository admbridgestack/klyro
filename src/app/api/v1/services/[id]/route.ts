import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { updateServiceSchema } from "@/lib/schemas/service";

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

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !service) return notFound();

  return NextResponse.json({
    data: service,
    _links: {
      self: { href: `/api/v1/services/${id}`, method: "GET" },
      update: { href: `/api/v1/services/${id}`, method: "PATCH" },
      delete: { href: `/api/v1/services/${id}`, method: "DELETE" },
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
  const parsed = updateServiceSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return validationError(issue?.message ?? "Validation error", issue?.path[0] !== undefined ? String(issue.path[0]) : undefined);
  }

  const { data: service, error } = await supabase
    .from("services")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !service) return notFound();

  return NextResponse.json({
    data: service,
    _links: {
      self: { href: `/api/v1/services/${id}`, method: "GET" },
      update: { href: `/api/v1/services/${id}`, method: "PATCH" },
      delete: { href: `/api/v1/services/${id}`, method: "DELETE" },
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

  const { data: service, error } = await supabase
    .from("services")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error || !service) return notFound();

  return new NextResponse(null, { status: 204 });
}
