import type { WizardState } from "./store";

export interface WizardStep {
  key: string;
  route: string;
  titleKey: string;
  completionCheck: (state: WizardState) => boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    key: "vertical",
    route: "/setup",
    titleKey: "setup.step1.title",
    completionCheck: (s) => !!s.vertical,
  },
  {
    key: "business",
    route: "/setup/business",
    titleKey: "setup.step2.title",
    completionCheck: (s) => !!s.business?.name && !!s.business?.slug && !!s.business?.country,
  },
  {
    key: "branch",
    route: "/setup/branch",
    titleKey: "setup.step3.title",
    completionCheck: (s) => !!s.branch?.name && !!s.branch?.slug,
  },
  {
    key: "services",
    route: "/setup/services",
    titleKey: "setup.step4.title",
    completionCheck: (s) => s.services.length > 0,
  },
  {
    key: "staff",
    route: "/setup/staff",
    titleKey: "setup.step5.title",
    completionCheck: (s) => s.staff.length > 0,
  },
  {
    key: "schedule",
    route: "/setup/schedule",
    titleKey: "setup.step6.title",
    completionCheck: (s) => s.staff.length > 0 && s.staff.every((m) => m.schedule.length > 0),
  },
  {
    key: "messaging",
    route: "/setup/messaging",
    titleKey: "setup.step7.title",
    completionCheck: (s) => !!s.messaging,
  },
  {
    key: "review",
    route: "/setup/review",
    titleKey: "setup.step8.title",
    completionCheck: () => false,
  },
];

export function getStepIndex(key: string): number {
  return WIZARD_STEPS.findIndex((s) => s.key === key);
}

export function nextStep(key: string, locale: string): string | null {
  const idx = getStepIndex(key);
  if (idx < 0 || idx >= WIZARD_STEPS.length - 1) return null;
  const step = WIZARD_STEPS[idx + 1];
  return step ? `/${locale}${step.route}` : null;
}

export function prevStep(key: string, locale: string): string | null {
  const idx = getStepIndex(key);
  if (idx <= 0) return null;
  const step = WIZARD_STEPS[idx - 1];
  return step ? `/${locale}${step.route}` : null;
}

export function canFinish(state: WizardState): boolean {
  return WIZARD_STEPS.slice(0, -1).every((s) => s.completionCheck(state));
}
