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
    odds?: Array<{
      provider?: {
        id: string;
        name: string;
        priority: number;
        logos?: Array<{
          href: string;
          rel: string[];
        }>;
      };
      details?: string;
      overUnder?: number;
      spread?: number;
      moneyline?: {
        displayName?: string;
        shortDisplayName?: string;
        homeTeamOdds?: {
          favorite?: boolean;
          underdog?: boolean;
          moneyLine?: number;
          favoriteAtOpen?: boolean;
          close?: {
            odds?: string;
          };
        };
        awayTeamOdds?: {
          favorite?: boolean;
          underdog?: boolean;
          moneyLine?: number;
          favoriteAtOpen?: boolean;
          close?: {
            odds?: string;
          };
        };
      };
      pointSpread?: {
        displayName?: string;
        shortDisplayName?: string;
        home?: {
          close?: {
            line?: number;
            odds?: string;
          };
        };
        away?: {
          close?: {
            line?: number;
            odds?: string;
          };
        };
      };
      total?: {
        displayName?: string;
        shortDisplayName?: string;
        over?: {
          close?: {
            line?: number;
            odds?: string;
          };
        };
        under?: {
          close?: {
            line?: number;
            odds?: string;
          };
        };
      };
    }>;
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

export interface ESPNPlayer {
  id: string;
  uid: string;
  guid: string;
  alternateIds: {
    sdr: string;
  };
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  shortName: string;
  weight: number;
  displayWeight: string;
  height: number;
  displayHeight: string;
  age: number;
  dateOfBirth: string;
  debutYear?: number;
  links: Array<{
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText: string;
    isExternal: boolean;
    isPremium: boolean;
  }>;
  birthPlace?: {
    city: string;
    state: string;
    country: string;
  };
  college?: {
    id: string;
    guid: string;
    mascot: string;
    name: string;
    shortName: string;
    abbrev: string;
    logos: Array<{
      href: string;
      width: number;
      height: number;
      alt: string;
      rel: string[];
      lastUpdated: string;
    }>;
  };
  slug: string;
  headshot?: {
    href: string;
    alt: string;
  };
  jersey?: string;
  position: {
    id: string;
    name: string;
    displayName: string;
    abbreviation: string;
    leaf: boolean;
    parent?: {
      id: string;
      name: string;
      displayName: string;
      abbreviation: string;
      leaf: boolean;
    };
  };
  injuries: Array<{
    status: string;
    date: string;
  }>;
  teams: Array<{
    $ref: string;
  }>;
  contracts: unknown[];
  experience: {
    years: number;
  };
  status: {
    id: string;
    name: string;
    type: string;
    abbreviation: string;
  };
}

export interface ESPNTeamRosterResponse {
  team: ESPNTeam;
  coach: Array<{
    id: string;
    firstName: string;
    lastName: string;
    experience: number;
  }>;
  athletes: Array<{
    position: string;
    items: ESPNPlayer[];
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

// Player/Roster Functions
export async function getNFLTeamRoster(teamId: string): Promise<ESPNTeamRosterResponse> {
  return fetchESPN(`/football/nfl/teams/${teamId}/roster`) as Promise<ESPNTeamRosterResponse>;
}

export async function getNBATeamRoster(teamId: string): Promise<ESPNTeamRosterResponse> {
  return fetchESPN(`/basketball/nba/teams/${teamId}/roster`) as Promise<ESPNTeamRosterResponse>;
}

export async function getNCAATeamRoster(teamId: string, sport: 'football' | 'basketball'): Promise<ESPNTeamRosterResponse> {
  const league = sport === 'football' ? 'college-football' : 'mens-college-basketball';
  return fetchESPN(`/football/${league}/teams/${teamId}/roster`) as Promise<ESPNTeamRosterResponse>;
}

export async function getMLBTeamRoster(teamId: string): Promise<ESPNTeamRosterResponse> {
  return fetchESPN(`/baseball/mlb/teams/${teamId}/roster`) as Promise<ESPNTeamRosterResponse>;
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
  spreadOdds?: string;
  overUnder?: string;
  overUnderOdds?: string;
  homeMoneyLine?: string;
  awayMoneyLine?: string;
  provider?: string;
} | null {
  const competition = event.competitions[0];
  if (!competition?.odds || !competition.odds[0]) return null;

  const odds = competition.odds[0];
  const moneyline = odds.moneyline;

  return {
    spread: odds.details ? odds.details : undefined,
    spreadOdds: odds.pointSpread?.home?.close?.odds || odds.pointSpread?.away?.close?.odds || undefined,
    overUnder: odds.overUnder ? `O/U ${odds.overUnder}` : undefined,
    overUnderOdds: odds.total?.over?.close?.odds || odds.total?.under?.close?.odds || undefined,
    homeMoneyLine: moneyline?.homeTeamOdds?.close?.odds ? moneyline.homeTeamOdds.close.odds : undefined,
    awayMoneyLine: moneyline?.awayTeamOdds?.close?.odds ? moneyline.awayTeamOdds.close.odds : undefined,
    provider: odds.provider?.name || undefined,
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

// Player utility functions
export async function getAllNFLPlayers(): Promise<ESPNPlayer[]> {
  const teamsResponse = await getNFLTeams();
  const allPlayers: ESPNPlayer[] = [];

  for (const sport of teamsResponse.sports) {
    for (const league of sport.leagues) {
      for (const team of league.teams) {
        try {
          const roster = await getNFLTeamRoster(team.id);
          for (const athleteGroup of roster.athletes) {
            allPlayers.push(...athleteGroup.items);
          }
        } catch (error) {
          console.warn(`Failed to fetch roster for team ${team.id}:`, error);
        }
      }
    }
  }

  return allPlayers;
}

export async function getAllNBAPlayers(): Promise<ESPNPlayer[]> {
  const teamsResponse = await getNBATeams();
  const allPlayers: ESPNPlayer[] = [];

  for (const sport of teamsResponse.sports) {
    for (const league of sport.leagues) {
      for (const team of league.teams) {
        try {
          const roster = await getNBATeamRoster(team.id);
          for (const athleteGroup of roster.athletes) {
            allPlayers.push(...athleteGroup.items);
          }
        } catch (error) {
          console.warn(`Failed to fetch roster for team ${team.id}:`, error);
        }
      }
    }
  }

  return allPlayers;
}

export async function getAllNCAAPlayers(sport: 'football' | 'basketball'): Promise<ESPNPlayer[]> {
  const teamsResponse = sport === 'football' ? await getNCAAFootballTeams() : await getNCAABasketballTeams();
  const allPlayers: ESPNPlayer[] = [];

  for (const sportData of teamsResponse.sports) {
    for (const league of sportData.leagues) {
      for (const team of league.teams) {
        try {
          const roster = await getNCAATeamRoster(team.id, sport);
          for (const athleteGroup of roster.athletes) {
            allPlayers.push(...athleteGroup.items);
          }
        } catch (error) {
          console.warn(`Failed to fetch roster for team ${team.id}:`, error);
        }
      }
    }
  }

  return allPlayers;
}

export async function getAllMLBPlayers(): Promise<ESPNPlayer[]> {
  const teamsResponse = await getMLBTeams();
  const allPlayers: ESPNPlayer[] = [];

  for (const sport of teamsResponse.sports) {
    for (const league of sport.leagues) {
      for (const team of league.teams) {
        try {
          const roster = await getMLBTeamRoster(team.id);
          for (const athleteGroup of roster.athletes) {
            allPlayers.push(...athleteGroup.items);
          }
        } catch (error) {
          console.warn(`Failed to fetch roster for team ${team.id}:`, error);
        }
      }
    }
  }

  return allPlayers;
}
