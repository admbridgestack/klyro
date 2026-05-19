"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { WIZARD_STEPS, getStepIndex, nextStep, prevStep } from "@/lib/wizard/steps";

interface WizardShellContextValue {
  setOnContinue: (fn: (() => Promise<void> | void) | null) => void;
  setCanContinue: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
}

const WizardShellContext = createContext<WizardShellContextValue | null>(null);

export function useWizardShell(): WizardShellContextValue {
  const ctx = useContext(WizardShellContext);
  if (!ctx) throw new Error("useWizardShell must be inside WizardShell");
  return ctx;
}

export function WizardShell({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const [onContinue, setOnContinueState] = useState<
    (() => Promise<void> | void) | null
  >(null);
  const [canContinue, setCanContinue] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const setOnContinue = useCallback(
    (fn: (() => Promise<void> | void) | null) => {
      setOnContinueState(() => fn);
    },
    []
  );

  const stepKey = (() => {
    const parts = pathname.split("/");
    const setupIdx = parts.findIndex((p) => p === "setup");
    if (setupIdx < 0) return "vertical";
    return parts[setupIdx + 1] ?? "vertical";
  })();

  const stepIdx = Math.max(getStepIndex(stepKey), 0);
  const totalSteps = WIZARD_STEPS.length;
  const progress = ((stepIdx + 1) / totalSteps) * 100;
  const isFirstStep = stepIdx === 0;

  const handleBack = () => {
    const prev = prevStep(stepKey, locale);
    if (prev) router.push(prev);
  };

  const handleContinue = async () => {
    if (isLoading) return;
    if (onContinue) {
      setIsLoading(true);
      try {
        await onContinue();
      } finally {
        setIsLoading(false);
      }
    } else {
      const next = nextStep(stepKey, locale);
      if (next) router.push(next);
    }
  };

  return (
    <WizardShellContext.Provider value={{ setOnContinue, setCanContinue, setIsLoading }}>
      <div className="flex min-h-screen flex-col bg-[var(--color-bg-base)]">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[var(--color-bg-base)] px-6 py-4">
          <Logo variant="lockup" theme="dark" className="h-8" />
          <span className="text-sm text-[var(--color-text-muted)]">
            {t("setup.stepOf", { current: stepIdx + 1, total: totalSteps })}
          </span>
        </header>

        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-[var(--color-violet)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Sticky footer */}
        <footer className="sticky bottom-0 z-20 flex items-center justify-between border-t border-white/10 bg-[var(--color-bg-base)] px-6 py-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isFirstStep || isLoading}
            className="text-[var(--color-text-muted)]"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t("common.back")}
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!canContinue || isLoading}
            className="bg-[var(--color-violet)] text-white hover:opacity-90"
          >
            {isLoading ? t("common.loading") : t("common.continue")}
          </Button>
        </footer>
      </div>
    </WizardShellContext.Provider>
  );
}
