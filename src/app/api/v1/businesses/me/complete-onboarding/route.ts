import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOwnerBusinessId, AuthError, BusinessNotFoundError } from "@/lib/supabase/owner";
import { unauthorized, notFound, internalError } from "@/lib/api/errors";

export async function POST() {
  const supabase = await createClient();
  let businessId: string;
  try {
    businessId = await getOwnerBusinessId(supabase);
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    if (e instanceof BusinessNotFoundError) return notFound("No business found");
    return internalError();
  }

  const { error } = await supabase
    .from("businesses")
    .update({ onboarding_completed: true })
    .eq("id", businessId);

  if (error) {
    return internalError();
  }

  return NextResponse.json({
    data: { onboarding_completed: true },
    _links: { self: { href: "/api/v1/businesses/me", method: "GET" } },
  });
}
