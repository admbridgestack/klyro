"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWizard } from "@/lib/wizard/store";
import { useWizardShell } from "@/components/wizard/WizardShell";
import { VERTICALS } from "@/lib/verticals/registry";
import type { VerticalKey } from "@/lib/verticals/registry";
import { createBusiness } from "@/lib/api/businesses";
import { updateMyBusiness } from "@/lib/api/businesses";
import { createBranch } from "@/lib/api/branches";
import { bulkCreateServices } from "@/lib/api/services";
import { createStaff, assignBranches, assignServices, setAvailability } from "@/lib/api/staff";
import type { CreateBusiness } from "@/lib/schemas/business";
import type { CreateBranch } from "@/lib/schemas/branch";
import type { CreateService } from "@/lib/schemas/service";

interface ReviewRowProps {
  label: string;
  value?: string | null;
}

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-right text-sm text-white">{value ?? "—"}</span>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  editHref: string;
  editLabel: string;
  children: ReactNode;
}

function SectionCard({ title, editHref, editLabel, children }: SectionCardProps) {
  return (
    <Card className="bg-bg-surface">
      <CardHeader className="border-b border-white/10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{title}</CardTitle>
          <Link
            href={editHref}
            className="flex items-center gap-1 text-xs text-violet-soft hover:text-violet transition-colors"
          >
            <Pencil className="h-3 w-3" />
            {editLabel}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}

export function StepReview({ locale }: { locale: string }) {
  const t = useTranslations("setup.step8");
  const router = useRouter();
  const { vertical, business, branch, services, staff, messaging, commit, updateCommit } = useWizard();
  const { setOnContinue, setCanContinue } = useWizardShell();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Disable the shell footer — the CTA is inside the page
  useEffect(() => {
    setOnContinue(null);
    setCanContinue(false);
  }, [setOnContinue, setCanContinue]);

  const verticalLabel = vertical
    ? VERTICALS[vertical as VerticalKey]?.displayName?.es ?? vertical
    : "—";

  const currency = business?.default_currency ?? "";

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create business (idempotent via commit state)
      let businessId = commit.businessId;
      if (!businessId) {
        const created = await createBusiness(business as CreateBusiness);
        businessId = created.id;
        updateCommit({ businessId, lastSuccessfulStep: 1 });
      }

      // 2. Create branch
      let branchId = commit.branchId;
      if (!branchId) {
        const created = await createBranch(branch as CreateBranch);
        branchId = created.id;
        updateCommit({ branchId, lastSuccessfulStep: 2 });
      }

      // 3. Bulk create services
      let serviceIds = commit.serviceIds;
      if (!serviceIds) {
        const created = await bulkCreateServices(services as CreateService[]);
        serviceIds = created.map((s) => s.id);
        updateCommit({ serviceIds, lastSuccessfulStep: 3 });
      }

      // 4. Create owner staff member + wire up branch, services, schedule
      let staffIds = commit.staffIds ?? {};
      const owner = staff[0];
      if (owner && !staffIds[owner.tempId]) {
        const createdStaff = await createStaff({
          display_name: owner.display_name,
          slug: owner.slug,
        });
        const staffId = createdStaff.id;
        staffIds = { ...staffIds, [owner.tempId]: staffId };
        updateCommit({ staffIds, lastSuccessfulStep: 4 });

        await assignBranches(staffId, [branchId]);
        if (serviceIds.length > 0) {
          await assignServices(staffId, serviceIds);
        }
        if (owner.schedule.length > 0) {
          await setAvailability(staffId, branchId, owner.schedule);
        }
        updateCommit({ lastSuccessfulStep: 5 });
      }

      // 5. Finalize: save messaging prefs and mark onboarding done
      await updateMyBusiness({
        whatsapp_number: messaging?.whatsapp_number ?? null,
        sms_enabled: messaging?.sms_enabled ?? false,
        email_enabled: messaging?.email_enabled ?? true,
        default_cancellation_hours: messaging?.default_cancellation_hours ?? 4,
        onboarding_completed: true,
      });

      router.push(`/${locale}/setup/done`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    business,
    branch,
    services,
    staff,
    messaging,
    commit,
    updateCommit,
    locale,
    router,
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      <p className="mt-2 text-sm text-text-muted">{t("subtitle")}</p>

      <div className="mt-8 space-y-4">
        {/* Business section */}
        <SectionCard
          title={t("sectionBusiness")}
          editHref={`/${locale}/setup/business`}
          editLabel={t("editLink")}
        >
          <ReviewRow label={t("fieldName")} value={business?.name} />
          <ReviewRow label={t("fieldVertical")} value={verticalLabel} />
          <ReviewRow label={t("fieldCountry")} value={business?.country} />
          <ReviewRow label={t("fieldCurrency")} value={currency} />
        </SectionCard>

        {/* Branch section */}
        <SectionCard
          title={t("sectionBranch")}
          editHref={`/${locale}/setup/branch`}
          editLabel={t("editLink")}
        >
          <ReviewRow label={t("fieldName")} value={branch?.name} />
          <ReviewRow label={t("fieldCity")} value={branch?.city} />
          <ReviewRow label={t("fieldTimezone")} value={branch?.timezone} />
        </SectionCard>

        {/* Services section */}
        <SectionCard
          title={`${t("sectionServices")} (${services.length})`}
          editHref={`/${locale}/setup/services`}
          editLabel={t("editLink")}
        >
          {services.length === 0 ? (
            <p className="py-1.5 text-sm text-text-muted">—</p>
          ) : (
            <ul className="space-y-1.5 py-1">
              {services.map((svc, idx) => (
                <li key={idx} className="text-sm text-white">
                  <span className="text-text-muted">•</span>{" "}
                  {svc.name} — {svc.duration_minutes} min
                  {svc.price != null && svc.price > 0
                    ? ` — ${svc.price} ${currency}`
                    : ""}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Team section */}
        <SectionCard
          title={t("sectionTeam")}
          editHref={`/${locale}/setup/staff`}
          editLabel={t("editLink")}
        >
          {staff.length === 0 ? (
            <p className="py-1.5 text-sm text-text-muted">—</p>
          ) : (
            <ul className="space-y-1.5 py-1">
              {staff.map((member, idx) => (
                <li key={member.tempId} className="text-sm text-white">
                  <span className="text-text-muted">•</span>{" "}
                  {member.display_name}
                  {idx === 0 && (
                    <span className="ml-1 text-xs text-text-muted">{t("staffOwner")}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Messaging section */}
        <SectionCard
          title={t("sectionMessaging")}
          editHref={`/${locale}/setup/messaging`}
          editLabel={t("editLink")}
        >
          <ReviewRow
            label={t("fieldWhatsapp")}
            value={messaging?.whatsapp_number}
          />
          <ReviewRow
            label={t("fieldSms")}
            value={messaging?.sms_enabled ? t("statusActive") : t("statusInactive")}
          />
          <ReviewRow
            label={t("fieldEmail")}
            value={messaging?.email_enabled ? t("statusActive") : t("statusInactive")}
          />
          <ReviewRow
            label={t("fieldCancellation")}
            value={
              messaging?.default_cancellation_hours != null
                ? t("cancellationHours", { hours: messaging.default_cancellation_hours })
                : undefined
            }
          />
        </SectionCard>
      </div>

      {/* Confirm CTA */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {submitError && (
          <p className="text-sm text-danger text-center max-w-xs">{submitError}</p>
        )}
        <Button
          onClick={() => void handleConfirm()}
          disabled={isSubmitting}
          className="w-full max-w-xs bg-violet text-white hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("confirmButton")}
            </span>
          ) : (
            t("confirmButton")
          )}
        </Button>
        <p className="text-xs text-text-muted">{t("confirmNote")}</p>
      </div>
    </div>
  );
}
