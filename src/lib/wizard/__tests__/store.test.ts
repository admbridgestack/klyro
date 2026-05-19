import { describe, it, expect, beforeEach } from "vitest";
import { useWizard } from "../store";

beforeEach(() => {
  useWizard.getState().resetWizard();
});

describe("useWizard store", () => {
  it("starts with empty state", () => {
    const s = useWizard.getState();
    expect(s.vertical).toBeUndefined();
    expect(s.services).toEqual([]);
    expect(s.staff).toEqual([]);
    expect(s.commit.lastSuccessfulStep).toBe(0);
  });

  it("setVertical updates vertical", () => {
    useWizard.getState().setVertical("barbershop");
    expect(useWizard.getState().vertical).toBe("barbershop");
  });

  it("setBusiness updates business", () => {
    useWizard.getState().setBusiness({ name: "My Shop", slug: "my-shop", country: "HN" });
    expect(useWizard.getState().business?.name).toBe("My Shop");
  });

  it("setServices replaces the services array", () => {
    useWizard.getState().setServices([
      { name: "Haircut", duration_minutes: 30, price: 150, currency: "HNL" },
    ]);
    expect(useWizard.getState().services).toHaveLength(1);
  });

  it("updateCommit merges into commit state", () => {
    useWizard.getState().updateCommit({ lastSuccessfulStep: 3, businessId: "biz-1" });
    const { commit } = useWizard.getState();
    expect(commit.lastSuccessfulStep).toBe(3);
    expect(commit.businessId).toBe("biz-1");
    expect(commit.errors).toEqual({});
  });

  it("resetWizard clears all state", () => {
    useWizard.getState().setVertical("spa");
    useWizard.getState().setBusiness({ name: "Spa", slug: "spa", country: "HN" });
    useWizard.getState().resetWizard();

    const s = useWizard.getState();
    expect(s.vertical).toBeUndefined();
    expect(s.business).toBeUndefined();
    expect(s.commit.lastSuccessfulStep).toBe(0);
  });
});
