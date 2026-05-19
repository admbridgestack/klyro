"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X, Plus } from "lucide-react";
import { useWizard } from "@/lib/wizard/store";
import { useWizardShell } from "@/components/wizard/WizardShell";
import { nextStep } from "@/lib/wizard/steps";
import type { CreateService } from "@/lib/schemas/service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StepServicesProps {
  locale: string;
}

interface ServiceRow extends CreateService {
  _id: string;
}

const CURRENCIES = ["HNL", "GTQ", "USD", "MXN", "COP", "ARS"] as const;

function newRow(): ServiceRow {
  return {
    _id: crypto.randomUUID(),
    name: "",
    duration_minutes: 30,
    price: 0,
    currency: "HNL",
  };
}

function isRowValid(row: ServiceRow): boolean {
  return (
    row.name.trim().length > 0 &&
    Number.isInteger(row.duration_minutes) &&
    row.duration_minutes >= 5 &&
    row.price >= 0
  );
}

export function StepServices({ locale }: StepServicesProps) {
  const t = useTranslations("setup.step4");
  const router = useRouter();

  const { services: savedServices, setServices } = useWizard();
  const { setOnContinue, setCanContinue } = useWizardShell();

  const [rows, setRows] = useState<ServiceRow[]>(() => {
    if (savedServices.length > 0) {
      return savedServices.map((s) => ({ ...s, _id: crypto.randomUUID() }));
    }
    return [newRow()];
  });

  // Sync canContinue whenever rows change
  useEffect(() => {
    const allValid = rows.length >= 1 && rows.every(isRowValid);
    setCanContinue(allValid);
    // Keep wizard store in sync
    if (allValid) {
      setServices(rows.map(({ _id: _discarded, ...s }) => s));
    }
  }, [rows, setCanContinue, setServices]);

  const updateRow = useCallback(
    (id: string, patch: Partial<ServiceRow>) => {
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...patch } : r)),
      );
    },
    [],
  );

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, newRow()]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r._id !== id);
    });
  }, []);

  const handleContinue = useCallback(() => {
    // Persist valid rows to store before navigation
    const validRows = rows.filter(isRowValid);
    setServices(validRows.map(({ _id: _discarded, ...s }) => s));
    const next = nextStep("services", locale);
    if (next) router.push(next);
  }, [rows, setServices, locale, router]);

  useEffect(() => {
    setOnContinue(handleContinue);
    return () => setOnContinue(null);
  }, [handleContinue, setOnContinue]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("subtitle")}</p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-bg-surface">
              <th className="px-3 py-3 text-left font-medium text-text-secondary">
                {t("columns.name")}
              </th>
              <th className="w-32 px-3 py-3 text-left font-medium text-text-secondary">
                {t("columns.duration")}
              </th>
              <th className="w-28 px-3 py-3 text-left font-medium text-text-secondary">
                {t("columns.price")}
              </th>
              <th className="w-28 px-3 py-3 text-left font-medium text-text-secondary">
                {t("columns.currency")}
              </th>
              <th className="w-12 px-3 py-3" aria-label={t("columns.remove")} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const nameError = row.name.trim().length === 0 && idx > 0;
              const durationError =
                !Number.isInteger(row.duration_minutes) ||
                row.duration_minutes < 5;
              const priceError = row.price < 0;

              return (
                <tr
                  key={row._id}
                  className="border-b border-white/10 last:border-0"
                >
                  {/* Name */}
                  <td className="px-3 py-2">
                    <Input
                      value={row.name}
                      placeholder={t("namePlaceholder")}
                      onChange={(e) =>
                        updateRow(row._id, { name: e.target.value })
                      }
                      className={`border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet ${
                        nameError ? "border-danger" : ""
                      }`}
                      aria-label={t("columns.name")}
                    />
                    {nameError && (
                      <p className="mt-1 text-xs text-danger">
                        {t("validation.nameRequired")}
                      </p>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={5}
                      step={5}
                      value={row.duration_minutes}
                      placeholder={t("durationPlaceholder")}
                      onChange={(e) =>
                        updateRow(row._id, {
                          duration_minutes: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className={`border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet ${
                        durationError ? "border-danger" : ""
                      }`}
                      aria-label={t("columns.duration")}
                    />
                    {durationError && (
                      <p className="mt-1 text-xs text-danger">
                        {t("validation.durationMin")}
                      </p>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={row.price}
                      placeholder={t("pricePlaceholder")}
                      onChange={(e) =>
                        updateRow(row._id, {
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`border-white/10 bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:border-violet ${
                        priceError ? "border-danger" : ""
                      }`}
                      aria-label={t("columns.price")}
                    />
                    {priceError && (
                      <p className="mt-1 text-xs text-danger">
                        {t("validation.priceMin")}
                      </p>
                    )}
                  </td>

                  {/* Currency */}
                  <td className="px-3 py-2">
                    <select
                      value={row.currency}
                      onChange={(e) =>
                        updateRow(row._id, { currency: e.target.value })
                      }
                      className="h-9 w-full rounded-md border border-white/10 bg-bg-surface px-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-violet"
                      aria-label={t("columns.currency")}
                    >
                      {CURRENCIES.map((cur) => (
                        <option key={cur} value={cur}>
                          {cur}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Remove */}
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row._id)}
                      disabled={rows.length <= 1}
                      className="rounded p-1 text-text-muted transition-colors hover:text-danger disabled:pointer-events-none disabled:opacity-30"
                      aria-label={t("columns.remove")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={addRow}
          className="gap-2 text-violet hover:bg-violet/10"
        >
          <Plus className="h-4 w-4" />
          {t("addRow")}
        </Button>
        {rows.length === 1 && rows[0] !== undefined && !isRowValid(rows[0]) && (
          <p className="text-xs text-text-muted">{t("minServicesHint")}</p>
        )}
      </div>
    </div>
  );
}
