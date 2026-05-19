"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizard } from "@/lib/wizard/store";
import { useWizardShell } from "@/components/wizard/WizardShell";
import { nextStep } from "@/lib/wizard/steps";
import { createBranchSchema, type CreateBranch } from "@/lib/schemas/branch";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepBranchProps {
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

// Form schema: optional phone fields accept empty string (converted to undefined before saving)
const branchFormSchema = createBranchSchema.extend({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/)
    .optional()
    .or(z.literal("")),
  whatsapp_number: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/)
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
});

type BranchFormValues = z.input<typeof branchFormSchema>;

const COUNTRIES = ["HN", "GT", "SV", "MX", "CO", "AR", "US", "CA"] as const;

const TIMEZONES: Array<{ value: string; labelKey: string }> = [
  { value: "America/Tegucigalpa", labelKey: "tz_tegucigalpa" },
  { value: "America/Guatemala", labelKey: "tz_guatemala" },
  { value: "America/El_Salvador", labelKey: "tz_salvador" },
  { value: "America/Mexico_City", labelKey: "tz_mexico" },
  { value: "America/Bogota", labelKey: "tz_bogota" },
  { value: "America/Argentina/Buenos_Aires", labelKey: "tz_buenosaires" },
  { value: "America/New_York", labelKey: "tz_newyork" },
  { value: "America/Los_Angeles", labelKey: "tz_losangeles" },
  { value: "UTC", labelKey: "tz_utc" },
];

export function StepBranch({ locale }: StepBranchProps) {
  const t = useTranslations("setup.step3");
  const router = useRouter();

  const { branch: savedBranch, setBranch } = useWizard();
  const { setOnContinue, setCanContinue } = useWizardShell();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isValid, errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    mode: "onChange",
    defaultValues: {
      name: savedBranch?.name ?? "",
      slug: savedBranch?.slug ?? "",
      address: savedBranch?.address ?? "",
      city: savedBranch?.city ?? "",
      country: savedBranch?.country ?? "HN",
      phone: savedBranch?.phone ?? "",
      whatsapp_number: savedBranch?.whatsapp_number ?? "",
      timezone: savedBranch?.timezone ?? "America/Tegucigalpa",
    },
  });

  const nameValue = useWatch({ control, name: "name" });

  // Auto-generate slug from name when not manually edited
  const slugManuallyEditedRef = useRef(!!savedBranch?.slug);

  useEffect(() => {
    if (!slugManuallyEditedRef.current && nameValue) {
      const generated = slugify(nameValue);
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  // Sync canContinue with form validity
  useEffect(() => {
    setCanContinue(isValid);
  }, [isValid, setCanContinue]);

  const onSubmit = useCallback(
    (data: BranchFormValues) => {
      // Strip empty optional strings to undefined before saving
      const normalized: CreateBranch = {
        name: data.name,
        slug: data.slug,
        country: data.country ?? "HN",
        timezone: data.timezone ?? "America/Tegucigalpa",
        address: data.address || undefined,
        city: data.city || undefined,
        phone: data.phone || undefined,
        whatsapp_number: data.whatsapp_number || undefined,
      };
      setBranch(normalized);
      const next = nextStep("branch", locale);
      if (next) router.push(next);
    },
    [setBranch, locale, router],
  );

  useEffect(() => {
    const continueHandler = () => {
      handleSubmit(onSubmit)();
    };
    setOnContinue(continueHandler);
    return () => setOnContinue(null);
  }, [handleSubmit, onSubmit, setOnContinue]);

  const { onChange: slugOnChange, ...slugRegister } = register("slug");

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("subtitle")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6"
        noValidate
      >
        {/* Branch name */}
        <div className="space-y-2">
          <Label htmlFor="branch-name" className="text-text-secondary">
            {t("fields.name")}
          </Label>
          <Input
            id="branch-name"
            placeholder={t("fields.namePlaceholder")}
            className="border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-danger">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="branch-slug" className="text-text-secondary">
            {t("fields.slug")}
          </Label>
          <Input
            id="branch-slug"
            className="border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet"
            {...slugRegister}
            onChange={(e) => {
              slugManuallyEditedRef.current = true;
              void slugOnChange(e);
            }}
          />
          <p className="text-xs text-text-muted">{t("fields.slugHint")}</p>
          {errors.slug && (
            <p className="text-xs text-danger">{errors.slug.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="branch-address" className="text-text-secondary">
            {t("fields.address")}
          </Label>
          <Input
            id="branch-address"
            placeholder={t("fields.addressPlaceholder")}
            className="border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet"
            {...register("address")}
          />
          {errors.address && (
            <p className="text-xs text-danger">{errors.address.message}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="branch-city" className="text-text-secondary">
            {t("fields.city")}
          </Label>
          <Input
            id="branch-city"
            placeholder={t("fields.cityPlaceholder")}
            className="border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet"
            {...register("city")}
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label className="text-text-secondary">{t("fields.country")}</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full border-white/10 bg-bg-surface text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {t(`countries.${code}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="branch-phone" className="text-text-secondary">
            {t("fields.phone")}
          </Label>
          <Input
            id="branch-phone"
            placeholder={t("fields.phonePlaceholder")}
            className="border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet"
            {...register("phone")}
          />
          <p className="text-xs text-text-muted">{t("fields.phoneHint")}</p>
          {errors.phone && (
            <p className="text-xs text-danger">{errors.phone.message}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="branch-whatsapp" className="text-text-secondary">
            {t("fields.whatsapp")}
          </Label>
          <Input
            id="branch-whatsapp"
            placeholder={t("fields.whatsappPlaceholder")}
            className="border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet"
            {...register("whatsapp_number")}
          />
          <p className="text-xs text-text-muted">{t("fields.whatsappHint")}</p>
          {errors.whatsapp_number && (
            <p className="text-xs text-danger">{errors.whatsapp_number.message}</p>
          )}
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label className="text-text-secondary">{t("fields.timezone")}</Label>
          <Controller
            control={control}
            name="timezone"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full border-white/10 bg-bg-surface text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(({ value, labelKey }) => (
                    <SelectItem key={value} value={value}>
                      {t(labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </form>
    </div>
  );
}
