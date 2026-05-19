"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWizard } from "@/lib/wizard/store";
import { useWizardShell } from "@/components/wizard/WizardShell";
import { nextStep } from "@/lib/wizard/steps";
import { checkSlug } from "@/lib/api/businesses";
import { createBusinessSchema } from "@/lib/schemas/business";

type BusinessFormValues = z.input<typeof createBusinessSchema>;
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepBusinessProps {
  locale: string;
}

type SlugStatus = "idle" | "checking" | "available" | "taken";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const COUNTRIES = [
  { code: "HN", labelKey: "countries.HN" },
  { code: "GT", labelKey: "countries.GT" },
  { code: "SV", labelKey: "countries.SV" },
  { code: "MX", labelKey: "countries.MX" },
  { code: "CO", labelKey: "countries.CO" },
  { code: "AR", labelKey: "countries.AR" },
  { code: "US", labelKey: "countries.US" },
] as const;

const LANGUAGES = [
  { code: "es", labelKey: "languages.es" },
  { code: "en", labelKey: "languages.en" },
] as const;

const CURRENCIES = [
  { code: "HNL", labelKey: "currencies.HNL" },
  { code: "GTQ", labelKey: "currencies.GTQ" },
  { code: "USD", labelKey: "currencies.USD" },
  { code: "MXN", labelKey: "currencies.MXN" },
  { code: "COP", labelKey: "currencies.COP" },
  { code: "ARS", labelKey: "currencies.ARS" },
] as const;

export function StepBusiness({ locale }: StepBusinessProps) {
  const t = useTranslations("setup.step2");
  const router = useRouter();

  const { business: savedBusiness, vertical, setBusiness } = useWizard();
  const { setOnContinue, setCanContinue } = useWizardShell();

  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isValid, errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(createBusinessSchema),
    mode: "onChange",
    defaultValues: {
      name: savedBusiness?.name ?? "",
      slug: savedBusiness?.slug ?? "",
      vertical: savedBusiness?.vertical ?? vertical ?? "",
      country: savedBusiness?.country ?? "HN",
      default_language: savedBusiness?.default_language ?? "es",
      default_currency: savedBusiness?.default_currency ?? "HNL",
    },
  });

  const nameValue = useWatch({ control, name: "name" });
  const slugValue = useWatch({ control, name: "slug" });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!savedBusiness?.slug);

  // Auto-generate slug from name when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      const generated = slugify(nameValue);
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [nameValue, slugManuallyEdited, setValue]);

  // Debounced slug availability check — all setState calls inside async callbacks
  useEffect(() => {
    let cancelled = false;

    if (!slugValue || slugValue.length < 3) {
      const t = setTimeout(() => { if (!cancelled) setSlugStatus("idle"); }, 0);
      return () => { cancelled = true; clearTimeout(t); };
    }

    const timer = setTimeout(async () => {
      if (cancelled) return;
      setSlugStatus("checking");
      try {
        const result = await checkSlug(slugValue);
        if (!cancelled) setSlugStatus(result.available ? "available" : "taken");
      } catch {
        if (!cancelled) setSlugStatus("idle");
      }
    }, 400);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [slugValue]);

  // Sync canContinue: form must be valid and slug not taken/checking
  useEffect(() => {
    setCanContinue(isValid && slugStatus !== "taken" && slugStatus !== "checking");
  }, [isValid, slugStatus, setCanContinue]);

  const handleSlugManualEdit = useCallback(() => {
    setSlugManuallyEdited(true);
  }, []);

  const onSubmit = useCallback(
    (data: BusinessFormValues) => {
      setBusiness(data);
      const next = nextStep("business", locale);
      if (next) router.push(next);
    },
    [setBusiness, locale, router],
  );

  // Register continue handler via WizardShell
  useEffect(() => {
    const continueHandler = () => {
      handleSubmit(onSubmit)();
    };
    setOnContinue(continueHandler);
    return () => setOnContinue(null);
  }, [handleSubmit, onSubmit, setOnContinue]);

  const slugStatusLabel = (): string | null => {
    if (slugStatus === "checking") return t("slugChecking");
    if (slugStatus === "available") return `✓ ${t("slugAvailable")}`;
    if (slugStatus === "taken") return `✗ ${t("slugTaken")}`;
    return null;
  };

  const slugStatusClass = (): string => {
    if (slugStatus === "available") return "text-success";
    if (slugStatus === "taken") return "text-danger";
    return "text-text-muted";
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("subtitle")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6"
        noValidate
      >
        {/* Business name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-text-secondary">
            {t("nameLabel")}
          </Label>
          <Input
            id="name"
            placeholder={t("namePlaceholder")}
            className="border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-danger">{errors.name.message}</p>
          )}
        </div>

        {/* Slug with inline prefix */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-text-secondary">
            {t("slugLabel")}
          </Label>
          <div className="flex items-center">
            <span className="flex h-8 shrink-0 items-center rounded-l-lg border border-r-0 border-white/10 bg-bg-elevated px-2.5 text-sm text-text-muted">
              {t("slugPrefix")}
            </span>
            <Input
              id="slug"
              className="rounded-l-none border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet"
              {...register("slug", { onChange: handleSlugManualEdit })}
            />
          </div>
          {slugStatusLabel() && (
            <p className={`text-xs ${slugStatusClass()}`}>
              {slugStatusLabel()}
            </p>
          )}
          {errors.slug && !slugStatusLabel() && (
            <p className="text-xs text-danger">{errors.slug.message}</p>
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label className="text-text-secondary">{t("countryLabel")}</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full border-white/10 bg-bg-surface text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(({ code, labelKey }) => (
                    <SelectItem key={code} value={code}>
                      {t(labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Default language */}
        <div className="space-y-2">
          <Label className="text-text-secondary">{t("languageLabel")}</Label>
          <Controller
            control={control}
            name="default_language"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full border-white/10 bg-bg-surface text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(({ code, labelKey }) => (
                    <SelectItem key={code} value={code}>
                      {t(labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Default currency */}
        <div className="space-y-2">
          <Label className="text-text-secondary">{t("currencyLabel")}</Label>
          <Controller
            control={control}
            name="default_currency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full border-white/10 bg-bg-surface text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(({ code, labelKey }) => (
                    <SelectItem key={code} value={code}>
                      {t(labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Hidden vertical field — carried forward from step 1 */}
        <input type="hidden" {...register("vertical")} />
      </form>
    </div>
  );
}
