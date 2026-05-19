import { describe, it, expect } from "vitest";
import {
  WIZARD_STEPS,
  getStepIndex,
  nextStep,
  prevStep,
  canFinish,
} from "../steps";
import type { WizardState } from "../store";

const emptyState: WizardState = {
  vertical: undefined,
  business: undefined,
  branch: undefined,
  services: [],
  staff: [],
  messaging: undefined,
  commit: { lastSuccessfulStep: 0, errors: {} },
};

const completeState: WizardState = {
  vertical: "barbershop",
  business: { name: "Test", slug: "test", country: "HN" },
  branch: { name: "Main", slug: "main" },
  services: [{ name: "Haircut", duration_minutes: 30, price: 150, currency: "HNL" }],
  staff: [
    {
      tempId: "t1",
      display_name: "Owner",
      slug: "owner",
      serviceIndices: [0],
      schedule: [{ day_of_week: 1, start_time: "09:00", end_time: "18:00" }],
    },
  ],
  messaging: { sms_enabled: false, email_enabled: true, default_cancellation_hours: 4 },
  commit: { lastSuccessfulStep: 0, errors: {} },
};

describe("WIZARD_STEPS", () => {
  it("has 8 steps in order", () => {
    const keys = WIZARD_STEPS.map((s) => s.key);
    expect(keys).toEqual([
      "vertical", "business", "branch", "services",
      "staff", "schedule", "messaging", "review",
    ]);
  });
});

describe("getStepIndex", () => {
  it("returns correct index for known keys", () => {
    expect(getStepIndex("vertical")).toBe(0);
    expect(getStepIndex("review")).toBe(7);
  });

  it("returns -1 for unknown key", () => {
    expect(getStepIndex("unknown")).toBe(-1);
  });
});

describe("nextStep / prevStep", () => {
  it("returns next route with locale prefix", () => {
    expect(nextStep("vertical", "es")).toBe("/es/setup/business");
    expect(nextStep("business", "en")).toBe("/en/setup/branch");
  });

  it("returns null at the last step", () => {
    expect(nextStep("review", "es")).toBeNull();
  });

  it("returns prev route with locale prefix", () => {
    expect(prevStep("business", "es")).toBe("/es/setup");
    expect(prevStep("review", "en")).toBe("/en/setup/messaging");
  });

  it("returns null at the first step", () => {
    expect(prevStep("vertical", "es")).toBeNull();
  });
});

describe("completionCheck", () => {
  it("step 1 (vertical) passes when vertical is set", () => {
    const s = WIZARD_STEPS[0]!;
    expect(s.completionCheck(emptyState)).toBe(false);
    expect(s.completionCheck({ ...emptyState, vertical: "barbershop" })).toBe(true);
  });

  it("step 2 (business) requires name, slug, and country", () => {
    const s = WIZARD_STEPS[1]!;
    expect(s.completionCheck({ ...emptyState, business: { name: "T", slug: "t" } })).toBe(false);
    expect(s.completionCheck({ ...emptyState, business: { name: "T", slug: "t", country: "HN" } })).toBe(true);
  });

  it("step 8 (review) always returns false — completes via commit", () => {
    const s = WIZARD_STEPS[7]!;
    expect(s.completionCheck(completeState)).toBe(false);
  });
});

describe("canFinish", () => {
  it("returns false when state is empty", () => {
    expect(canFinish(emptyState)).toBe(false);
  });

  it("returns true when all steps 1–7 are complete", () => {
    expect(canFinish(completeState)).toBe(true);
  });

  it("returns false when any required step is incomplete", () => {
    expect(canFinish({ ...completeState, services: [] })).toBe(false);
  });
});
