"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useWizard } from "@/lib/wizard/store";
import { useWizardShell } from "@/components/wizard/WizardShell";
import { nextStep } from "@/lib/wizard/steps";
import { getVerticals, getVerticalDefaults } from "@/lib/api/verticals";
import type { VerticalListItem } from "@/lib/api/verticals";
import type { CreateService } from "@/lib/schemas/service";

interface StepVerticalProps {
  locale: string;
}

export function StepVertical({ locale }: StepVerticalProps) {
  const t = useTranslations("setup.step1");
  const router = useRouter();

  const { vertical: savedVertical, setVertical, setServices } = useWizard();
  const { setOnContinue, setCanContinue, setIsLoading } = useWizardShell();

  const [verticals, setVerticals] = useState<VerticalListItem[]>([]);
  const [selected, setSelected] = useState<string | null>(savedVertical ?? null);
  const [loadingVerticals, setLoadingVerticals] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Fetch the list of verticals on mount
  useEffect(() => {
    let cancelled = false;

    getVerticals()
      .then((data) => {
        if (!cancelled) {
          setVerticals(data);
          setLoadingVerticals(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setLoadingVerticals(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Wire continue handler
  useEffect(() => {
    const continueHandler = () => {
      const next = nextStep("vertical", locale);
      if (next) router.push(next);
    };

    setOnContinue(continueHandler);
    return () => setOnContinue(null);
  }, [locale, router, setOnContinue]);

  // Sync canContinue with selection state
  useEffect(() => {
    setCanContinue(!!selected);
  }, [selected, setCanContinue]);

  const handleSelect = async (key: string) => {
    setSelected(key);
    setIsLoading(true);

    try {
      const defaults = await getVerticalDefaults(key);

      // Map default services to CreateService shape
      const mappedServices: CreateService[] = defaults.defaultServices.map((svc) => ({
        name: svc.name.es,
        duration_minutes: svc.durationMinutes,
        price: Math.round((svc.suggestedPriceRange[0] + svc.suggestedPriceRange[1]) / 2),
        currency: "HNL",
      }));

      setVertical(key as Parameters<typeof setVertical>[0]);
      setServices(mappedServices);
      setCanContinue(true);
    } catch {
      // Keep the card selected; user can still continue — defaults just won't be pre-filled
      setVertical(key as Parameters<typeof setVertical>[0]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingVerticals) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-text-muted">{t("loading")}</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-danger">{t("errorLoading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("subtitle")}</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {verticals.map((v) => {
          const isSelected = selected === v.key;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => handleSelect(v.key)}
              className={[
                "flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-all",
                "hover:border-violet hover:bg-bg-surface",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet",
                isSelected
                  ? "border-violet bg-bg-surface ring-1 ring-violet"
                  : "border-white/10 bg-bg-surface",
              ].join(" ")}
            >
              {v.emoji && (
                <span className="text-3xl leading-none" role="img" aria-hidden="true">
                  {v.emoji}
                </span>
              )}
              <span
                className={[
                  "text-sm font-medium leading-tight",
                  isSelected ? "text-text-primary" : "text-text-secondary",
                ].join(" ")}
              >
                {locale === "en" ? v.displayName.en : v.displayName.es}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
