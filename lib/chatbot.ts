/*
 * Fanalytics - Sports Chatbot Library
 *
 * This library provides AI-powered sports chat functionality using OpenAI,
 * integrating ESPN data, player stats, betting odds, and web search.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import OpenAI from "openai";
import {
SportKey,
getScoreboard,
getBoxscore,
formatBoard,
formatBoxscore,
formatSummaryLine,
searchPlayer,
getPlayerDetails,
normalizeNFLStats,
computeFantasyFromNFL,
} from "./espn-data";
import { getOdds, formatOdds } from "./odds";

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY!,
});

/* ============================================================
DATE HELPERS
============================================================ */

function toYYYYMMDD(d: Date): string {
return d.toISOString().split("T")[0].replace(/-/g, "");
}

function extractYYYYMMDD(text: string | undefined): string | undefined {
if (!text) return undefined;
const s = text.toLowerCase().trim();

if (/\btoday\b/.test(s)) return toYYYYMMDD(new Date());

if (/\byesterday\b/.test(s)) {
const d = new Date();
d.setDate(d.getDate() - 1);
return toYYYYMMDD(d);
}

// 11/16/2025 or 11-16-25
const m1 = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
if (m1) {
const [, m, d, y] = m1;
const yy = y.length === 2 ? "20" + y : y;
return `${yy}${m.padStart(2, "0")}${d.padStart(2, "0")}`;
}

// raw YYYYMMDD
const m2 = s.match(/\b(\d{4})(\d{2})(\d{2})\b/);
if (m2) return m2[0];

return undefined;
}

/* ============================================================
TOOLS DEFINITION
============================================================ */

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
{
type: "function",
function: {
name: "get_scoreboard",
description: "Get the scoreboard for a given league and date from ESPN.",
parameters: {
type: "object",
properties: {
sport: {
type: "string",
enum: ["nba", "nfl", "mlb", "mcb", "nhl"],
},
date: {
type: "string",
description:
"Optional date (e.g. 'today', 'yesterday', '11/16/2025', '2025-11-16', or '20251116'). If omitted, assume today.",
},
},
required: ["sport"],
},
},
},
{
type: "function",
function: {
name: "get_boxscore_for_team",
description:
"Get the box score for a specific team on a specific date from ESPN.",
parameters: {
type: "object",
properties: {
sport: {
type: "string",
enum: ["nba", "nfl", "mlb", "mcb", "nhl"],
},
team: {
type: "string",
description: "Team name, city, or abbreviation. E.g. 'Atlanta Hawks', 'ATL'.",
},
date: {
type: "string",
description:
"Game date (e.g. '11/16/2025', '2025-11-16', '20251116', 'today', 'yesterday').",
},
},
required: ["sport", "team", "date"],
},
},
},
{
type: "function",
function: {
name: "get_player_game_stats",
description:
"Get a player's stats for a specific game in NBA, NFL, MLB, NCAA MBB, or NHL by scanning all boxscores on that date.",
parameters: {
type: "object",
properties: {
sport: {
type: "string",
enum: ["nba", "nfl", "mlb", "mcb", "nhl"],
},
playerName: {
type: "string",
description: "Player's name, e.g. 'Jalen Johnson'.",
},
date: {
type: "string",
description:
"Game date (e.g. '11/16/2025', '2025-11-16', '20251116', 'today', 'yesterday').",
},
},
required: ["sport", "playerName", "date"],
},
},
},
{
type: "function",
function: {
name: "get_player_season_stats",
description:
"Get a player's season stats for a given league/season (NBA, NFL, MLB, NCAA MBB, NHL).",
parameters: {
type: "object",
properties: {
sport: {
type: "string",
enum: ["nba", "nfl", "mlb", "mcb", "nhl"],
},
playerName: {
type: "string",
description: "Name of the player, e.g. 'Trae Young'.",
},
season: {
type: "number",
description: "Season year, e.g. 2025. If omitted, use current/latest.",
},
},
required: ["sport", "playerName"],
},
},
},
{
type: "function",
function: {
name: "compare_players_nfl",
description: "Compare NFL players' fantasy stats (Standard & PPR) over a season.",
parameters: {
type: "object",
properties: {
players: {
type: "array",
items: { type: "string" },
description: "Two or more NFL player names.",
},
season: {
type: "number",
description: "Season year, e.g. 2025.",
},
},
required: ["players"],
},
},
},
{
type: "function",
function: {
name: "get_odds",
description: "Fetch current betting odds for a sport (NBA, NFL, MLB, NCAAB).",
parameters: {
type: "object",
properties: {
sport: {
type: "string",
enum: ["basketball_nba", "football_nfl", "baseball_mlb", "basketball_ncaab"],
},
},
required: ["sport"],
},
},
},
];

/* ============================================================
CORE CHAT LOGIC
============================================================ */

export async function runChat(query: string): Promise<string> {
const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
{
role: "system",
content: [
"You are a sports data and betting chatbot.",
"CRITICAL:",
"- Always use tools for scores, box scores, player stats, or betting odds.",
"- Do NOT invent scores, dates, or stats. If a tool returns ok=false, say you don't have the data.",
"- When a tool returns a date or URL, trust that over your own guesses.",
].join("\n"),
},
{ role: "user", content: query },
];

const globalDateHint = extractYYYYMMDD(query);

// First pass: let the model decide which tool to call
const resp = await client.chat.completions.create({
model: "gpt-4o",
messages,
tools,
tool_choice: "auto",
});

const firstMessage = resp.choices[0].message;
const toolCalls = firstMessage.tool_calls;

if (!toolCalls || toolCalls.length === 0) {
return firstMessage.content ?? "";
}

const call = toolCalls[0];

if (call.type !== "function") {
return firstMessage.content ?? "";
}

const fn = call.function;
const name: string = fn.name;
const args = fn.arguments ? JSON.parse(fn.arguments) : {};

let toolResult: any = { ok: false, note: "Tool not handled." };

/* -------------------- 1) SCOREBOARD -------------------- */

if (name === "get_scoreboard") {
const sport = args.sport as SportKey;
const dateText: string | undefined = args.date;
const dateParam =
extractYYYYMMDD(dateText) || globalDateHint || toYYYYMMDD(new Date());

const { url, data } = await getScoreboard(sport, dateParam);
const lines = formatBoard(data);

const espnDate =
data?.day?.date ||
(data?.events?.[0]?.date ?? null);

toolResult = {
ok: true,
sport,
requestedDate: dateParam,
espnDate,
url,
lines,
};
}

/* -------------------- 2) BOX SCORE FOR TEAM -------------------- */

if (name === "get_boxscore_for_team") {
const sport = args.sport as SportKey;
const team = args.team as string;
const dateText: string | undefined = args.date;
const dateParam = extractYYYYMMDD(dateText) || globalDateHint;

if (!dateParam) {
toolResult = {
ok: false,
note: "No valid date provided or inferred. Please include a game date.",
};
} else {
const { url: scoreboardUrl, data: board } = await getScoreboard(
sport,
dateParam
);

const events = board?.events ?? [];
if (!events.length) {
toolResult = {
ok: false,
note: `No games found for that league on ${dateParam}.`,
scoreboardUrl,
};
} else {
// crude team match
const q = team.toLowerCase();
let bestEventId: string | null = null;
let bestScore = 0;

for (const ev of events) {
const eventId = ev?.id;
const comp = ev?.competitions?.[0];
const competitors = comp?.competitors ?? [];
const names: string[] = [];
for (const c of competitors) {
const t = c?.team ?? {};
const parts = [
t.displayName,
t.shortDisplayName,
t.abbreviation,
t.nickname,
t.location,
].filter(Boolean);
for (const p of parts) names.push((p as string).toLowerCase());
}
let score = 0;
for (const n of names) {
if (q.includes(n) || n.includes(q)) score += n.length;
}
if (score > bestScore && eventId) {
bestScore = score;
bestEventId = eventId;
}
}

if (!bestEventId || bestScore === 0) {
toolResult = {
ok: false,
note: `No game found for team '${team}' on ${dateParam}.`,
scoreboardUrl,
};
} else {
const gb = await getBoxscore(sport, bestEventId);
const raw: any =
(gb as any).rawSummary ??
(gb as any).raw ??
(gb as any).data ??
null;
const box = (gb as any).boxscore ?? raw?.gamePackageJSON?.boxscore;
const scoreLine = raw ? formatSummaryLine(raw) : undefined;

toolResult = {
ok: true,
sport,
team,
date: dateParam,
eventId: bestEventId,
scoreboardUrl,
summaryUrl: (gb as any).url,
scoreLine,
boxscoreText: box ? formatBoxscore(box, sport) : "No boxscore data.",
};
}
}
}
}

/* -------------------- 3) PLAYER GAME STATS -------------------- */

if (name === "get_player_game_stats") {
const sport = args.sport as SportKey;
const playerName = args.playerName as string;
const dateText: string | undefined = args.date;
const dateParam = extractYYYYMMDD(dateText) || globalDateHint;

if (!dateParam) {
toolResult = {
ok: false,
note: "No valid date provided or inferred. Please include a game date.",
};
} else {
// 1) Get scoreboard for that sport+date
const { url: scoreboardUrl, data: board } = await getScoreboard(
sport,
dateParam
);
const events = board?.events ?? [];

if (!events.length) {
toolResult = {
ok: false,
note: `No games found for that league on ${dateParam}.`,
scoreboardUrl,
};
} else {
let foundPlayer: any = null;
let foundGame: { eventId: string; summaryUrl: string; raw: any } | null =
null;

// 2) Loop over all games that day, inspect boxscore for player
for (const ev of events) {
const eventId = ev?.id;
if (!eventId) continue;

const gb = await getBoxscore(sport, eventId);
const raw: any =
(gb as any).rawSummary ??
(gb as any).raw ??
(gb as any).data ??
null;
const box =
(gb as any).boxscore ??
raw?.gamePackageJSON?.boxscore ??
raw?.boxscore;

const teams = box?.players || box?.teams || [];
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
foundGame = {
eventId,
summaryUrl: (gb as any).url,
raw,
};
break;
}
}
if (foundPlayer) break;
}
if (foundPlayer && foundGame) break;
}

if (!foundPlayer || !foundGame) {
toolResult = {
ok: false,
note: `Could not find stats for ${playerName} on ${dateParam}.`,
scoreboardUrl,
};
} else {
toolResult = {
ok: true,
sport,
date: dateParam,
eventId: foundGame.eventId,
summaryUrl: foundGame.summaryUrl,
player: foundPlayer,
};
}
}
}
}

/* -------------------- 4) PLAYER SEASON STATS -------------------- */

if (name === "get_player_season_stats") {
const sport = args.sport as SportKey;
const playerName = args.playerName as string;
const season: number | undefined = args.season;

const found = await searchPlayer(playerName, sport);
if (!found) {
toolResult = { ok: false, note: `Player '${playerName}' not found on ESPN.` };
} else {
const info = await getPlayerDetails(found.sport, found.id, season);

if (!info.ok) {
toolResult = {
ok: false,
note: info.note ?? "Could not fetch season stats.",
};
} else {
toolResult = {
ok: true,
player: {
name: info.name,
team: info.team,
position: info.position,
season: info.season,
seasonLabel: info.seasonLabel,
seasonStatsList: info.seasonStatsList,
url: info.url,
},
};
}
}
}

/* -------------------- 5) COMPARE NFL PLAYERS (FANTASY) -------------------- */

if (name === "compare_players_nfl") {
const season = (args.season as number | undefined) ?? new Date().getFullYear();
const players: string[] = (args.players || []).slice(0, 6);

const rows: any[] = [];
for (const nm of players) {
const found = await searchPlayer(nm, "nfl");
if (!found) {
rows.push({ name: nm, note: "Player not found." });
continue;
}

const info = await getPlayerDetails("nfl", found.id, season);
const norm = normalizeNFLStats(info.seasonStats);
const fantasy = computeFantasyFromNFL(norm);

rows.push({
name: info.name,
team: info.team,
pos: info.position,
passYds: norm?.passYds,
passTD: norm?.passTD,
rushYds: norm?.rushYds,
rushTD: norm?.rushTD,
recYds: norm?.recYds,
recTD: norm?.recTD,
stdPG: fantasy?.perGame.standard,
pprPG: fantasy?.perGame.ppr,
});
}

const header =
"Name Team Pos PassYds TD RushYds TD RecYds TD Std/G PPR/G";
const lines = rows.map((r) =>
`${(r.name || "").padEnd(20)} ${(r.team || "").padEnd(4)} ${(r.pos || "").padEnd(
3
)} ${String(r.passYds ?? "-").padStart(6)} ${String(r.passTD ?? "-").padStart(
2
)} ${String(r.rushYds ?? "-").padStart(6)} ${String(r.rushTD ?? "-").padStart(
2
)} ${String(r.recYds ?? "-").padStart(6)} ${String(r.recTD ?? "-").padStart(
2
)} ${String(r.stdPG ?? "-").padStart(5)} ${String(r.pprPG ?? "-").padStart(5)}`
);

toolResult = { ok: true, table: [header, ...lines].join("\n") };
}

/* -------------------- 6) BETTING ODDS -------------------- */

if (name === "get_odds") {
try {
const odds = await getOdds(args.sport);
toolResult = { ok: true, lines: formatOdds(odds) };
} catch (error: any) {
toolResult = { ok: false, note: `Failed to fetch odds: ${error.message}` };
}
}

// Add tool call and tool result into the conversation
messages.push(firstMessage);
messages.push({
role: "tool",
tool_call_id: call.id,
content: JSON.stringify(toolResult),
});

// Second pass: turn toolResult into a natural-language answer
const final = await client.chat.completions.create({
model: "gpt-4o",
messages,
});

return final.choices[0].message.content ?? "";
}
