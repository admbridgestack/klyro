import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { POST as postBusiness } from "../businesses/route";
import { GET as getBranches } from "../branches/route";
import { PUT as putAvailability } from "../staff/[id]/availability/route";

const mockedCreateClient = vi.mocked(createClient);

function makeRequest(
  url: string,
  options: { method?: string; body?: unknown } = {},
) {
  const { method = "GET", body } = options;
  return new NextRequest(new URL(url, "http://localhost"), {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
  });
}

function makeSupabaseMock(overrides: Record<string, unknown> = {}) {
  const defaultOps = {
    data: null,
    error: null,
  };

  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(defaultOps),
    maybeSingle: vi.fn().mockResolvedValue(defaultOps),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    ...overrides,
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn().mockReturnValue(builder),
    _builder: builder,
  };
}

describe("POST /api/v1/businesses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a business and returns 201 for a new user", async () => {
    const mockBusiness = {
      id: "biz-123",
      name: "My Shop",
      slug: "my-shop",
      vertical: "barbershop",
      country: "HN",
      default_language: "es",
      default_currency: "HNL",
      onboarding_completed: false,
    };

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
        .mockResolvedValueOnce({ data: { business_id: null }, error: null })
        .mockResolvedValueOnce({ data: mockBusiness, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    };

    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-abc" } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(builder),
    } as never);

    const req = makeRequest("http://localhost/api/v1/businesses", {
      method: "POST",
      body: {
        name: "My Shop",
        slug: "my-shop",
        vertical: "barbershop",
        country: "HN",
      },
    });

    const res = await postBusiness(req);
    expect(res.status).toBe(201);
    expect(res.headers.get("Location")).toBe("/api/v1/businesses/me");

    const json = await res.json();
    expect(json.data.id).toBe("biz-123");
  });

  it("returns 409 when the user already has a business", async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { business_id: "existing-biz" },
        error: null,
      }),
    };

    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-abc" } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(builder),
    } as never);

    const req = makeRequest("http://localhost/api/v1/businesses", {
      method: "POST",
      body: {
        name: "My Shop",
        slug: "my-shop",
        vertical: "barbershop",
        country: "HN",
      },
    });

    const res = await postBusiness(req);
    expect(res.status).toBe(409);

    const json = await res.json();
    expect(json.error.code).toBe("BOOKING_CONFLICT");
  });

  it("returns 401 when user is not authenticated", async () => {
    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Not authenticated" },
        }),
      },
      from: vi.fn(),
    } as never);

    const req = makeRequest("http://localhost/api/v1/businesses", {
      method: "POST",
      body: {
        name: "My Shop",
        slug: "my-shop",
        vertical: "barbershop",
        country: "HN",
      },
    });

    const res = await postBusiness(req);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/branches — RLS tenant isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only the authenticated user's branches (RLS-delegated)", async () => {
    const userABranches = [
      { id: "branch-a1", name: "User A Branch", business_id: "biz-a", is_active: true },
    ];

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { business_id: "biz-a" },
        error: null,
      }),
    };

    const branchesBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: userABranches, error: null }),
    };

    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-a" } },
          error: null,
        }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "users") return builder;
        if (table === "branches") return branchesBuilder;
        return builder;
      }),
    } as never);

    const req = makeRequest("http://localhost/api/v1/branches");
    const res = await getBranches(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.data[0].id).toBe("branch-a1");
    expect(json.meta.total).toBe(1);
  });

  it("returns 401 when unauthenticated — no cross-tenant leakage possible", async () => {
    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Not authenticated" },
        }),
      },
      from: vi.fn(),
    } as never);

    const req = makeRequest("http://localhost/api/v1/branches");
    const res = await getBranches(req);
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/v1/staff/[id]/availability — atomic replace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes old slots then inserts new ones (replace semantics)", async () => {
    const deleteEq = vi.fn().mockReturnThis();
    const deleteFn = vi.fn().mockReturnThis();
    const deleteBuilder = {
      delete: deleteFn,
      eq: deleteEq.mockResolvedValue({ error: null }),
    };

    const insertFn = vi.fn().mockResolvedValue({ error: null });
    const insertBuilder = { insert: insertFn };

    const staffBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "staff-1" }, error: null }),
    };

    const usersBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { business_id: "biz-1" }, error: null }),
    };

    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "users") return usersBuilder;
        if (table === "staff") return staffBuilder;
        if (table === "staff_availability") {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
            insert: insertFn,
          };
        }
        return usersBuilder;
      }),
    } as never);

    const newSlots = [
      { day_of_week: 1, start_time: "09:00", end_time: "17:00" },
      { day_of_week: 2, start_time: "09:00", end_time: "17:00" },
    ];

    const BRANCH_ID = "550e8400-e29b-41d4-a716-446655440001";

    const req = makeRequest("http://localhost/api/v1/staff/staff-1/availability", {
      method: "PUT",
      body: { branch_id: BRANCH_ID, slots: newSlots },
    });

    const res = await putAvailability(req, { params: Promise.resolve({ id: "staff-1" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.staff_id).toBe("staff-1");
    expect(json.data.branch_id).toBe(BRANCH_ID);
    expect(json.data.slots).toHaveLength(2);

    expect(insertFn).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ day_of_week: 1, staff_id: "staff-1", branch_id: BRANCH_ID }),
        expect.objectContaining({ day_of_week: 2, staff_id: "staff-1", branch_id: BRANCH_ID }),
      ]),
    );
  });

  it("clears all slots when called with empty slots array", async () => {
    const deleteEqFn = vi.fn().mockResolvedValue({ error: null });
    const usersBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { business_id: "biz-1" }, error: null }),
    };
    const staffBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "staff-1" }, error: null }),
    };
    const insertFn = vi.fn();

    mockedCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "users") return usersBuilder;
        if (table === "staff") return staffBuilder;
        if (table === "staff_availability") {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({ eq: deleteEqFn }),
            }),
            insert: insertFn,
          };
        }
        return usersBuilder;
      }),
    } as never);

    const BRANCH_ID = "550e8400-e29b-41d4-a716-446655440001";

    const req = makeRequest("http://localhost/api/v1/staff/staff-1/availability", {
      method: "PUT",
      body: { branch_id: BRANCH_ID, slots: [] },
    });

    const res = await putAvailability(req, { params: Promise.resolve({ id: "staff-1" }) });
    expect(res.status).toBe(200);

    expect(deleteEqFn).toHaveBeenCalled();
    expect(insertFn).not.toHaveBeenCalled();
  });
});
