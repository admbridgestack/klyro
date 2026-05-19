import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, validationError, internalError } from "@/lib/api/errors";
import { checkSlugSchema } from "@/lib/schemas/business";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return unauthorized();
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return validationError("slug is required", "slug");
  }

  const parsed = checkSlugSchema.safeParse({ slug });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const msg = issue?.message ?? "Validation error";
    return validationError(msg, "slug");
  }

  const { count, error } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);

  if (error) {
    return internalError();
  }

  if ((count ?? 0) > 0) {
    const rand = Math.random().toString(36).slice(2, 6);
    return NextResponse.json({
      data: {
        available: false,
        suggestions: [`${slug}-1`, `${slug}-2`, `${slug}-${rand}`],
      },
    });
  }

  return NextResponse.json({ data: { available: true } });
}
