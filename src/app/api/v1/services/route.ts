import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { createServiceSchema } from "@/lib/schemas/service";

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

  void businessId;

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true);

  if (error) return internalError();

  return NextResponse.json({
    data: services,
    meta: { total: services.length },
    _links: {
      self: { href: "/api/v1/services", method: "GET" },
      create: { href: "/api/v1/services", method: "POST" },
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
  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return validationError(issue?.message ?? "Validation error", issue?.path[0] !== undefined ? String(issue.path[0]) : undefined);
  }

  const { data: service, error } = await supabase
    .from("services")
    .insert({ ...parsed.data, business_id: businessId })
    .select()
    .single();

  if (error || !service) return internalError();

  return NextResponse.json(
    {
      data: service,
      _links: {
        self: { href: `/api/v1/services/${service.id}`, method: "GET" },
      },
    },
    {
      status: 201,
      headers: { Location: `/api/v1/services/${service.id}` },
    },
  );
}
