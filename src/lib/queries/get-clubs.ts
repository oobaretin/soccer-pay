import { createSupabaseClient, getSupabaseConfigError } from "@/lib/supabase";
import { loadRoster } from "@/lib/queries/load-roster";
import type { Club, ClubDetail } from "@/lib/types";

export async function getClubSlugs(): Promise<string[]> {
  const configError = getSupabaseConfigError();
  if (configError) return [];

  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase.from("clubs").select("slug").order("name");
  return (data ?? []).map((r) => r.slug as string);
}

export async function getAllClubs(): Promise<Club[]> {
  const configError = getSupabaseConfigError();
  if (configError) return [];

  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase.from("clubs").select("*").order("name");
  return (data ?? []) as Club[];
}

export async function getClubBySlug(slug: string): Promise<ClubDetail | null> {
  const configError = getSupabaseConfigError();
  if (configError) return null;

  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!club) return null;

  const roster = await loadRoster();
  if (!roster.ok) return null;

  const squad = roster.rows
    .filter((r) => r.club?.slug === slug)
    .sort(
      (a, b) =>
        (b.contract?.weekly_wage_gbp ?? 0) - (a.contract?.weekly_wage_gbp ?? 0),
    );

  const weeklyWageBill = squad.reduce(
    (sum, r) => sum + (r.contract?.weekly_wage_gbp ?? 0),
    0,
  );
  const annualWageBill = squad.reduce(
    (sum, r) => sum + (r.contract?.annual_wage_gbp ?? 0),
    0,
  );

  return {
    club: club as Club,
    squad,
    weeklyWageBill,
    annualWageBill,
  };
}
