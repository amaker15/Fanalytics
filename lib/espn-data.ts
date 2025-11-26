/*
 * Fanalytics - ESPN Data Integration Library
 *
 * This library provides functions to fetch live sports data from ESPN APIs,
 * including scores, player stats, team information, and box scores.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import fetch from "node-fetch";

/* ============================================================
CORE TYPES & ENDPOINTS
============================================================ */

export type SportKey = "nba" | "nfl" | "mcb" | "mlb" | "nhl";

const SPORT_PATH: Record<SportKey, string> = {
    nba: "basketball/nba",
    nfl: "football/nfl",
    mcb: "basketball/mens-college-basketball",
    mlb: "baseball/mlb",
    nhl: "hockey/nhl",
};

const ENDPOINTS: Record<SportKey, { scoreboard: string; summary: string }> = {
    nba: {
        scoreboard: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.nba}/scoreboard`,
        summary: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.nba}/summary?event=`,
    },
    nfl: {
        scoreboard: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.nfl}/scoreboard`,
        summary: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.nfl}/summary?event=`,
    },
    mcb: {
        scoreboard: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.mcb}/scoreboard`,
        summary: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.mcb}/summary?event=`,
    },
    mlb: {
        scoreboard: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.mlb}/scoreboard`,
        summary: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.mlb}/summary?event=`,
    },
    nhl: {
        scoreboard: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.nhl}/scoreboard`,
        summary: `https://site.api.espn.com/apis/site/v2/sports/${SPORT_PATH.nhl}/summary?event=`,
    },
};

async function getJSON(url: string): Promise<any> {
    const res = await fetch(url, {
        headers: { "User-Agent": "sportsbot/1.0 (educational)" } as any,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return res.json();
}

/* ============================================================
SCOREBOARD & SUMMARY HELPERS
============================================================ */

export async function getScoreboard(sport: SportKey, date?: string): Promise<{ url: string; data: any }> {
    const base = ENDPOINTS[sport].scoreboard;
    const url = date ? `${base}?dates=${encodeURIComponent(date)}` : base;
    const data = await getJSON(url);
    return { url, data };
}

export async function getSummary(sport: SportKey, eventId: string): Promise<{ url: string; data: any }> {
    const url = ENDPOINTS[sport].summary + eventId;
    const data = await getJSON(url);
    return { url, data };
}

export function formatBoard(board: any, max = 6): string[] {
    const lines: string[] = [];
    const events = board?.events ?? [];

    for (const ev of events.slice(0, max)) {
        const comp = ev?.competitions?.[0];
        const comps = comp?.competitors || [];
        const status =
            comp?.status?.type?.shortDetail ||
            comp?.status?.type?.description ||
            "Scheduled";

        const home = comps.find((c: any) => c?.homeAway === "home") || comps[0];
        const away = comps.find((c: any) => c?.homeAway === "away") || comps[1];

        if (!home || !away) continue;

        const homeName =
            home?.team?.shortDisplayName ||
            home?.team?.abbreviation ||
            home?.team?.displayName ||
            "HOME";
        const awayName =
            away?.team?.shortDisplayName ||
            away?.team?.abbreviation ||
            away?.team?.displayName ||
            "AWAY";

        lines.push(
            `${homeName} ${home?.score ?? 0} — ${awayName} ${away?.score ?? 0} (${status})`
        );
    }

    return lines;
}

export function formatSummaryLine(summary: any): string {
    const comp = summary?.header?.competitions?.[0];
    const comps = comp?.competitors || [];
    const status =
        comp?.status?.type?.shortDetail ||
        comp?.status?.type?.description ||
        "In progress";

    const home = comps.find((c: any) => c?.homeAway === "home") || comps[0];
    const away = comps.find((c: any) => c?.homeAway === "away") || comps[1];

    if (!home || !away) {
        return `Unknown 0 — Unknown 0 (${status})`;
    }

    const homeName =
        home?.team?.shortDisplayName ||
        home?.team?.abbreviation ||
        home?.team?.displayName ||
        "HOME";
    const awayName =
        away?.team?.shortDisplayName ||
        away?.team?.abbreviation ||
        away?.team?.displayName ||
        "AWAY";

    return `${homeName} ${home?.score ?? 0} — ${awayName} ${away?.score ?? 0} (${status})`;
}

/* ============================================================
FIND EVENT BY TEAM (HUMAN QUERY → EVENT ID)
============================================================ */

export async function findEventIdByTeam(
    sport: SportKey,
    teamQuery: string,
    date?: string
): Promise<{
    eventId: string | null;
    scoreboardUrl: string;
    matchScore: number;
    games: { id: string; home: string; away: string; status: string }[];
}> {
    const q = teamQuery.toLowerCase();

    // 1) Standard scoreboard (with date if provided)
    const { url, data } = await getScoreboard(sport, date);
    const events = data?.events ?? [];

    // 2) Prepare list of games for debugging / explanations
    const games: { id: string; home: string; away: string; status: string }[] = [];

    let best = { eventId: null as string | null, matchScore: 0 };

    for (const ev of events) {
        const id = ev?.id;
        const comp = ev?.competitions?.[0];
        const comps = comp?.competitors || [];
        const status =
            comp?.status?.type?.shortDetail ||
            comp?.status?.type?.description ||
            "Scheduled";

        const home =
            comps.find((c: any) => c?.homeAway === "home") || comps[0];
        const away =
            comps.find((c: any) => c?.homeAway === "away") || comps[1];

        const homeName =
            home?.team?.displayName ||
            home?.team?.shortDisplayName ||
            home?.team?.abbreviation ||
            "HOME";
        const awayName =
            away?.team?.displayName ||
            away?.team?.shortDisplayName ||
            away?.team?.abbreviation ||
            "AWAY";

        games.push({
            id: id ?? "",
            home: homeName,
            away: awayName,
            status,
        });

        // --- fuzzy match on team names ---
        const names: string[] = [];
        const pushNames = (t: any) => {
            if (!t) return;
            [
                t.displayName,
                t.shortDisplayName,
                t.name,
                t.nickname,
                t.location,
                t.abbreviation,
            ]
                .filter(Boolean)
                .forEach((s: string) => names.push(s.toLowerCase()));
        };

        pushNames(home?.team);
        pushNames(away?.team);

        let score = 0;
        for (const n of names) {
            // require substring match in either direction
            if (q.includes(n) || n.includes(q)) score += n.length;
        }

        if (score > best.matchScore) {
            best = { eventId: id ?? null, matchScore: score };
        }
    }

    // 🚫 HARD RULE: if we didn’t actually match the team name, we return null.
    if (!best.eventId || best.matchScore === 0) {
        return {
            eventId: null,
            scoreboardUrl: url,
            matchScore: 0,
            games,
        };
    }

    return {
        eventId: best.eventId,
        scoreboardUrl: url,
        matchScore: best.matchScore,
        games,
    };
}

/* ============================================================
"BOX SCORE" VIA SUMMARY (NO /boxscore ENDPOINT)
============================================================ */

/**
* We do NOT call ESPN's /boxscore?event= endpoint directly,
* because it often 404s. Instead we pull boxscore from summary.
*/
export async function getBoxscore(
    sport: SportKey,
    eventId: string
): Promise<{ url: string; boxscore: any | null; raw: any }> {
    const url = ENDPOINTS[sport].summary + eventId;
    const raw = await getJSON(url);

    // ESPN nests boxscore differently depending on sport/version
    const boxscore =
        raw?.gamePackageJSON?.boxscore || // most common
        raw?.boxscore || // alternate
        null;

    return { url, boxscore, raw };
}

/**
* Pretty-print a simplified boxscore. You pass the inner boxscore object
* (not the whole summary) plus optional sport hint if you want
* sport-specific formatting.
*/
export function formatBoxscore(
    boxscore: any,
    sportHint?: SportKey,
    limitTeams = 2,
    limitPlayers = 5
): string {
    // ESPN shapes:
    // - NBA/NCAAB: boxscore.players: [{ team, statistics: [{ labels, athletes: [...] }] }, ...]
    // - NFL/MLB/NHL: boxscore.players or boxscore.teams with a similar statistics[] structure
    const teams =
        boxscore?.players ||
        boxscore?.teams ||
        boxscore?.boxscore?.players ||
        [];

    if (!Array.isArray(teams) || teams.length === 0) {
        return "No boxscore data available.";
    }

    const lines: string[] = [];

    const sportGuess =
        sportHint ||
        (boxscore?.header?.league?.abbreviation || "").toLowerCase() ||
        "";

    for (const teamBlock of teams.slice(0, limitTeams)) {
        const teamName =
            teamBlock?.team?.displayName ||
            teamBlock?.team?.shortDisplayName ||
            teamBlock?.team?.abbreviation ||
            "Team";

        lines.push(teamName);
        lines.push("-".repeat(teamName.length));

        // IMPORTANT FIX:
        // Athletes live under statistics[0].athletes, not directly on teamBlock.
        const statsTable = teamBlock?.statistics?.[0];
        const headers: string[] = statsTable?.labels || statsTable?.names || [];

        const athletes = statsTable?.athletes || teamBlock?.athletes || [];
        if (!headers.length || !athletes.length) {
            lines.push(" (No individual stats available)");
            lines.push("");
            continue;
        }

        const findIdx = (pattern: RegExp) =>
            headers.findIndex((h: string) => pattern.test(h.toLowerCase()));

        // 🏀 Basketball (NBA + Men's College)
        if (
            sportGuess === "nba" ||
            sportGuess === "mcb" ||
            sportGuess.includes("basketball")
        ) {
            const idxPts = findIdx(/pts?/);
            const idxReb = findIdx(/reb/);
            const idxAst = findIdx(/ast/);

            lines.push(" Name PTS REB AST");
            for (const a of athletes.slice(0, limitPlayers)) {
                const name =
                    a?.athlete?.displayName ||
                    a?.athlete?.shortName ||
                    a?.athlete?.name ||
                    "Unknown";
                const pts = idxPts >= 0 ? a?.stats?.[idxPts] ?? "-" : "-";
                const reb = idxReb >= 0 ? a?.stats?.[idxReb] ?? "-" : "-";
                const ast = idxAst >= 0 ? a?.stats?.[idxAst] ?? "-" : "-";
                lines.push(
                    ` ${name.padEnd(20)} ${String(pts).padStart(3)} ${String(
                        reb
                    ).padStart(3)} ${String(ast).padStart(3)}`
                );
            }
        }

        // 🏈 Football (NFL)
        else if (sportGuess === "nfl" || sportGuess.includes("football")) {
            const idxPassYds = findIdx(/pass.*yd/);
            const idxPassTD = findIdx(/pass.*td/);
            const idxRushYds = findIdx(/rush.*yd/);
            const idxRushTD = findIdx(/rush.*td/);
            const idxRecYds = findIdx(/rec.*yd/);
            const idxRecTD = findIdx(/rec.*td/);

            lines.push(" Name PASSYDS TD RUSHYDS TD RECYDS TD");
            for (const a of athletes.slice(0, limitPlayers)) {
                const name =
                    a?.athlete?.displayName ||
                    a?.athlete?.shortName ||
                    a?.athlete?.name ||
                    "Unknown";
                const py = idxPassYds >= 0 ? a?.stats?.[idxPassYds] ?? "-" : "-";
                const ptd = idxPassTD >= 0 ? a?.stats?.[idxPassTD] ?? "-" : "-";
                const ry = idxRushYds >= 0 ? a?.stats?.[idxRushYds] ?? "-" : "-";
                const rtd = idxRushTD >= 0 ? a?.stats?.[idxRushTD] ?? "-" : "-";
                const recy = idxRecYds >= 0 ? a?.stats?.[idxRecYds] ?? "-" : "-";
                const rectd = idxRecTD >= 0 ? a?.stats?.[idxRecTD] ?? "-" : "-";
                lines.push(
                    ` ${name.padEnd(20)} ${String(py).padStart(6)} ${String(
                        ptd
                    ).padStart(2)} ${String(ry).padStart(6)} ${String(
                        rtd
                    ).padStart(2)} ${String(recy).padStart(6)} ${String(
                        rectd
                    ).padStart(2)}`
                );
            }
        }

        // ⚾ Baseball
        else if (sportGuess === "mlb" || sportGuess.includes("baseball")) {
            const idxAB = findIdx(/^ab$/);
            const idxH = findIdx(/^h$/);
            const idxHR = findIdx(/^hr$/);
            const idxRBI = findIdx(/^rbi$/);

            lines.push(" Name AB H HR RBI");
            for (const a of athletes.slice(0, limitPlayers)) {
                const name =
                    a?.athlete?.displayName ||
                    a?.athlete?.shortName ||
                    a?.athlete?.name ||
                    "Unknown";
                const ab = idxAB >= 0 ? a?.stats?.[idxAB] ?? "-" : "-";
                const h = idxH >= 0 ? a?.stats?.[idxH] ?? "-" : "-";
                const hr = idxHR >= 0 ? a?.stats?.[idxHR] ?? "-" : "-";
                const rbi = idxRBI >= 0 ? a?.stats?.[idxRBI] ?? "-" : "-";
                lines.push(
                    ` ${name.padEnd(20)} ${String(ab).padStart(3)} ${String(
                        h
                    ).padStart(3)} ${String(hr).padStart(3)} ${String(rbi).padStart(3)}`
                );
            }
        }

        // 🏒 Hockey
        else if (sportGuess === "nhl" || sportGuess.includes("hockey")) {
            const idxG = findIdx(/^g$/);
            const idxA = findIdx(/^a$/);
            const idxSOG = findIdx(/sog|shots/);

            lines.push(" Name G A SOG");
            for (const a of athletes.slice(0, limitPlayers)) {
                const name =
                    a?.athlete?.displayName ||
                    a?.athlete?.shortName ||
                    a?.athlete?.name ||
                    "Unknown";
                const g = idxG >= 0 ? a?.stats?.[idxG] ?? "-" : "-";
                const ast = idxA >= 0 ? a?.stats?.[idxA] ?? "-" : "-";
                const sog = idxSOG >= 0 ? a?.stats?.[idxSOG] ?? "-" : "-";
                lines.push(
                    ` ${name.padEnd(20)} ${String(g).padStart(3)} ${String(
                        ast
                    ).padStart(3)} ${String(sog).padStart(3)}`
                );
            }
        }

        // Generic fallback (any sport)
        else {
            lines.push(" Name / basic stats");
            for (const a of athletes.slice(0, limitPlayers)) {
                const name =
                    a?.athlete?.displayName ||
                    a?.athlete?.shortName ||
                    a?.athlete?.name ||
                    "Unknown";
                const statsArr = a?.stats || [];
                const pretty = statsArr
                    .slice(0, 6)
                    .map((v: any, i: number) => `${headers[i] || "Stat " + (i + 1)}=${v}`)
                    .join(", ");
                lines.push(` ${name}: ${pretty}`);
            }
        }

        lines.push(""); // blank line between teams
    }

    return lines.join("\n");
}

/* ============================================================
PLAYER SEARCH + DETAILS + NFL FANTASY HELPERS
============================================================ */

const SEARCH_API =
    "https://site.web.api.espn.com/apis/common/v3/search?region=us&lang=en&query=";

export type SeasonStatLine = { label: string; value: string };

export type PlayerInfo = {
    ok: boolean;
    id?: string;
    name?: string;
    sport?: SportKey;
    team?: string;
    position?: string;
    age?: number;
    height?: string;
    weight?: string;
    draft?: string;
    college?: string;
    seasonStats?: Record<string, string | number>;
    season?: number;
    seasonLabel?: string;
    seasonStatsList?: SeasonStatLine[];
    url?: string;
    note?: string;
};

function mapLeagueToSportKey(league: string): SportKey | null {
    const L = league.toLowerCase();
    if (L.includes("nfl")) return "nfl";
    if (L.includes("nba")) return "nba";
    if (L.includes("mens-college-basketball")) return "mcb";
    if (L.includes("mlb")) return "mlb";
    if (L.includes("nhl")) return "nhl";
    return null;
}

/* ---------- NFL Fantasy Helpers ---------- */

function toNumber(x: any): number {
    if (x === null || x === undefined) return 0;
    const s = String(x).replace(/[^\d.\-]/g, "");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}

function buildSeasonStats(summary: any): {
    statsRecord: Record<string, number>;
    statLines: SeasonStatLine[];
} {
    const statsRecord: Record<string, number> = {};
    const statLines: SeasonStatLine[] = [];

    const stats = summary?.statistics;
    if (!Array.isArray(stats)) return { statsRecord, statLines };

    for (const stat of stats) {
        const label =
            stat?.displayName ||
            stat?.name ||
            stat?.shortDisplayName ||
            stat?.description ||
            `Stat ${statLines.length + 1}`;
        const key = label.toLowerCase();
        const numeric = toNumber(stat?.value ?? stat?.displayValue ?? 0);
        const display =
            stat?.displayValue ??
            (Number.isFinite(numeric) ? numeric.toString() : String(stat?.value ?? ""));

        statsRecord[key] = numeric;
        statLines.push({ label, value: display });
    }

    return { statsRecord, statLines };
}

/**
* Normalize ESPN season stats into a uniform NFL structure.
*/
export function normalizeNFLStats(seasonStats?: Record<string, any>) {
    if (!seasonStats) return undefined;

    const read = (candidates: string[]) => {
        for (const key of Object.keys(seasonStats)) {
            const lk = key.toLowerCase();
            if (candidates.some((c) => lk.includes(c))) {
                return toNumber(seasonStats[key]);
            }
        }
        return 0;
    };

    return {
        gp: read(["gp", "games"]),
        passYds: read(["pass yds", "passing yards", "py"]),
        passTD: read(["pass td", "passing tds"]),
        passInt: read(["int", "interceptions"]),
        rushYds: read(["rush yds", "rushing yards"]),
        rushTD: read(["rush td", "rushing tds"]),
        rushAtt: read(["rush att", "rushing attempts", "carries"]),
        rec: read(["rec", "receptions"]),
        recYds: read(["rec yds", "receiving yards"]),
        recTD: read(["rec td", "receiving tds"]),
        targets: read(["tgt", "targets"]),
    };
}

/**
* Compute fantasy points from normalized stats.
* Standard: 1pt/25 pass yds, 4pt pass TD, -2 INT,
* 1pt/10 rush+rec yds, 6pt TD.
* PPR: Standard + 1pt per reception.
*/
export function computeFantasyFromNFL(
    stats: ReturnType<typeof normalizeNFLStats>
) {
    if (!stats) return undefined;

    const g = Math.max(stats.gp ?? 1, 1);

    const standard =
        stats.passYds * 0.04 +
        stats.passTD * 4 +
        stats.passInt * -2 +
        stats.rushYds * 0.1 +
        stats.rushTD * 6 +
        stats.recYds * 0.1 +
        stats.recTD * 6;

    const ppr = standard + stats.rec * 1;

    return {
        season: {
            standard: +standard.toFixed(1),
            ppr: +ppr.toFixed(1),
        },
        perGame: {
            standard: +(standard / g).toFixed(2),
            ppr: +(ppr / g).toFixed(2),
        },
    };
}

/* ---------- Player Search & Details ---------- */

import { getAllNFLPlayers, getAllNBAPlayers, getAllMLBPlayers, getAllNCAAPlayers } from './espn';

export async function searchPlayer(
    name: string,
    prefer?: SportKey
): Promise<{ id: string; sport: SportKey } | null> {
    // 1. Try Search API first
    try {
        const data = await getJSON(SEARCH_API + encodeURIComponent(name));
        const items = data?.results?.[0]?.items || data?.items || [];

        for (const it of items) {
            if (it.type !== "athlete" && it.type !== "player") continue;

            const id = (it?.id || it?.uid?.split(":").pop() || "").toString();
            const leagueUrl = it?.leagues?.[0]?.href || it?.leagues?.[0]?.id || "";
            const sportKey =
                mapLeagueToSportKey(leagueUrl || it?.league || "") || undefined;

            if (id && sportKey && (!prefer || prefer === sportKey)) {
                return { id, sport: sportKey };
            }
        }
    } catch (e) {
        console.warn("Search API failed, trying fallback...", e);
    }

    // 2. Fallback: Scan rosters if sport is known
    if (prefer) {
        let players: any[] = [];
        switch (prefer) {
            case 'nfl': players = await getAllNFLPlayers(); break;
            case 'nba': players = await getAllNBAPlayers(); break;
            case 'mlb': players = await getAllMLBPlayers(); break;
            case 'mcb': players = await getAllNCAAPlayers('basketball'); break;
        }

        const lowerName = name.toLowerCase();
        const found = players.find((p: any) =>
            p.displayName?.toLowerCase() === lowerName ||
            p.fullName?.toLowerCase() === lowerName ||
            p.displayName?.toLowerCase().includes(lowerName)
        );

        if (found) {
            return { id: found.id, sport: prefer };
        }
    }

    return null;
}

export async function getPlayerDetails(
    sport: SportKey,
    athleteId: string,
    season?: number
): Promise<PlayerInfo> {
    const base = `https://site.web.api.espn.com/apis/common/v3/sports/${SPORT_PATH[sport]}/athletes/${athleteId}?region=us&lang=en`;

    try {
        // 1. Fetch Bio Info
        const url = season ? `${base}&season=${season}` : base;
        const j = await getJSON(url);
        const core = j?.athlete || j;

        // 2. Fetch Detailed Stats from Splits (to get Rushing for QBs, etc.)
        // Use provided season or default to current year (approximate)
        const targetSeason = season || new Date().getFullYear();
        const splitsUrl = `https://site.web.api.espn.com/apis/common/v3/sports/${SPORT_PATH[sport]}/athletes/${athleteId}/splits?season=${targetSeason}&region=us&lang=en`;

        let statsRecord: Record<string, number> = {};
        let statLines: SeasonStatLine[] = [];

        try {
            const splitsData = await getJSON(splitsUrl);
            const generalSplits = splitsData.splitCategories?.[0]?.splits || [];
            const split = generalSplits.find((s: any) =>
                s.displayName === "All Splits" ||
                s.displayName === "Regular Season" ||
                s.displayName === targetSeason.toString()
            );

            if (split && splitsData.displayNames) {
                splitsData.displayNames.forEach((name: string, i: number) => {
                    const val = split.stats[i];
                    const numeric = Number(String(val).replace(/[^\d.-]/g, ''));
                    statsRecord[name.toLowerCase()] = isNaN(numeric) ? 0 : numeric;
                    statLines.push({ label: name, value: String(val) });
                });
            }
        } catch (e) {
            console.warn("Failed to fetch splits, falling back to summary:", e);
            // Fallback to original summary if splits fail
            const summary = buildSeasonStats(core?.statsSummary);
            statsRecord = summary.statsRecord;
            statLines = summary.statLines;
        }

        // If splits didn't yield data, try fallback again
        if (Object.keys(statsRecord).length === 0) {
            const summary = buildSeasonStats(core?.statsSummary);
            statsRecord = summary.statsRecord;
            statLines = summary.statLines;
        }

        return {
            ok: true,
            id: core?.id,
            name: core?.displayName || core?.fullName,
            team: core?.team?.displayName,
            position: core?.position?.abbreviation,
            college: core?.college?.name,
            draft: core?.draft?.year
                ? `Round ${core?.draft?.round}, Pick ${core?.draft?.selection} (${core?.draft?.year})`
                : undefined,
            age: core?.age,
            height: core?.displayHeight,
            weight: core?.displayWeight,
            season: season ?? j?.season?.year,
            seasonLabel: core?.statsSummary?.displayName || `${targetSeason} Season`,
            seasonStats: Object.keys(statsRecord).length ? statsRecord : undefined,
            seasonStatsList: statLines.length ? statLines : undefined,
            url,
            sport,
        };
    } catch (e: any) {
        return { ok: false, note: e.message, sport };
    }
}

/* ============================================================
PLAYER SEASON & GAME STATS HELPERS (ALL SPORTS)
============================================================ */

export type PlayerSeasonStatsResult = PlayerInfo;

export type PlayerGameStatsResult = {
    ok: boolean;
    sport: SportKey;
    eventId?: string;
    date?: string;
    player?: {
        name: string;
        team?: string;
        stats?: any;
        labels?: string[];
    };
    note?: string;
    summaryUrl?: string;
};

/**
* Convenience helper:
* - Takes a player name + sport
* - Looks up their athleteId via search
* - Returns season stats using getPlayerDetails
*/
export async function getPlayerSeasonStatsByName(
    sport: SportKey,
    playerName: string,
    season?: number
): Promise<PlayerSeasonStatsResult> {
    const found = await searchPlayer(playerName, sport);
    if (!found || found.sport !== sport) {
        return { ok: false, note: "Player not found for that sport.", sport };
    }
    return getPlayerDetails(sport, found.id, season);
}

/**
* Generic game-stats helper for ANY supported sport:
* - sport: "nba" | "nfl" | "mlb" | "mcb" | "nhl"
* - teamQuery: something like "hawks" or "atlanta hawks"
* - playerName: "Trae Young"
* - date: YYYYMMDD (e.g. "20251116")
*/
export async function getPlayerGameStats(
    sport: SportKey,
    teamQuery: string,
    playerName: string,
    date: string
): Promise<PlayerGameStatsResult> {
    const { eventId, matchScore } = await findEventIdByTeam(sport, teamQuery, date);
    if (!eventId || matchScore <= 0) {
        return {
            ok: false,
            sport,
            date,
            note: `Game not found for ${teamQuery} on ${date}.`,
        };
    }

    const gb = await getBoxscore(sport, eventId);
    const raw: any = (gb as any).rawSummary ?? (gb as any).raw ?? (gb as any).data ?? null;
    const box = (gb as any).boxscore ?? raw?.gamePackageJSON?.boxscore ?? raw?.boxscore;

    if (!box) {
        return {
            ok: false,
            sport,
            eventId,
            date,
            note: "Boxscore not available yet.",
        };
    }

    const teams = box?.players || box?.teams || [];
    let foundPlayer: any = null;

    for (const t of teams) {
        const statsTable = t.statistics?.[0];
        const labels = statsTable?.labels || statsTable?.names || [];
        const athletes = statsTable?.athletes || t.athletes || [];

        for (const a of athletes) {
            const nmLC =
                a?.athlete?.displayName?.toLowerCase() ||
                a?.athlete?.shortName?.toLowerCase() ||
                "";
            if (nmLC.includes(playerName.toLowerCase())) {
                foundPlayer = {
                    name: a.athlete.displayName,
                    team:
                        t.team?.displayName ||
                        t.team?.shortDisplayName ||
                        t.team?.abbreviation,
                    stats: a.stats,
                    labels,
                };
                break;
            }
        }
        if (foundPlayer) break;
    }

    if (!foundPlayer) {
        return {
            ok: false,
            sport,
            eventId,
            date,
            note: `Player ${playerName} not found in boxscore.`,
        };
    }

    return {
        ok: true,
        sport,
        eventId,
        date,
        summaryUrl: (gb as any).url,
        player: foundPlayer,
    };
}

/* ============================================================
   LEAGUE LEADERS
   ============================================================ */

export async function getLeagueLeaders(sport: SportKey, season?: number): Promise<{ ok: boolean; leaders?: any[]; note?: string }> {
    // Unofficial endpoint pattern:
    // https://site.api.espn.com/apis/site/v3/sports/:sport/:league/leaders

    // Map 'mcb' to 'mens-college-basketball' for the URL
    const leaguePath = SPORT_PATH[sport];

    // Note: v3 endpoint fails if we pass ?season=2025 (current year).
    // So we only append season if it is provided AND NOT the current year.
    const currentYear = new Date().getFullYear();
    const shouldUseSeasonParam = season && season !== currentYear;

    const url = shouldUseSeasonParam
        ? `https://site.api.espn.com/apis/site/v3/sports/${leaguePath}/leaders?season=${season}`
        : `https://site.api.espn.com/apis/site/v3/sports/${leaguePath}/leaders`;

    try {
        const data = await getJSON(url);

        // Structure for v3 (NFL at least): data.leaders.categories[]
        const categories = data?.leaders?.categories || data?.leaders || [];

        if (!Array.isArray(categories) || !categories.length) {
            return { ok: false, note: `No leaders data found for ${sport}.` };
        }

        return { ok: true, leaders: categories };

    } catch (e: any) {
        return { ok: false, note: `Failed to fetch leaders for ${sport}. The API might not support this sport.` };
    }
}

export function formatLeagueLeaders(leaders: any[], maxPerCategory = 5): string {
    const lines: string[] = [];

    for (const cat of leaders) {
        const catName = cat.displayName || cat.name || "Category";
        lines.push(`--- ${catName} ---`);

        const players = cat.leaders || [];
        for (const p of players.slice(0, maxPerCategory)) {
            const rank = p.rank;
            const athlete = p.athlete;
            const name = athlete?.displayName || athlete?.fullName || athlete?.shortName || "Unknown";
            const team = athlete?.team?.abbreviation || athlete?.team?.shortDisplayName || "";
            const value = p.displayValue;

            lines.push(`${rank}. ${name} (${team}) - ${value}`);
        }
        lines.push(""); // spacer
    }

    return lines.join("\n");
}


