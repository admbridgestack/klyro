import { getTranslations } from "next-intl/server";

export default async function StepVerticalPage() {
  const t = await getTranslations("setup.step1");
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        Block D — vertical picker coming soon.
      </p>
    </div>
  );
}
