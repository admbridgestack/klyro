import { getTranslations } from "next-intl/server";

export default async function StepStaffPage() {
  const t = await getTranslations("setup.step5");
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        Block D — staff form coming soon.
      </p>
    </div>
  );
}
