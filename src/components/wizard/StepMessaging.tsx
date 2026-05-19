"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { Switch } from "@base-ui/react/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizard } from "@/lib/wizard/store";
import { useWizardShell } from "@/components/wizard/WizardShell";
import { nextStep } from "@/lib/wizard/steps";
import { VERTICALS } from "@/lib/verticals/registry";
import type { VerticalKey } from "@/lib/verticals/registry";

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

function getDefaultCancellationHours(vertical?: VerticalKey): number {
  if (!vertical) return 4;
  return VERTICALS[vertical]?.defaultCancellationHours ?? 4;
}

function buildSchema(msgs: {
  whatsappRequired: string;
  whatsappFormat: string;
  cancellationMin: string;
  cancellationMax: string;
}) {
  return z.object({
    whatsapp_number: z
      .string()
      .min(1, msgs.whatsappRequired)
      .regex(E164_REGEX, msgs.whatsappFormat),
    sms_enabled: z.boolean(),
    email_enabled: z.boolean(),
    default_cancellation_hours: z
      .number()
      .min(1, msgs.cancellationMin)
      .max(168, msgs.cancellationMax),
  });
}

type FormValues = {
  whatsapp_number: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  default_cancellation_hours: number;
};

export function StepMessaging({ locale }: { locale: string }) {
  const t = useTranslations("setup.step7");
  const router = useRouter();
  const { vertical, messaging, setMessaging } = useWizard();
  const { setOnContinue, setCanContinue } = useWizardShell();

  const schema = buildSchema({
    whatsappRequired: t("errors.whatsappRequired"),
    whatsappFormat: t("errors.whatsappFormat"),
    cancellationMin: t("errors.cancellationMin"),
    cancellationMax: t("errors.cancellationMax"),
  });

  const defaultCancellationHours = getDefaultCancellationHours(vertical);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      whatsapp_number: messaging?.whatsapp_number ?? "",
      sms_enabled: messaging?.sms_enabled ?? false,
      email_enabled: messaging?.email_enabled ?? true,
      default_cancellation_hours:
        messaging?.default_cancellation_hours ?? defaultCancellationHours,
    },
  });

  const watchedWhatsapp = useWatch({ control, name: "whatsapp_number" });
  const watchedSms = useWatch({ control, name: "sms_enabled" });
  const watchedEmail = useWatch({ control, name: "email_enabled" });
  const watchedCancellation = useWatch({ control, name: "default_cancellation_hours" });

  // Sync changes to wizard store on every value change
  useEffect(() => {
    setMessaging({
      whatsapp_number: watchedWhatsapp,
      sms_enabled: watchedSms,
      email_enabled: watchedEmail,
      default_cancellation_hours: watchedCancellation,
    });
  }, [watchedWhatsapp, watchedSms, watchedEmail, watchedCancellation, setMessaging]);

  // Update canContinue based on E.164 validity
  useEffect(() => {
    const valid = E164_REGEX.test(watchedWhatsapp ?? "");
    setCanContinue(valid);
  }, [watchedWhatsapp, setCanContinue]);

  // Wire onContinue
  useEffect(() => {
    setOnContinue(
      handleSubmit((values) => {
        setMessaging(values);
        const next = nextStep("messaging", locale);
        if (next) router.push(next);
      })
    );
    return () => setOnContinue(null);
  }, [handleSubmit, locale, router, setMessaging, setOnContinue]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      <p className="mt-2 text-sm text-text-muted">{t("subtitle")}</p>

      <form className="mt-8 space-y-6" noValidate>
        {/* WhatsApp number */}
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp_number">{t("whatsappLabel")}</Label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3 flex items-center text-text-muted">
              <Phone className="h-4 w-4" />
            </span>
            <Input
              id="whatsapp_number"
              type="tel"
              placeholder={t("whatsappPlaceholder")}
              className="pl-9"
              aria-invalid={!!errors.whatsapp_number}
              {...register("whatsapp_number")}
            />
          </div>
          {errors.whatsapp_number ? (
            <p className="text-xs text-danger">{errors.whatsapp_number.message}</p>
          ) : (
            <p className="text-xs text-text-muted">{t("whatsappHelper")}</p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* SMS opt-in */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="sms_enabled" className="cursor-pointer text-white">
              {t("smsLabel")}
            </Label>
          </div>
          <Switch.Root
            id="sms_enabled"
            checked={watchedSms}
            onCheckedChange={(checked: boolean) => setValue("sms_enabled", checked, { shouldDirty: true })}
            className="group relative flex h-6 w-10 cursor-pointer items-center rounded-full border-2 border-transparent bg-white/20 transition-colors data-[checked]:bg-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
          >
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-100 group-data-[checked]:translate-x-4.5" />
          </Switch.Root>
        </div>

        {/* Email opt-in */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="email_enabled" className="cursor-pointer text-white">
              {t("emailLabel")}
            </Label>
          </div>
          <Switch.Root
            id="email_enabled"
            checked={watchedEmail}
            onCheckedChange={(checked: boolean) => setValue("email_enabled", checked, { shouldDirty: true })}
            className="group relative flex h-6 w-10 cursor-pointer items-center rounded-full border-2 border-transparent bg-white/20 transition-colors data-[checked]:bg-violet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
          >
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-100 group-data-[checked]:translate-x-4.5" />
          </Switch.Root>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Cancellation policy */}
        <div className="space-y-1.5">
          <Label htmlFor="default_cancellation_hours">{t("cancellationLabel")}</Label>
          <div className="flex items-center gap-3">
            <Input
              id="default_cancellation_hours"
              type="number"
              min={1}
              max={168}
              className="w-24"
              aria-invalid={!!errors.default_cancellation_hours}
              {...register("default_cancellation_hours", { valueAsNumber: true })}
            />
            <span className="text-sm text-text-muted">{t("cancellationUnit")}</span>
          </div>
          {errors.default_cancellation_hours ? (
            <p className="text-xs text-danger">{errors.default_cancellation_hours.message}</p>
          ) : (
            <p className="text-xs text-text-muted">{t("cancellationHelper")}</p>
          )}
        </div>
      </form>
    </div>
  );
}
