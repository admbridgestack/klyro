import { vi, describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  getOwnerBusinessId,
  AuthError,
  BusinessNotFoundError,
} from "../owner";

type MockOptions = {
  user?: { id: string } | null;
  userError?: Error | null;
  profileRow?: { business_id: string | null } | null;
  profileError?: Error | null;
};

function createMockSupabase({
  user = null,
  userError = null,
  profileRow = null,
  profileError = null,
}: MockOptions) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: userError }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: profileRow, error: profileError }),
    }),
  } as unknown as SupabaseClient<Database>;
}

describe("getOwnerBusinessId", () => {
  it("returns business_id when user has a business", async () => {
    const supabase = createMockSupabase({
      user: { id: "user-abc" },
      profileRow: { business_id: "biz-123" },
    });

    const result = await getOwnerBusinessId(supabase);
    expect(result).toBe("biz-123");
  });

  it("throws AuthError when not authenticated", async () => {
    const supabase = createMockSupabase({
      userError: new Error("not authenticated"),
    });

    await expect(getOwnerBusinessId(supabase)).rejects.toThrow(AuthError);
  });

  it("throws AuthError when user profile not found", async () => {
    const supabase = createMockSupabase({
      user: { id: "user-abc" },
      profileError: new Error("row not found"),
    });

    await expect(getOwnerBusinessId(supabase)).rejects.toThrow(AuthError);
  });

  it("throws BusinessNotFoundError when user has no business", async () => {
    const supabase = createMockSupabase({
      user: { id: "user-abc" },
      profileRow: { business_id: null },
    });

    await expect(getOwnerBusinessId(supabase)).rejects.toThrow(
      BusinessNotFoundError
    );
  });
});
