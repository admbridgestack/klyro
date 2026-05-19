"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useWizard } from "@/lib/wizard/store";
import { useWizardShell } from "@/components/wizard/WizardShell";
import { nextStep } from "@/lib/wizard/steps";
import { Input } from "@/components/ui/input";
import type { AvailabilitySlot } from "@/lib/schemas/availability";

interface StepScheduleProps {
  locale: string;
}

// 0 = Sunday, 1 = Monday, ..., 6 = Saturday
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
type DayOfWeek = (typeof ALL_DAYS)[number];

// Mon–Fri active, Sat–Sun inactive
const DEFAULT_ACTIVE_DAYS = new Set<DayOfWeek>([1, 2, 3, 4, 5]);
const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

interface DayRow {
  dayOfWeek: DayOfWeek;
  active: boolean;
  startTime: string;
  endTime: string;
}

function buildDefaultRows(): DayRow[] {
  return ALL_DAYS.map((d) => ({
    dayOfWeek: d,
    active: DEFAULT_ACTIVE_DAYS.has(d),
    startTime: DEFAULT_START,
    endTime: DEFAULT_END,
  }));
}

function rowsToSlots(rows: DayRow[]): AvailabilitySlot[] {
  return rows
    .filter((r) => r.active && isTimeValid(r.startTime) && isTimeValid(r.endTime) && r.startTime < r.endTime)
    .map((r) => ({
      day_of_week: r.dayOfWeek,
      start_time: r.startTime,
      end_time: r.endTime,
    }));
}

function isTimeValid(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

function slotsToRows(slots: AvailabilitySlot[]): DayRow[] {
  const base = buildDefaultRows();
  if (slots.length === 0) return base;

  const slotMap = new Map(slots.map((s) => [s.day_of_week, s]));

  return base.map((row) => {
    const slot = slotMap.get(row.dayOfWeek);
    if (slot) {
      return { ...row, active: true, startTime: slot.start_time, endTime: slot.end_time };
    }
    return { ...row, active: false };
  });
}

export function StepSchedule({ locale }: StepScheduleProps) {
  const t = useTranslations("setup.step6");
  const router = useRouter();

  const { staff, setStaff } = useWizard();
  const { setOnContinue, setCanContinue } = useWizardShell();

  const owner = staff[0];

  // Initialise rows from stored schedule, or build defaults
  const [rows, setRows] = useState<DayRow[]>(() => {
    if (owner && owner.schedule.length > 0) {
      return slotsToRows(owner.schedule);
    }
    return buildDefaultRows();
  });

  // Derived: validity per row
  const rowErrors = rows.map((r): string | null => {
    if (!r.active) return null;
    if (!isTimeValid(r.startTime) || !isTimeValid(r.endTime)) return null;
    if (r.startTime >= r.endTime) return t("errorStartBeforeEnd");
    return null;
  });

  const hasValidSlot = rows.some(
    (r, i) => r.active && (rowErrors[i] ?? null) === null && isTimeValid(r.startTime) && isTimeValid(r.endTime),
  );
  const canContinue = hasValidSlot;

  // Sync canContinue to shell
  useEffect(() => {
    setCanContinue(canContinue);
  }, [canContinue, setCanContinue]);

  // Persist rows to wizard store whenever they change
  useEffect(() => {
    if (!owner) return;
    const slots = rowsToSlots(rows);
    setStaff([{ ...owner, schedule: slots }]);
    // Intentionally only run when rows change — not on owner reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const toggleDay = useCallback((dayOfWeek: DayOfWeek) => {
    setRows((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, active: !r.active } : r)),
    );
  }, []);

  const updateTime = useCallback(
    (dayOfWeek: DayOfWeek, field: "startTime" | "endTime", value: string) => {
      setRows((prev) =>
        prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r)),
      );
    },
    [],
  );

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    const next = nextStep("schedule", locale);
    if (next) router.push(next);
  }, [canContinue, locale, router]);

  useEffect(() => {
    setOnContinue(handleContinue);
    return () => setOnContinue(null);
  }, [handleContinue, setOnContinue]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>
      <p className="mt-2 text-text-muted">{t("subtitle")}</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-bg-surface">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_auto_minmax(90px,1fr)_minmax(90px,1fr)] gap-x-4 border-b border-white/10 px-4 py-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {t("dayHeader")}
          </span>
          <span className="w-10" />
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {t("startLabel")}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {t("endLabel")}
          </span>
        </div>

        {rows.map((row, i) => {
          const error = rowErrors[i] ?? null;
          const dayKey = `day${row.dayOfWeek}` as
            | "day0"
            | "day1"
            | "day2"
            | "day3"
            | "day4"
            | "day5"
            | "day6";

          return (
            <div key={row.dayOfWeek}>
              <div
                className={`grid grid-cols-[1fr_auto_minmax(90px,1fr)_minmax(90px,1fr)] items-center gap-x-4 px-4 py-3 ${
                  i < rows.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                {/* Day name */}
                <span
                  className={`text-sm font-medium ${
                    row.active ? "text-text-primary" : "text-text-muted"
                  }`}
                >
                  {t(dayKey)}
                </span>

                {/* Active toggle — styled checkbox acting as a switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.active}
                  onClick={() => toggleDay(row.dayOfWeek)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet ${
                    row.active ? "bg-violet" : "bg-bg-elevated"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      row.active ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>

                {/* Start time */}
                {row.active ? (
                  <Input
                    type="time"
                    value={row.startTime}
                    onChange={(e) => updateTime(row.dayOfWeek, "startTime", e.target.value)}
                    aria-invalid={error ? true : undefined}
                    className={`border-white/10 bg-bg-elevated text-text-primary focus-visible:border-violet ${
                      error ? "border-danger focus-visible:border-danger" : ""
                    }`}
                  />
                ) : (
                  <span className="text-sm text-text-muted">—</span>
                )}

                {/* End time */}
                {row.active ? (
                  <Input
                    type="time"
                    value={row.endTime}
                    onChange={(e) => updateTime(row.dayOfWeek, "endTime", e.target.value)}
                    aria-invalid={error ? true : undefined}
                    className={`border-white/10 bg-bg-elevated text-text-primary focus-visible:border-violet ${
                      error ? "border-danger focus-visible:border-danger" : ""
                    }`}
                  />
                ) : (
                  <span className="text-sm text-text-muted">—</span>
                )}
              </div>

              {/* Inline validation error */}
              {error && (
                <p className="px-4 pb-2 text-xs text-danger">{error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
