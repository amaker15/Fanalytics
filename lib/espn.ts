// ESPN API integration for live sports data, scores, betting odds, and news

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';

// Types for ESPN API responses
export interface ESPNEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: {
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
    };
  };
  competitions: Array<{
    id: string;
    date: string;
    status: {
      type: {
        id: string;
        name: string;
        state: string;
        completed: boolean;
      };
    };
    competitors: Array<{
      id: string;
      name: string;
      abbreviation: string;
      displayName: string;
      logo?: string;
      score?: string;
      winner?: boolean;
      homeAway: string;
      team?: {
        id: string;
        name: string;
        abbreviation: string;
        displayName: string;
        logo?: string;
      };
    }>;
    venue?: {
      fullName: string;
      address?: {
        city: string;
        state: string;
      };
    };
    broadcasts?: Array<{
      names: string[];
    }>;
    odds?: {
      overUnder?: number;
      spread?: number;
      awayTeamOdds?: {
        moneyLine?: number;
        spreadOdds?: number;
      };
      homeTeamOdds?: {
        moneyLine?: number;
        spreadOdds?: number;
      };
    };
  }>;
}

export interface ESPNScoresResponse {
  leagues: Array<{
    id: string;
    name: string;
    abbreviation: string;
  }>;
  events: ESPNEvent[];
}

export interface ESPNTeam {
  id: string;
  name: string;
  abbreviation: string;
  displayName: string;
  logo: string;
  location: string;
  nickname: string;
  record?: {
    summary: string;
    items: Array<{
      summary: string;
      type: string;
    }>;
  };
  standingSummary?: string;
  rank?: number;
}

export interface ESPNTeamsResponse {
  sports: Array<{
    leagues: Array<{
      teams: ESPNTeam[];
    }>;
  }>;
}

export interface ESPNNewsItem {
  headline: string;
  description: string;
  published: string;
  images?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  links?: {
    web: {
      href: string;
    };
  };
}

export interface ESPNNewsResponse {
  header: string;
  articles: ESPNNewsItem[];
}

export interface ESPNRankingsResponse {
  rankings: Array<{
    name: string;
    shortName: string;
    rankings: Array<{
      rank: number;
      team: ESPNTeam;
      points?: number;
    }>;
  }>;
}

// Generic fetch function with error handling
async function fetchESPN(endpoint: string): Promise<unknown> {
  try {
    const response = await fetch(`${ESPN_BASE_URL}${endpoint}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Fanalytics/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`ESPN API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch from ESPN API: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ESPN API fetch error:', error);
    throw error;
  }
}

// NFL Functions
export async function getNFLScores(dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/football/nfl/scoreboard?dates=${dates}`
    : '/football/nfl/scoreboard';
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getNFLTeams(): Promise<ESPNTeamsResponse> {
  return fetchESPN('/football/nfl/teams') as Promise<ESPNTeamsResponse>;
}

export async function getNFLNews(): Promise<ESPNNewsResponse> {
  return fetchESPN('/football/nfl/news') as Promise<ESPNNewsResponse>;
}

export async function getNFLGameSummary(gameId: string): Promise<Record<string, unknown>> {
  return fetchESPN(`/football/nfl/summary?event=${gameId}`) as Promise<Record<string, unknown>>;
}

// NBA Functions
export async function getNBAScores(dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/basketball/nba/scoreboard?dates=${dates}`
    : '/basketball/nba/scoreboard';
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getNBATeams(): Promise<ESPNTeamsResponse> {
  return fetchESPN('/basketball/nba/teams') as Promise<ESPNTeamsResponse>;
}

export async function getNBANews(): Promise<ESPNNewsResponse> {
  return fetchESPN('/basketball/nba/news') as Promise<ESPNNewsResponse>;
}

export async function getNBAGameSummary(gameId: string): Promise<Record<string, unknown>> {
  return fetchESPN(`/basketball/nba/summary?event=${gameId}`) as Promise<Record<string, unknown>>;
}

// NCAA Football Functions
export async function getNCAAFootballScores(dates?: string, groups?: string): Promise<ESPNScoresResponse> {
  let endpoint = '/football/college-football/scoreboard';
  const params = new URLSearchParams();
  if (dates) params.append('dates', dates);
  if (groups) params.append('groups', groups);
  if (params.toString()) endpoint += `?${params.toString()}`;
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getNCAAFootballTeams(): Promise<ESPNTeamsResponse> {
  return fetchESPN('/football/college-football/teams') as Promise<ESPNTeamsResponse>;
}

export async function getNCAAFootballNews(): Promise<ESPNNewsResponse> {
  return fetchESPN('/football/college-football/news') as Promise<ESPNNewsResponse>;
}

export async function getNCAAFootballRankings(): Promise<ESPNRankingsResponse> {
  return fetchESPN('/football/college-football/rankings') as Promise<ESPNRankingsResponse>;
}

// NCAA Basketball Functions (Men's)
export async function getNCAABasketballScores(dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/basketball/mens-college-basketball/scoreboard?dates=${dates}`
    : '/basketball/mens-college-basketball/scoreboard';
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getNCAABasketballTeams(): Promise<ESPNTeamsResponse> {
  return fetchESPN('/basketball/mens-college-basketball/teams') as Promise<ESPNTeamsResponse>;
}

export async function getNCAABasketballNews(): Promise<ESPNNewsResponse> {
  return fetchESPN('/basketball/mens-college-basketball/news') as Promise<ESPNNewsResponse>;
}

// MLB Functions
export async function getMLBScores(dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/baseball/mlb/scoreboard?dates=${dates}`
    : '/baseball/mlb/scoreboard';
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getMLBTeams(): Promise<ESPNTeamsResponse> {
  return fetchESPN('/baseball/mlb/teams') as Promise<ESPNTeamsResponse>;
}

export async function getMLBNews(): Promise<ESPNNewsResponse> {
  return fetchESPN('/baseball/mlb/news') as Promise<ESPNNewsResponse>;
}

// NHL Functions
export async function getNHLScores(dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/hockey/nhl/scoreboard?dates=${dates}`
    : '/hockey/nhl/scoreboard';
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getNHLTeams(): Promise<ESPNTeamsResponse> {
  return fetchESPN('/hockey/nhl/teams') as Promise<ESPNTeamsResponse>;
}

export async function getNHLNews(): Promise<ESPNNewsResponse> {
  return fetchESPN('/hockey/nhl/news') as Promise<ESPNNewsResponse>;
}

// WNBA Functions
export async function getWNBAScores(dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/basketball/wnba/scoreboard?dates=${dates}`
    : '/basketball/wnba/scoreboard';
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getWNBATeams(): Promise<ESPNTeamsResponse> {
  return fetchESPN('/basketball/wnba/teams') as Promise<ESPNTeamsResponse>;
}

export async function getWNBANews(): Promise<ESPNNewsResponse> {
  return fetchESPN('/basketball/wnba/news') as Promise<ESPNNewsResponse>;
}

// Women's College Basketball Functions
export async function getWomensCollegeBasketballScores(dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/basketball/womens-college-basketball/scoreboard?dates=${dates}`
    : '/basketball/womens-college-basketball/scoreboard';
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getWomensCollegeBasketballTeams(): Promise<ESPNTeamsResponse> {
  return fetchESPN('/basketball/womens-college-basketball/teams') as Promise<ESPNTeamsResponse>;
}

export async function getWomensCollegeBasketballNews(): Promise<ESPNNewsResponse> {
  return fetchESPN('/basketball/womens-college-basketball/news') as Promise<ESPNNewsResponse>;
}

// College Baseball Functions
export async function getCollegeBaseballScores(dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/baseball/college-baseball/scoreboard?dates=${dates}`
    : '/baseball/college-baseball/scoreboard';
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

// Soccer Functions (General)
export async function getSoccerScores(league: string, dates?: string): Promise<ESPNScoresResponse> {
  const endpoint = dates
    ? `/soccer/${league}/scoreboard?dates=${dates}`
    : `/soccer/${league}/scoreboard`;
  return fetchESPN(endpoint) as Promise<ESPNScoresResponse>;
}

export async function getSoccerNews(league: string): Promise<ESPNNewsResponse> {
  return fetchESPN(`/soccer/${league}/news`) as Promise<ESPNNewsResponse>;
}

export async function getSoccerTeams(league: string): Promise<ESPNTeamsResponse> {
  return fetchESPN(`/soccer/${league}/teams`) as Promise<ESPNTeamsResponse>;
}

// Utility functions to format data for the app
export function formatGameStatus(event: ESPNEvent): string {
  const status = event.status.type;
  if (status.completed) return 'Final';
  if (status.state === 'in') return 'Live';
  if (status.state === 'pre') return 'Scheduled';

  // Parse date and format time
  const gameDate = new Date(event.date);
  const now = new Date();
  const diffMs = gameDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return 'Live';
  if (diffHours < 24) return `Today ${gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (diffHours < 48) return `Tomorrow ${gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

  return gameDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function getGameScore(event: ESPNEvent): { home: string; away: string } | null {
  const competition = event.competitions[0];
  if (!competition || !competition.competitors) return null;

  const home = competition.competitors.find(c => c.homeAway === 'home');
  const away = competition.competitors.find(c => c.homeAway === 'away');

  return {
    home: home?.score || '0',
    away: away?.score || '0'
  };
}

export function getBettingOdds(event: ESPNEvent): {
  spread?: string;
  overUnder?: string;
  homeMoneyLine?: string;
  awayMoneyLine?: string;
} | null {
  const competition = event.competitions[0];
  if (!competition?.odds) return null;

  const odds = competition.odds;
  return {
    spread: odds.spread ? `${odds.spread > 0 ? '+' : ''}${odds.spread}` : undefined,
    overUnder: odds.overUnder ? `${odds.overUnder}` : undefined,
    homeMoneyLine: odds.homeTeamOdds?.moneyLine ? `${odds.homeTeamOdds.moneyLine > 0 ? '+' : ''}${odds.homeTeamOdds.moneyLine}` : undefined,
    awayMoneyLine: odds.awayTeamOdds?.moneyLine ? `${odds.awayTeamOdds.moneyLine > 0 ? '+' : ''}${odds.awayTeamOdds.moneyLine}` : undefined,
  };
}

export function getGameVenue(event: ESPNEvent): string | null {
  const competition = event.competitions[0];
  if (!competition?.venue) return null;
  return competition.venue.fullName;
}

export function getGameBroadcast(event: ESPNEvent): string | null {
  const competition = event.competitions[0];
  if (!competition?.broadcasts || competition.broadcasts.length === 0) return null;
  return competition.broadcasts[0].names.join(', ');
}
