"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useWizard } from "@/lib/wizard/store";
import { useWizardShell } from "@/components/wizard/WizardShell";
import { nextStep } from "@/lib/wizard/steps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

interface StepStaffProps {
  locale: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const SLUG_REGEX = /^[a-z0-9-]{3,60}$/;

export function StepStaff({ locale }: StepStaffProps) {
  const t = useTranslations("setup.step5");
  const router = useRouter();

  const { staff, services, setStaff } = useWizard();
  const { setOnContinue, setCanContinue } = useWizardShell();

  // Initialise owner entry on first mount if staff array is empty
  useEffect(() => {
    if (staff.length === 0) {
      setStaff([
        {
          tempId: "owner",
          display_name: "",
          slug: "",
          serviceIndices: services.map((_, i) => i),
          schedule: [],
        },
      ]);
    }
    // Only run once on mount — intentionally not reactive to staff/services changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const owner = useMemo(
    () => staff[0] ?? { tempId: "owner", display_name: "", slug: "", serviceIndices: [], schedule: [] },
    [staff],
  );

  const slugManuallyEditedRef = useRef(!!owner.slug);

  // Derived validation
  const displayNameValid = owner.display_name.trim().length > 0;
  const slugValid = SLUG_REGEX.test(owner.slug);
  const canContinue = displayNameValid && slugValid;

  // Keep WizardShell in sync
  useEffect(() => {
    setCanContinue(canContinue);
  }, [canContinue, setCanContinue]);

  const handleDisplayNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      const updated = { ...owner, display_name: newName };

      // Auto-derive slug unless user has manually edited it
      if (!slugManuallyEditedRef.current) {
        updated.slug = slugify(newName);
      }

      setStaff([updated]);
    },
    [owner, setStaff],
  );

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      slugManuallyEditedRef.current = true;
      setStaff([{ ...owner, slug: e.target.value }]);
    },
    [owner, setStaff],
  );

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    const next = nextStep("staff", locale);
    if (next) router.push(next);
  }, [canContinue, locale, router]);

  useEffect(() => {
    setOnContinue(handleContinue);
    return () => setOnContinue(null);
  }, [handleContinue, setOnContinue]);

  const displayNameError = owner.display_name.length > 0 && !displayNameValid
    ? t("errorDisplayNameRequired")
    : null;
  const slugError = owner.slug.length > 0 && !slugValid
    ? t("errorSlugInvalid")
    : null;

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("subtitle")}</p>

      <div className="mt-8 space-y-6">
        {/* Owner card */}
        <Card className="border-white/10 bg-bg-surface">
          <CardContent className="pt-6 space-y-6">
            <p className="text-sm font-medium text-text-secondary">
              {t("ownerCard")}
            </p>

            {/* Display name */}
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-text-secondary">
                {t("displayNameLabel")}
              </Label>
              <Input
                id="display-name"
                placeholder={t("displayNamePlaceholder")}
                value={owner.display_name}
                onChange={handleDisplayNameChange}
                className="border-white/10 bg-bg-elevated text-text-primary placeholder:text-text-muted focus-visible:border-violet"
                aria-invalid={displayNameError ? true : undefined}
              />
              {displayNameError && (
                <p className="text-xs text-danger">{displayNameError}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="staff-slug" className="text-text-secondary">
                {t("slugLabel")}
              </Label>
              <Input
                id="staff-slug"
                placeholder={t("slugPlaceholder")}
                value={owner.slug}
                onChange={handleSlugChange}
                className="border-white/10 bg-bg-elevated text-text-primary placeholder:text-text-muted focus-visible:border-violet"
                aria-invalid={slugError ? true : undefined}
              />
              {slugError ? (
                <p className="text-xs text-danger">{slugError}</p>
              ) : (
                <p className="text-xs text-text-muted">
                  {t("slugHint", { slug: owner.slug || t("slugPlaceholder") })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* MVP notice */}
        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-bg-surface px-4 py-3">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
          <p className="text-sm text-text-muted">{t("mvpNote")}</p>
        </div>
      </div>
    </div>
  );
}
