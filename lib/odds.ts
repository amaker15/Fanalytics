/*
 * Fanalytics - Betting Odds Integration Library
 *
 * This library provides functions to fetch betting odds from The Odds API,
 * supporting multiple sports including NBA, NFL, MLB, and NCAA Basketball.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import fetch from "node-fetch";

const ODDS_URL = "https://api.the-odds-api.com/v4";

const ODDS_SPORT_MAP: Record<string, string> = {
basketball_nba: "basketball_nba",
basketball_ncaab: "basketball_ncaab",
football_nfl: "americanfootball_nfl",
baseball_mlb: "baseball_mlb",
};

export async function getOdds(sport: string): Promise<OddsGame[]> {
const apiSport = ODDS_SPORT_MAP[sport] || sport;
const params = new URLSearchParams({
apiKey: process.env.ODDS_API_KEY!,
regions: "us",
markets: "h2h,spreads,totals",
oddsFormat: 'american'
});
const url = `${ODDS_URL}/sports/${apiSport}/odds?${params.toString()}`;
const res = await fetch(url);
if (!res.ok) throw new Error(`${res.statusText}`);
const json = await res.json();
return json as OddsGame[];
}

interface OddsOutcome {
  name: string;
  point?: number;
  price: string;
}

interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}

interface OddsBookmaker {
  markets: OddsMarket[];
}

interface OddsGame {
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

export function formatOdds(data: OddsGame[]) {
const lines: string[] = [];
if (!Array.isArray(data) || data.length === 0) {
return "No odds available right now.";
}

for (const g of data.slice(0, 5)) {
const home = g.home_team;
const away = g.away_team;
const book = g.bookmakers?.[0];
const h2h = book?.markets?.find((m: OddsMarket) => m.key === "h2h");
const totals = book?.markets?.find((m: OddsMarket) => m.key === "totals");
const spreads = book?.markets?.find((m: OddsMarket) => m.key === "spreads");
const homeML = h2h?.outcomes?.find((o: OddsOutcome) => o.name === home)?.price ?? "";
const awayML = h2h?.outcomes?.find((o: any) => o.name === away)?.price ?? "";
const totalLine = totals?.outcomes
?.map((o: any) => `${o.name} ${o.point ?? ""} (${o.price})`)
.join(" / ");
const spreadLine = spreads?.outcomes
?.map((o: any) => `${o.name} ${o.point ?? ""} (${o.price})`)
.join(" / ");
lines.push(
`${away} @ ${home} | ML ${awayML}/${homeML}${
spreadLine ? ` | Spread ${spreadLine}` : ""
}${totalLine ? ` | Total ${totalLine}` : ""}`
);
}
return lines.join("\n");
}
