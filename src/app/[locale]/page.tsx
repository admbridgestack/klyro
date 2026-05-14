import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/server";

async function getBusinessCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.warn("[HelloKlyro] Supabase not yet configured:", error.message);
      return -1;
    }
    return count ?? 0;
  } catch {
    return -1;
  }
}

export default async function HomePage() {
  const t = await getTranslations("landing");
  const count = await getBusinessCount();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <Logo variant="lockup" theme="dark" />

      <p className="text-lg text-[var(--color-text-secondary)] tracking-tight">
        {t("tagline")}
      </p>

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--color-bg-surface)] px-6 py-4 text-center text-sm text-[var(--color-text-muted)]">
        {count === -1 ? (
          <span>
            Supabase not configured — add credentials to{" "}
            <code className="font-mono text-[var(--color-violet)]">.env.local</code>
          </span>
        ) : (
          <span>
            Supabase connected ✓ &mdash; businesses in DB:{" "}
            <span className="font-bold text-[var(--color-text-primary)]">{count}</span>
          </span>
        )}
      </div>
    </main>
  );
}
