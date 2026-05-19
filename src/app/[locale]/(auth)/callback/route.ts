import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? `/${locale}/dashboard`;
  // Reject protocol-relative URLs (//evil.com) and absolute URLs to prevent open redirect
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : `/${locale}/dashboard`;

  // Supabase sends error params when the link is invalid or expired
  const supabaseError = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  if (supabaseError) {
    const msg = errorDescription ?? supabaseError;
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=${encodeURIComponent(msg)}`
    );
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/${locale}/login?error=${encodeURIComponent("auth_error")}`
  );
}
