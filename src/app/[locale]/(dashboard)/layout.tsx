import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
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

  const email = user.email ?? "";
  const userInitial = (
    user.user_metadata?.["full_name"] ??
    user.user_metadata?.["name"] ??
    email
  )
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)]">
      <Sidebar locale={locale} userEmail={email} userInitial={userInitial} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
