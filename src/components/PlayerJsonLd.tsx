import { formatGbp } from "@/lib/format";
import { getSiteUrl } from "@/lib/site-url";
import type { Contract, Player } from "@/lib/types";

type Props = {
  player: Player;
  contract: Contract | null;
};

export function PlayerJsonLd({ player, contract }: Props) {
  const url = `${getSiteUrl()}/players/${player.slug}`;
  const description = contract
    ? `${player.name} salary: ${formatGbp(contract.weekly_wage_gbp)} per week (${formatGbp(contract.annual_wage_gbp)} per year).`
    : `${player.name} salary and contract information.`;

  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${player.name} salary`,
    description,
    url,
    mainEntity: {
      "@type": "Person",
      name: player.name,
      url,
      image: player.photo_url ?? undefined,
      jobTitle: player.position ?? "Football player",
      nationality: player.nationality ?? undefined,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
