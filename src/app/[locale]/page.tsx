import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/shared/Logo";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type CountResult =
  | { status: "ok"; count: number }
  | { status: "no_service_key" }
  | { status: "error"; message: string };

async function getBusinessCount(): Promise<CountResult> {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceKey) {
    return { status: "no_service_key" };
  }

  try {
    const supabase = createServiceClient<Database>(url, serviceKey, {
      auth: { persistSession: false },
    });
    const { count, error } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.warn("[HelloKlyro] Supabase query failed:", error.message);
      return { status: "error", message: error.message };
    }
    return { status: "ok", count: count ?? 0 };
  } catch (e) {
    return { status: "error", message: String(e) };
  }
}

export default async function HomePage() {
  const t = await getTranslations("landing");
  const result = await getBusinessCount();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <Logo variant="lockup" theme="dark" />

      <p className="text-lg text-[var(--color-text-secondary)] tracking-tight">
        {t("tagline")}
      </p>

      <div className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--color-bg-surface)] px-6 py-4 text-center text-sm text-[var(--color-text-muted)]">
        {result.status === "ok" ? (
          <span>
            Supabase connected ✓ &mdash; businesses in DB:{" "}
            <span className="font-bold text-[var(--color-text-primary)]">{result.count}</span>
          </span>
        ) : result.status === "no_service_key" ? (
          <span>
            Add <code className="font-mono text-[var(--color-violet)]">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
            <code className="font-mono text-[var(--color-violet)]">.env.local</code>
          </span>
        ) : (
          <span>
            Supabase error — check console:{" "}
            <code className="font-mono text-[var(--color-violet)]">{result.message}</code>
          </span>
        )}
      </div>
    </main>
  );
}
