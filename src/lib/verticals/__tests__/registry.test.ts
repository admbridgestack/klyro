import { describe, it, expect } from "vitest";
import {
  VERTICALS,
  getVertical,
  getAllVerticals,
  getActiveVerticals,
  type VerticalKey,
} from "../registry";

const ALL_KEYS: VerticalKey[] = [
  "barbershop",
  "salon",
  "fitness",
  "spa",
  "tattoo",
  "carwash",
  "petgrooming",
  "other",
];

describe("VERTICALS registry", () => {
  it("defines all 8 verticals", () => {
    expect(Object.keys(VERTICALS)).toHaveLength(8);
    ALL_KEYS.forEach((key) => expect(VERTICALS).toHaveProperty(key));
  });

  it("each vertical has both es and en displayName", () => {
    ALL_KEYS.forEach((key) => {
      const v = VERTICALS[key];
      expect(v.displayName.es).toBeTruthy();
      expect(v.displayName.en).toBeTruthy();
    });
  });

  it("each vertical has fully populated bookingPageHints in both locales", () => {
    ALL_KEYS.forEach((key) => {
      const { bookingPageHints } = VERTICALS[key];
      expect(bookingPageHints.serviceNoun.es).toBeTruthy();
      expect(bookingPageHints.serviceNoun.en).toBeTruthy();
      expect(bookingPageHints.appointmentNoun.es).toBeTruthy();
      expect(bookingPageHints.appointmentNoun.en).toBeTruthy();
      expect(bookingPageHints.staffNoun.es).toBeTruthy();
      expect(bookingPageHints.staffNoun.en).toBeTruthy();
    });
  });

  it("key field matches the record key", () => {
    ALL_KEYS.forEach((key) => {
      expect(VERTICALS[key].key).toBe(key);
    });
  });
});

describe("getVertical", () => {
  it("returns the correct profile", () => {
    const v = getVertical("barbershop");
    expect(v.key).toBe("barbershop");
    expect(v.emoji).toBe("💈");
  });
});

describe("getAllVerticals", () => {
  it("returns all 8 profiles", () => {
    expect(getAllVerticals()).toHaveLength(8);
  });
});

describe("getActiveVerticals", () => {
  it("returns only active verticals", () => {
    const active = getActiveVerticals();
    active.forEach((v) => expect(v.status).toBe("active"));
  });

  it("all 8 current verticals are active", () => {
    expect(getActiveVerticals()).toHaveLength(8);
  });
});
