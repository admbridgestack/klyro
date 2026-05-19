import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError, validationError } from "@/lib/api/errors";
import { bulkServicesSchema } from "@/lib/schemas/service";

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
  const parsed = bulkServicesSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return validationError(issue?.message ?? "Validation error", issue?.path[0] !== undefined ? String(issue.path[0]) : undefined);
  }

  const { data: createdServices, error } = await supabase
    .from("services")
    .insert(parsed.data.services.map((s) => ({ ...s, business_id: businessId })))
    .select();

  if (error || !createdServices) return internalError();

  return NextResponse.json(
    {
      data: createdServices,
      meta: { total: createdServices.length },
      _links: {
        self: { href: "/api/v1/services/bulk", method: "POST" },
      },
    },
    {
      status: 201,
      headers: { Location: "/api/v1/services" },
    },
  );
}
