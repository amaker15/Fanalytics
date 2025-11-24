/*
 * Fanalytics - Sports AI Agent Library
 *
 * This library provides AI-powered sports analysis using OpenAI Agents SDK,
 * integrating ESPN data, web search, and betting odds for comprehensive insights.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

import 'dotenv/config';

import {
webSearchTool,
Agent,
AgentInputItem,
Runner,
withTrace,
} from "@openai/agents";
import fetch from "node-fetch";

/* -------------------------------------------
1) WEB SEARCH TOOL (news / historical context)
-------------------------------------------- */

const webSearchPreview = webSearchTool({
filters: {
// NOTE: property name is camelCase
allowedDomains: [
"nfl.com",
"espn.com",
"www.pro-football-reference.com",
],
},
searchContextSize: "medium",
userLocation: { type: "approximate" },
});

/* -------------------------------------------
2) ESPN ROUTER TOOL (auto-detect + fetch)
Supports: NFL, NCAA Men's CBB, NBA, MLB, NHL
Uses scoreboard (today) or summary?event={id} (specific)
-------------------------------------------- */

type RouterInput = { queryText: string };
type SportKey = "nfl" | "mcb" | "nba" | "mlb" | "nhl";

const ESPN_ENDPOINTS: Record<SportKey, { scoreboard: string; summary: string }> = {
nfl: {
scoreboard:
"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
summary:
"https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=",
},
mcb: {
scoreboard:
"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard",
summary:
"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/summary?event=",
},
nba: {
scoreboard:
"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
summary:
"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=",
},
mlb: {
scoreboard:
"https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
summary:
"https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=",
},
nhl: {
scoreboard:
"https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",
summary:
"https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/summary?event=",
},
};

// --- Sport hints for detection ---
const NFL_HINTS = [
"nfl","football","chiefs","falcons","cowboys","eagles","bills","packers","bears","raiders","lions",
"ravens","steelers","jets","giants","patriots","texans","chargers","seahawks","broncos","dolphins",
"saints","vikings","bengals","browns","jaguars","panthers","buccaneers","titans","cardinals",
"commanders","rams","colts"
];
const MCB_HINTS = [
"ncaa","cbb","college basketball","men's college basketball","mens college basketball",
"jayhawks","kansas","duke","kentucky","gonzaga","uconn","unc","tar heels","michigan state","spartans",
"villanova","ucla","arizona","tennessee","illinois","purdue","baylor","houston"
];
const NBA_HINTS = [
"nba","hawks","lakers","clippers","warriors","suns","mavericks","celtics","knicks","nets","sixers",
"bucks","heat","bulls","raptors","cavaliers","pacers","pistons","magic","wizards","hornets","nuggets",
"timberwolves","thunder","blazers","jazz","kings","spurs","grizzlies","pelicans","rockets"
];
const MLB_HINTS = [
"mlb","braves","yankees","mets","red sox","dodgers","giants","padres","phillies","astros","rangers",
"mariners","orioles","rays","blue jays","guardians","tigers","twins","royals","white sox","cubs",
"brewers","cardinals","pirates","reds","d-backs","rockies","athletics","angels","nationals","marlins"
];
const NHL_HINTS = [
"nhl","blackhawks","bruins","canadiens","maple leafs","rangers","islanders","devils","flyers","penguins",
"capitals","hurricanes","panthers","lightning","sabres","senators","red wings","blues","predators",
"avalanche","wild","jets","flames","oilers","canucks","kraken","ducks","sharks","stars","kings","golden knights"
];

function detectSport(query: string): SportKey | null {
const q = query.toLowerCase();
const has = (list: string[]) => list.some((k) => q.includes(k));
if (has(NFL_HINTS)) return "nfl";
if (has(MCB_HINTS)) return "mcb";
if (has(NBA_HINTS)) return "nba";
if (has(MLB_HINTS)) return "mlb";
if (has(NHL_HINTS)) return "nhl";
if (q.includes("touchdown")) return "nfl";
if (q.includes("bracket") || q.includes("march madness")) return "mcb";
if (q.includes("three pointer") || q.includes("nba")) return "nba";
if (q.includes("home run") || q.includes("pitching")) return "mlb";
if (q.includes("power play") || q.includes("goalie")) return "nhl";
return null;
}

function wantsTodayScores(query: string) {
const q = query.toLowerCase();
const todayish = ["today","tonight","right now","live","scores","scoreboard","in progress","currently","who’s winning","whos winning","who is winning"];
return todayish.some((k) => q.includes(k));
}

function extractNumericId(query: string): string | null {
const m = query.match(/\b\d{9,}\b/); // espn event ids are usually 9+ digits
return m ? m[0] : null;
}

function extractEspnDate(query: string): string | null {
const q = query.toLowerCase().trim();

// Match formats like 11/16/2025 or 11-16-2025
const m1 = q.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
if (m1) {
const month = m1[1].padStart(2, "0");
const day = m1[2].padStart(2, "0");
const year = m1[3];
return `${year}${month}${day}`; // ESPN: YYYYMMDD
}

// Match formats like 2025-11-16
const m2 = q.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
if (m2) {
const year = m2[1];
const month = m2[2].padStart(2, "0");
const day = m2[3].padStart(2, "0");
return `${year}${month}${day}`;
}

return null;
}

async function httpGetJSON(url: string) {
const res = await fetch(url, { headers: { "User-Agent": "sportsbot/1.0 (educational)" } as any });
if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
return res.json();
}

function pickBestGameByTeams(scoreboard: any, queryLC: string): { gameId: string | null; matchScore: number } {
let best = { gameId: null as string | null, matchScore: 0 };
const events = scoreboard?.events ?? [];
for (const ev of events) {
const gid = ev?.id;
const comp = ev?.competitions?.[0];
const competitors = comp?.competitors ?? [];
const tokens: string[] = [];
for (const c of competitors) {
const t = c?.team ?? {};
const names = [t?.displayName, t?.shortDisplayName, t?.name, t?.nickname, t?.location, t?.abbrev]
.filter(Boolean)
.map((s: string) => s.toLowerCase());
tokens.push(...names);
}
let score = 0;
for (const token of tokens) if (token && queryLC.includes(token)) score += token.length;
if (score > best.matchScore) best = { gameId: gid, matchScore: score };
}
return best;
}

type SimpleLeader = { label: string; name: string; value: string; team?: string };

function extractLeaders(summary: any, sport: SportKey): SimpleLeader[] {
const out: SimpleLeader[] = [];
const leaders = summary?.leaders || summary?.gamePackageJSON?.leaders;
if (Array.isArray(leaders) && leaders.length) {
for (const cat of leaders) {
const label = cat?.name || cat?.displayName || "Leader";
const items = cat?.leaders || cat?.leaders?.leaders || cat?.athletes || [];
const first = Array.isArray(items) ? items[0] : null;
const name =
first?.athlete?.displayName ||
first?.athlete?.shortName ||
first?.team?.displayName ||
first?.name ||
"";
const value =
first?.shortDisplayValue ||
first?.displayValue ||
first?.value?.toString?.() ||
"";
const team = first?.team?.abbrev || first?.team?.displayName;
if (name && value) out.push({ label, name, value, team });
}
if (out.length) return out;
}

const box = summary?.boxscore || summary?.gamePackageJSON?.boxscore;
if (!box) return out;

try {
if (sport === "nfl") {
for (const cat of ["passing", "rushing", "receiving"]) {
const t = findTopLineInBox(box, cat);
if (t) out.push({ label: cat, name: t.name, value: t.value, team: t.team });
}
return out;
}
if (sport === "nba" || sport === "mcb") {
for (const cat of ["points","rebounds","assists"]) {
const t = findTopLineInBox(box, cat);
if (t) out.push({ label: cat, name: t.name, value: t.value, team: t.team });
}
return out;
}
if (sport === "mlb") {
for (const cat of ["home runs","rbi","hits","strikeouts"]) {
const t = findTopLineInBox(box, cat);
if (t) out.push({ label: cat, name: t.name, value: t.value, team: t.team });
}
return out;
}
if (sport === "nhl") {
for (const cat of ["goals","assists","points","saves"]) {
const t = findTopLineInBox(box, cat);
if (t) out.push({ label: cat, name: t.name, value: t.value, team: t.team });
}
return out;
}
} catch {
// ignore and return whatever we have
}
return out;
}

function findTopLineInBox(box: any, categoryLabelLC: string): { name: string; value: string; team?: string } | null {
const teams = box?.players || box?.teams || [];
for (const side of teams) {
const teamName = side?.team?.abbreviation || side?.team?.displayName || side?.team?.shortDisplayName;
const g = side?.statistics || side?.players || side?.athletes || [];
const items = Array.isArray(g) ? g : (g?.athletes || []);
for (const grp of items) {
const list = grp?.athletes || grp?.stats || grp?.statistics || [];
for (const p of (Array.isArray(list) ? list : [])) {
const nmLC =
p?.athlete?.displayName?.toLowerCase() ||
p?.athlete?.shortName?.toLowerCase() ||
"";
if (nmLC.includes(categoryLabelLC)) {
const num = (nmLC.match(/(\d+(\.\d+)?)/) || [])[0] || "";
if (nmLC && num) return { name: nmLC, value: num, team: teamName };
}
}
}
}
return null;
}

function formatScoreLineFromSummary(summary: any): { line: string; status: string } {
const headerComp = summary?.header?.competitions?.[0];
const status =
headerComp?.status?.type?.shortDetail ||
headerComp?.status?.type?.description ||
"In progress";

const comps = headerComp?.competitors || [];
const home = comps.find((c: any) => c?.homeAway === "home") || comps[0];
const away = comps.find((c: any) => c?.homeAway === "away") || comps[1];

const homeName = home?.team?.shortDisplayName || home?.team?.abbreviation || home?.team?.displayName || "HOME";
const awayName = away?.team?.shortDisplayName || away?.team?.abbreviation || away?.team?.displayName || "AWAY";
const homeScore = home?.score ?? "0";
const awayScore = away?.score ?? "0";

const line = `${homeName} ${homeScore} — ${awayName} ${awayScore} (${status})`;
return { line, status };
}

function formatScoreboardLines(board: any, max = 6): string[] {
const events = board?.events ?? [];
const lines: string[] = [];
for (const ev of events.slice(0, max)) {
const comp = ev?.competitions?.[0];
const comps = comp?.competitors || [];
const status = comp?.status?.type?.shortDetail || comp?.status?.type?.description || "Scheduled";
const home = comps.find((c: any) => c?.homeAway === "home") || comps[0];
const away = comps.find((c: any) => c?.homeAway === "away") || comps[1];
const homeName = home?.team?.abbreviation || home?.team?.shortDisplayName || home?.team?.displayName || "HOME";
const awayName = away?.team?.abbreviation || away?.team?.shortDisplayName || away?.team?.displayName || "AWAY";
const line = `${homeName} ${home?.score ?? 0} — ${awayName} ${away?.score ?? 0} (${status})`;
lines.push(line);
}
return lines;
}

// NOTE: We keep this tool untyped to bypass strict SDK Tool type requirements.
const espnRouterTool: any = {
name: "espnRouterTool",
description:
"Auto-detect sport (NFL, NCAA Men's CBB, NBA, MLB, NHL) and fetch live scoreboard or a specific game's summary from ESPN public JSON.",
parameters: {
type: "object",
properties: {
queryText: {
type: "string",
description:
"The user's question. Used to detect sport, intent, teams, and optionally an ESPN event id.",
},
},
required: ["queryText"],
},
execute: async ({ queryText }: RouterInput) => {
const qLC = queryText.toLowerCase();
const sport = detectSport(queryText);
if (!sport) {
return JSON.stringify({
ok: false,
reason:
"Could not detect sport. Mention a league/team or ask for 'today's scores'.",
});
}

const endpoints = ESPN_ENDPOINTS[sport];
const wantToday = wantsTodayScores(queryText);
const explicitId = extractNumericId(queryText);
const dateParam = extractEspnDate(queryText); // Use explicit date if provided

try {
if (explicitId) {
const sumUrl = endpoints.summary + explicitId;
const data = await httpGetJSON(sumUrl);
const leaders = extractLeaders(data, sport);
const pretty = formatScoreLineFromSummary(data);
return JSON.stringify({
ok: true,
provider: "ESPN (unofficial)",
mode: "summary_by_id",
sport,
event_id: explicitId,
url: sumUrl,
fetched_at: new Date().toISOString(),
summary_line: pretty.line,
leaders,
raw: data,
});
}

// If the user mentioned a date, use it; otherwise use today's scoreboard
let scoreboardUrl = endpoints.scoreboard;
if (dateParam && !wantToday) {
scoreboardUrl = `${endpoints.scoreboard}?dates=${dateParam}`;
}

const board = await httpGetJSON(scoreboardUrl);

if (wantToday && !dateParam) {
const lines = formatScoreboardLines(board);
return JSON.stringify({
ok: true,
provider: "ESPN (unofficial)",
mode: "scoreboard",
sport,
url: scoreboardUrl,
fetched_at: new Date().toISOString(),
lines,
raw: board,
});
}

const pick = pickBestGameByTeams(board, qLC);
if (pick.gameId && pick.matchScore > 0) {
const sumUrl = endpoints.summary + pick.gameId;
const data = await httpGetJSON(sumUrl);
const leaders = extractLeaders(data, sport);
const pretty = formatScoreLineFromSummary(data);
return JSON.stringify({
ok: true,
provider: "ESPN (unofficial)",
mode: "summary_by_match",
sport,
event_id: pick.gameId,
url: sumUrl,
fetched_at: new Date().toISOString(),
summary_line: pretty.line,
leaders,
raw: data,
});
}

const lines = formatScoreboardLines(board);
return JSON.stringify({
ok: true,
provider: "ESPN (unofficial)",
mode: "scoreboard_fallback",
sport,
url: scoreboardUrl,
fetched_at: new Date().toISOString(),
lines,
raw: board,
note: dateParam
? "No clear team match; returning that date's scoreboard."
: "No clear team match; returning today's scoreboard.",
});
} catch (err: any) {
return JSON.stringify({
ok: false,
provider: "ESPN (unofficial)",
error: err.message || String(err),
});
}
},
};

/* -------------------------------------------
3) AGENT
-------------------------------------------- */

const myAgent = new Agent({
name: "Sports Data Agent",
instructions: `
You are a sports data chatbot.

Use tools:
- Use 'espnRouterTool' FIRST for live scores or in-progress stats about NFL, NCAA Men's CBB, NBA, MLB, or NHL.
- If 'mode' is scoreboard, list 3–6 lines and add "…and more" if needed.
- If 'mode' is summary_by_id or summary_by_match, show a one-line score with status, then 1–3 leader bullets.
- Always include "Source: <URL> (ESPN, unofficial)".
- If ok=false or no data, say "No live data available from ESPN."

- Use 'webSearchPreview' for historical/news context only (restricted to nfl.com, espn.com, pro-football-reference.com).

Formatting:
- SINGLE GAME: "<HOME> <score> — <AWAY> <score> (<status>)"
Then 1–3 bullets like "• Passing: Mahomes — 245 Yds".
- SCOREBOARD: bullet list of lines; keep it tight.

Do not speculate or mix in other sites.
`,
model: "gpt-4.1",
tools: [webSearchPreview, espnRouterTool as any],
modelSettings: {
temperature: 0.3,
topP: 1,
maxTokens: 2048,
store: true,
},
});

type WorkflowInput = { input_as_text: string };

/* -------------------------------------------
4) MAIN ENTRYPOINT
-------------------------------------------- */

export const runWorkflow = async (workflow: WorkflowInput) => {
return await withTrace("sportsbot", async () => {
const conversationHistory: AgentInputItem[] = [
{
role: "user",
content: [{ type: "input_text", text: workflow.input_as_text }],
},
];

const runner = new Runner({
traceMetadata: {
__trace_source__: "agent-builder",
workflow_id: "wf_6913b519693c8190a7a1f4afcd996c190f938d08b82cbaf5",
},
});

const resultTemp = await runner.run(myAgent, [...conversationHistory]);
conversationHistory.push(...resultTemp.newItems.map((i) => i.rawItem));

if (!resultTemp.finalOutput) throw new Error("Agent result is undefined");
return { output_text: resultTemp.finalOutput ?? "" };
});
};
