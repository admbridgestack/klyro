import { getTranslations } from "next-intl/server";

export default async function StepServicesPage() {
  const t = await getTranslations("setup.step4");
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        Block D — services table coming soon.
      </p>
    </div>
  );
}
