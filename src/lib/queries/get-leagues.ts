import { createSupabaseClient, getSupabaseConfigError } from "@/lib/supabase";
import type { League } from "@/lib/types";

export async function getLeagues(): Promise<League[]> {
  const configError = getSupabaseConfigError();
  if (configError) return [];

  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase.from("leagues").select("*").order("name");
  return (data ?? []) as League[];
}
