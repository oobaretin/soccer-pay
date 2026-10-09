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

export async function getLeagueBySlug(slug: string): Promise<League | null> {
  const configError = getSupabaseConfigError();
  if (configError) return null;

  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("leagues")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return (data as League) ?? null;
}

export async function getLeagueSlugs(): Promise<string[]> {
  const leagues = await getLeagues();
  return leagues.map((l) => l.slug);
}
