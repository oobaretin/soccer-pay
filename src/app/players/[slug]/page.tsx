import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlayerJsonLd } from "@/components/PlayerJsonLd";
import { PlayerPhoto } from "@/components/PlayerPhoto";
import { SourceCitation } from "@/components/SourceCitation";
import { StateMessage } from "@/components/StateMessage";
import {
  ContractExpiredNote,
  ContractTimingBadge,
} from "@/components/ContractTimingBadge";
import { WageStatusBadge } from "@/components/WageStatusBadge";
import { getPlayerBySlug, getPlayerSlugs } from "@/lib/queries/get-player";
import {
  formatDate,
  formatMoney,
  formatPerMetric,
  formatUsdEquivalent,
  remainingContractValueGbp,
} from "@/lib/format";
import { CURRENT_SEASON } from "@/lib/queries/load-roster";
import { pageTitleFull } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getPlayerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPlayerBySlug(slug);
  if (!detail) return { title: "Player not found" };

  const { player, contract, club } = detail;
  const wageCurrency =
    contract?.currency?.toUpperCase() ??
    club?.league?.currency?.toUpperCase() ??
    "GBP";
  const weekly = formatMoney(contract?.weekly_wage_gbp, wageCurrency);
  const annual = formatMoney(contract?.annual_wage_gbp, wageCurrency);
  const title = `${player.name} Salary & Contract`;
  const description = contract
    ? `${player.name} salary: ${weekly} per week (${annual} per year). Contract dates, sources, and ${CURRENT_SEASON} stats on FB Salaries.`
    : `${player.name} wages, contract, and ${CURRENT_SEASON} stats when available on FB Salaries.`;

  const url = `${getSiteUrl()}/players/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title: pageTitleFull(title),
      description,
      url,
      type: "profile",
    },
    twitter: { card: "summary", title: pageTitleFull(title), description },
  };
}

async function PlayerContent({ params }: { params: Params }) {
  const { slug } = await params;
  const detail = await getPlayerBySlug(slug);
  if (!detail) notFound();

  const { player, club, contract, stats, contracts } = detail;
  const wageCurrency =
    contract?.currency?.toUpperCase() ??
    club?.league?.currency?.toUpperCase() ??
    "GBP";
  const fmt = (amount: number | null | undefined) =>
    formatMoney(amount, wageCurrency);
  const remaining = remainingContractValueGbp(
    contract?.weekly_wage_gbp,
    contract?.contract_end,
  );

  return (
    <div className="space-y-8">
      <PlayerJsonLd player={player} contract={contract} />
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">
          {club ? (
            <Link
              href={`/clubs/${club.slug}`}
              className="text-emerald-700 hover:underline dark:text-emerald-400"
            >
              {club.name}
            </Link>
          ) : null}
          {player.position ? ` · ${player.position}` : ""}
          {player.nationality ? ` · ${player.nationality}` : ""}
        </p>
        <div className="flex items-center gap-4">
          <PlayerPhoto
            name={player.name}
            photoUrl={player.photo_url}
            size="lg"
            priority
          />
          <h1 className="text-3xl font-semibold tracking-tight">
            {player.name} salary
          </h1>
        </div>
        {contract ? (
          <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center gap-2">
              <WageStatusBadge status={contract.status} />
              <ContractTimingBadge contractEnd={contract.contract_end} />
              {contract.reviewed_at || contract.last_reviewed ? (
                <span className="text-xs text-zinc-500">
                  Last reviewed:{" "}
                  {formatDate(contract.reviewed_at ?? contract.last_reviewed)}
                </span>
              ) : null}
            </div>
            <ContractExpiredNote contractEnd={contract.contract_end} />
            <p className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
              {fmt(contract.weekly_wage_gbp)}
              <span className="ml-2 text-lg font-medium text-zinc-500">
                per week
              </span>
            </p>
            {formatUsdEquivalent(contract.weekly_wage_gbp, wageCurrency) ? (
              <p className="text-sm tabular-nums text-zinc-500">
                {formatUsdEquivalent(contract.weekly_wage_gbp, wageCurrency)} per
                week
              </p>
            ) : null}
            <p className="text-lg tabular-nums text-zinc-700 dark:text-zinc-300">
              {fmt(contract.annual_wage_gbp)}{" "}
              <span className="text-base font-normal text-zinc-500">per year</span>
            </p>
            {formatUsdEquivalent(contract.annual_wage_gbp, wageCurrency) ? (
              <p className="text-sm tabular-nums text-zinc-500">
                {formatUsdEquivalent(contract.annual_wage_gbp, wageCurrency)} per
                year
              </p>
            ) : null}
            {contract.wage_notes ? (
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {contract.wage_notes}
              </p>
            ) : null}
          </div>
        ) : (
          <StateMessage
            title="No wage on file"
            message="We don’t have a published figure for this player yet. Check back after the next data update."
          />
        )}
        <Link
          href={`/compare?a=${encodeURIComponent(player.slug)}`}
          className="inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Compare with another player →
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Weekly wage" value={fmt(contract?.weekly_wage_gbp)} />
        <StatCard label="Annual wage" value={fmt(contract?.annual_wage_gbp)} />
        <StatCard
          label="Contract ends"
          value={formatDate(contract?.contract_end)}
        />
        <StatCard
          label="Illustrative remaining value"
          value={fmt(remaining)}
          hint="Weeks left × weekly wage — not guaranteed pay"
        />
      </section>

      {contract ? <SourceCitation contract={contract} /> : null}

      {stats ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{stats.season} stats</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniStat label="Apps" value={stats.appearances} />
            <MiniStat label="Goals" value={stats.goals} />
            <MiniStat label="Assists" value={stats.assists} />
            <MiniStat label="Minutes" value={stats.minutes} />
          </dl>
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="font-medium">Wage efficiency ({stats.season})</p>
            <ul className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>
                Wage per goal:{" "}
                {formatPerMetric(
                  contract?.annual_wage_gbp,
                  stats.goals,
                  "goal",
                  wageCurrency,
                )}
              </li>
              <li>
                Wage per assist:{" "}
                {formatPerMetric(
                  contract?.annual_wage_gbp,
                  stats.assists,
                  "assist",
                  wageCurrency,
                )}
              </li>
            </ul>
          </div>
        </section>
      ) : (
        <p className="text-sm text-zinc-500">
          No {CURRENT_SEASON} stats on file yet.
        </p>
      )}

      {contracts.length > 1 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Wage history on file</h2>
          <ul className="divide-y rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {contracts.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium tabular-nums">
                    {formatMoney(
                      c.weekly_wage_gbp,
                      c.currency?.toUpperCase() ?? wageCurrency,
                    )}
                    /wk
                  </span>
                  <span className="mx-2 text-zinc-400">·</span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {formatDate(c.contract_start)} – {formatDate(c.contract_end)}
                  </span>
                </div>
                <WageStatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default function PlayerPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <PlayerContent params={params} />
    </Suspense>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
      {hint ? <p className="mt-1 text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value ?? "—"}</dd>
    </div>
  );
}
