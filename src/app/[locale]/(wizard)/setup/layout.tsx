import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WizardShell } from "@/components/wizard/WizardShell";

export default async function SetupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Redirect owners who have already completed onboarding
  const { data: userRow } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", user.id)
    .single();

  if (userRow?.business_id) {
    const { data: business } = await supabase
      .from("businesses")
      .select("onboarding_completed")
      .eq("id", userRow.business_id)
      .single();

    if (business?.onboarding_completed) {
      redirect(`/${locale}/dashboard`);
    }
  }

  return <WizardShell locale={locale}>{children}</WizardShell>;
}
