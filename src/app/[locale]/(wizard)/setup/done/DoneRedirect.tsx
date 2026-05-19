"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useWizard } from "@/lib/wizard/store";

const COUNTDOWN_SECONDS = 4;

export function DoneRedirect({ locale }: { locale: string }) {
  const t = useTranslations("setup.done");
  const router = useRouter();
  const resetWizard = useWizard((s) => s.resetWizard);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    resetWizard();
  }, [resetWizard]);

  useEffect(() => {
    if (seconds <= 0) {
      router.push(`/${locale}/dashboard`);
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, locale, router]);

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <p className="text-sm text-text-muted">{t("redirect", { seconds })}</p>
      <Button
        onClick={() => router.push(`/${locale}/dashboard`)}
        className="bg-violet text-white hover:opacity-90"
      >
        {t("cta")}
      </Button>
    </div>
  );
}
