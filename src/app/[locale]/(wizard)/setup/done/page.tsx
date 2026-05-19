import { getTranslations } from "next-intl/server";
import { DoneRedirect } from "./DoneRedirect";

export default async function SetupDonePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("setup.done");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg-base)] px-6 text-center">
      {/* Cat mark */}
      <div className="mb-6">
        <svg
          width="64"
          height="64"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="grad-done" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6D64FB" />
              <stop offset="100%" stopColor="#14143A" />
            </linearGradient>
          </defs>
          <rect x="2" y="6" width="36" height="32" rx="10" fill="url(#grad-done)" />
          <polygon points="8,6 4,0 12,0" fill="#6D64FB" />
          <polygon points="32,6 28,0 36,0" fill="#6D64FB" />
          <ellipse cx="14" cy="17" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.9" />
          <ellipse cx="26" cy="17" rx="2.5" ry="1.5" fill="#FFFFFF" opacity="0.9" />
          <path d="M18.5 22 L20 23.5 L21.5 22 L20 21 Z" fill="#6D64FB" />
          <rect x="6" y="29" width="28" height="3.5" rx="1.75" fill="#6D64FB" />
          <path
            d="M14 21.5 L18 25.5 L26 17.5"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-extrabold text-white">{t("title")}</h1>
      <p className="mt-3 max-w-sm text-[var(--color-text-muted)]">{t("subtitle")}</p>

      <DoneRedirect locale={locale} ctaLabel={t("cta")} redirectTemplate={t("redirect")} />
    </div>
  );
}
