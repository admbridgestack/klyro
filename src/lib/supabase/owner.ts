import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export class AuthError extends Error {
  status = 401;
}

export class BusinessNotFoundError extends Error {
  status = 404;
}

export async function getOwnerBusinessId(
  supabase: SupabaseClient<Database>
): Promise<string> {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new AuthError("Unauthenticated");
  }

  const { data: row, error: profileError } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !row) {
    throw new AuthError("User profile not found");
  }

  if (row.business_id === null) {
    throw new BusinessNotFoundError("No business for this user");
  }

  return row.business_id;
}
