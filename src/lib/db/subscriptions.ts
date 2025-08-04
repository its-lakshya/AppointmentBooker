import { createSupabaseAdminClient } from "../supabase/supabase";

export async function getSubscriptionByUserId(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single(); // Returns only one user

  if (error || !data) {
    console.error("Error fetching user by User ID:", error);
    return;
  }

  return data;
}
