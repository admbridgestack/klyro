import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/shared/Logo";

export default async function HomePage() {
  const t = await getTranslations("landing");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <Logo variant="lockup" theme="dark" />

      <p className="text-lg text-[var(--color-text-secondary)] tracking-tight">
        {t("tagline")}
      </p>
    </main>
  );
}
