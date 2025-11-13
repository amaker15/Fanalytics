// Nebius API integration for AI-powered sports analysis

const NEBIUS_API_KEY = process.env.NEBIUS_API_KEY!;
const NEBIUS_BASE_URL = process.env.NEBIUS_BASE_URL!;

// Test function to check Nebius API connectivity
export async function testNebiusConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${NEBIUS_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${NEBIUS_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Nebius API connection test failed:', response.status, response.statusText);
      return false;
    }

    const data: ModelsResponse = await response.json();
    console.log('Nebius API connection successful. Available models:', data.data?.length || 0);

    // Log all Qwen models
    const qwenModels = data.data?.filter((model: ModelInfo) =>
      model.id?.toLowerCase().includes('qwen') ||
      model.name?.toLowerCase().includes('qwen')
    ) || [];

    console.log('Available Qwen models:', qwenModels.map((m: ModelInfo) => ({
      id: m.id,
      name: m.name,
      context_length: m.context_length
    })));

    return true;
  } catch (error) {
    console.error('Nebius API connection test error:', error);
    return false;
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}

interface ModelInfo {
  id: string;
  name: string;
  context_length?: number;
}

interface ModelsResponse {
  data: ModelInfo[];
}

type StatValue = string | number | undefined;
type StatsRecord = Record<string, StatValue>;

// Qwen model to use
const QWEN_MODEL = 'Qwen/Qwen3-235B-A22B-Thinking-2507';

// Baseball-Reference and Basketball-Reference scraping tools
async function getBaseballReferenceStats(year: number, statType: string = 'batting'): Promise<string> {
  try {
    // Call the Next.js API route that runs the Python scraper
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sports-reference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sport: 'baseball',
        year,
        statType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data || 'No data available';
  } catch (error) {
    console.error('Error fetching Baseball-Reference data:', error);
    return `Failed to retrieve Baseball-Reference data: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function getBasketballReferenceStats(year: number, statType: string = 'per_game'): Promise<string> {
  try {
    // Call the Next.js API route that runs the Python scraper
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sports-reference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sport: 'basketball',
        year,
        statType
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data || 'No data available';
  } catch (error) {
    console.error('Error fetching Basketball-Reference data:', error);
    return `Failed to retrieve Basketball-Reference data: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Test tool calling functionality
export async function testToolCalling(): Promise<{ supported: boolean; testResult?: string; error?: string }> {
  try {
    console.log('Testing tool calling support...');

    const toolCallingSupported = await checkToolCallingSupport();

    if (!toolCallingSupported) {
      return {
        supported: false,
        error: 'Tool calling not supported by Nebius API'
      };
    }

    // Test a simple tool call
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a sports analyst with access to ESPN data. Use the get_team_stats tool to get current information about teams.'
      },
      {
        role: 'user',
        content: 'Get stats for the Kansas City Chiefs'
      }
    ];

    const response = await fetch(`${NEBIUS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEBIUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages,
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 500,
        tools: ESPN_TOOLS,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        supported: false,
        error: `API Error: ${response.status} - ${errorText}`
      };
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return {
        supported: false,
        error: 'Invalid API response format'
      };
    }

    const message = data.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('Tool calling test successful - AI requested tools');
      return {
        supported: true,
        testResult: `Tool calling works! AI requested ${message.tool_calls.length} tool(s): ${message.tool_calls.map((tc: ToolCall) => tc.function.name).join(', ')}`
      };
    } else {
      return {
        supported: true,
        testResult: 'Tool calling supported but AI did not request tools in this test case'
      };
    }

  } catch (error) {
    console.error('Tool calling test failed:', error);
    return {
      supported: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Check if Nebius API supports tool calling
let supportsToolCalling: boolean | null = null;

async function checkToolCallingSupport(): Promise<boolean> {
  if (supportsToolCalling !== null) {
    return supportsToolCalling;
  }

  try {
    const response = await fetch(`${NEBIUS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEBIUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [{ role: 'user', content: 'Test' }],
        tools: [],
        max_tokens: 1
      }),
    });

    // If we get a 200 response or a validation error (not 404/500), tools are supported
    supportsToolCalling = response.status === 200 || response.status === 400;
    return supportsToolCalling;
  } catch (error) {
    console.warn('Error checking tool calling support:', error);
    supportsToolCalling = false;
    return false;
  }
}

// Tool definitions for ESPN API access
const ESPN_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_team_stats',
      description: 'Get current season statistics for a specific team',
      parameters: {
        type: 'object',
        properties: {
          sport: {
            type: 'string',
            enum: ['football', 'basketball', 'baseball'],
            description: 'The sport (football for NFL, basketball for NBA, baseball for MLB)'
          },
          league: {
            type: 'string',
            enum: ['nfl', 'nba', 'mlb', 'college-football', 'mens-college-basketball'],
            description: 'The specific league'
          },
          team_name: {
            type: 'string',
            description: 'The team name to search for (e.g., "Chiefs", "Lakers", "Yankees")'
          }
        },
        required: ['sport', 'league', 'team_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_player_stats',
      description: 'Get statistics for a specific player',
      parameters: {
        type: 'object',
        properties: {
          sport: {
            type: 'string',
            enum: ['football', 'basketball', 'baseball'],
            description: 'The sport (football for NFL, basketball for NBA, baseball for MLB)'
          },
          league: {
            type: 'string',
            enum: ['nfl', 'nba', 'mlb', 'college-football', 'mens-college-basketball'],
            description: 'The specific league'
          },
          player_name: {
            type: 'string',
            description: 'The player name to search for (e.g., "Patrick Mahomes", "LeBron James")'
          }
        },
        required: ['sport', 'league', 'player_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_games',
      description: 'Get recent game results for a team or league',
      parameters: {
        type: 'object',
        properties: {
          sport: {
            type: 'string',
            enum: ['football', 'basketball', 'baseball'],
            description: 'The sport (football for NFL, basketball for NBA, baseball for MLB)'
          },
          league: {
            type: 'string',
            enum: ['nfl', 'nba', 'mlb', 'college-football', 'mens-college-basketball'],
            description: 'The specific league'
          },
          team_name: {
            type: 'string',
            description: 'Optional: Specific team name to get games for'
          },
          limit: {
            type: 'number',
            description: 'Number of recent games to retrieve (default: 5)',
            default: 5
          }
        },
        required: ['sport', 'league']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_league_standings',
      description: 'Get current league standings',
      parameters: {
        type: 'object',
        properties: {
          sport: {
            type: 'string',
            enum: ['football', 'basketball', 'baseball'],
            description: 'The sport (football for NFL, basketball for NBA, baseball for MLB)'
          },
          league: {
            type: 'string',
            enum: ['nfl', 'nba', 'mlb', 'college-football', 'mens-college-basketball'],
            description: 'The specific league'
          }
        },
        required: ['sport', 'league']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_baseball_reference_stats',
      description: 'Get historical baseball statistics from Baseball-Reference.com',
      parameters: {
        type: 'object',
        properties: {
          year: {
            type: 'number',
            description: 'The season year (e.g., 2023, 2024)'
          },
          stat_type: {
            type: 'string',
            enum: ['batting', 'pitching', 'fielding'],
            description: 'Type of statistics to retrieve',
            default: 'batting'
          }
        },
        required: ['year']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_basketball_reference_stats',
      description: 'Get historical basketball statistics from Basketball-Reference.com',
      parameters: {
        type: 'object',
        properties: {
          year: {
            type: 'number',
            description: 'The season year (e.g., 2023, 2024)'
          },
          stat_type: {
            type: 'string',
            enum: ['per_game', 'totals', 'advanced', 'standings'],
            description: 'Type of statistics to retrieve',
            default: 'per_game'
          }
        },
        required: ['year']
      }
    }
  }
];

// Tool execution functions
async function executeTool(toolCall: ToolCall): Promise<string> {
  const { name, arguments: args } = toolCall.function;
  const params = JSON.parse(args) as { sport?: string; league?: string; team_name?: string; player_name?: string; limit?: number; year?: number; stat_type?: string };

  try {
    switch (name) {
      case 'get_team_stats':
        return await getTeamStats(params.sport!, params.league!, params.team_name!);
      case 'get_player_stats':
        return await getPlayerStats(params.sport!, params.league!, params.player_name!);
      case 'get_recent_games':
        return await getRecentGames(params.sport!, params.league!, params.team_name, params.limit || 5);
      case 'get_league_standings':
        return await getLeagueStandings(params.sport!, params.league!);
      case 'get_baseball_reference_stats':
        return await getBaseballReferenceStats(params.year!, params.stat_type || 'batting');
      case 'get_basketball_reference_stats':
        return await getBasketballReferenceStats(params.year!, params.stat_type || 'per_game');
      default:
        return `Unknown tool: ${name}`;
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return `Error retrieving ${name} data: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// ESPN API tool implementations
async function getTeamStats(sport: string, league: string, teamName: string): Promise<string> {
  try {
    // Import ESPN functions dynamically to avoid circular imports
    const { getNFLTeams, getNBATeams, getMLBTeams, getNCAAFootballTeams, getNCAABasketballTeams } = await import('./espn');

    let teams: unknown[] = [];

    switch (league) {
      case 'nfl':
        const nflData = await getNFLTeams();
        teams = nflData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      case 'nba':
        const nbaData = await getNBATeams();
        teams = nbaData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      case 'mlb':
        const mlbData = await getMLBTeams();
        teams = mlbData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      case 'college-football':
        const cfData = await getNCAAFootballTeams();
        teams = cfData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      case 'mens-college-basketball':
        const cbData = await getNCAABasketballTeams();
        teams = cbData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      default:
        return `Unknown league: ${league}`;
    }

    // Find team by name (case-insensitive partial match)
    const team = teams.find((t: unknown) => {
      const teamObj = t as { displayName?: string; name?: string; nickname?: string };
      return teamObj.displayName?.toLowerCase().includes(teamName.toLowerCase()) ||
             teamObj.name?.toLowerCase().includes(teamName.toLowerCase()) ||
             teamObj.nickname?.toLowerCase().includes(teamName.toLowerCase());
    });

    if (!team) {
      return `Team "${teamName}" not found in ${league.toUpperCase()}.`;
    }

    // Format team stats
    const teamObj = team as { displayName?: string; name?: string; record?: { summary?: string }; rank?: unknown; location?: string; nickname?: string };
    const stats = {
      name: teamObj.displayName || teamObj.name,
      record: teamObj.record?.summary || 'No record available',
      rank: teamObj.rank || 'Unranked',
      location: teamObj.location,
      nickname: teamObj.nickname
    };

    return `Team: ${stats.name}
Location: ${stats.location}
Record: ${stats.record}
Rank: ${stats.rank}`;

  } catch (error) {
    console.error('Error in getTeamStats:', error);
    return `Failed to retrieve team stats for ${teamName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function getPlayerStats(sport: string, league: string, playerName: string): Promise<string> {
  try {
    // Import ESPN functions dynamically
    const { getAllNFLPlayers, getAllNBAPlayers, getAllNCAAPlayers, getAllMLBPlayers } = await import('./espn');

    let players: unknown[] = [];

    switch (league) {
      case 'nfl':
        players = await getAllNFLPlayers();
        break;
      case 'nba':
        players = await getAllNBAPlayers();
        break;
      case 'mlb':
        players = await getAllMLBPlayers();
        break;
      case 'college-football':
        players = await getAllNCAAPlayers('football');
        break;
      case 'mens-college-basketball':
        players = await getAllNCAAPlayers('basketball');
        break;
      default:
        return `Unknown league: ${league}`;
    }

    // Find player by name (case-insensitive partial match)
    const player = players.find((p: unknown) => {
      const playerObj = p as { displayName?: string; fullName?: string };
      return playerObj.displayName?.toLowerCase().includes(playerName.toLowerCase()) ||
             playerObj.fullName?.toLowerCase().includes(playerName.toLowerCase());
    });

    if (!player) {
      return `Player "${playerName}" not found in ${league.toUpperCase()}.`;
    }

    // Format player stats
    const playerObj = player as { displayName?: string; fullName?: string; position?: { displayName?: string }; age?: unknown; displayHeight?: string; displayWeight?: unknown; experience?: { years?: number }; jersey?: unknown };
    const stats = {
      name: playerObj.displayName || playerObj.fullName,
      position: playerObj.position?.displayName || 'Unknown',
      age: playerObj.age || 'Unknown',
      height: playerObj.displayHeight || 'Unknown',
      weight: playerObj.displayWeight || 'Unknown',
      experience: playerObj.experience?.years ? `${playerObj.experience.years} years` : 'Rookie',
      jersey: playerObj.jersey || 'Unknown'
    };

    return `Player: ${stats.name}
Position: ${stats.position}
Age: ${stats.age}
Height: ${stats.height}
Weight: ${stats.weight}
Experience: ${stats.experience}
Jersey: ${stats.jersey}`;

  } catch (error) {
    console.error('Error in getPlayerStats:', error);
    return `Failed to retrieve player stats for ${playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function getRecentGames(sport: string, league: string, teamName?: string, limit: number = 5): Promise<string> {
  try {
    // Import ESPN functions dynamically
    const { getNFLScores, getNBAScores, getMLBScores, getNCAAFootballScores, getNCAABasketballScores } = await import('./espn');

    let dateRange = '';
    if (sport === 'football' && league === 'nfl') {
      // Get current NFL week
      const currentWeek = Math.floor((new Date().getTime() - new Date(2025, 7, 29).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      const weekStart = new Date(2025, 7, 29 + (currentWeek - 1) * 7);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      dateRange = `${weekStart.toISOString().split('T')[0]}-${weekEnd.toISOString().split('T')[0]}`;
    }

    let games: unknown[] = [];

    switch (league) {
      case 'nfl':
        const nflGames = await getNFLScores(dateRange);
        games = nflGames.events || [];
        break;
      case 'nba':
        // NBA uses week ranges, get current week
        const nbaWeek = Math.floor((new Date().getTime() - new Date(2025, 8, 22).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        const nbaStart = new Date(2025, 8, 22 + (nbaWeek - 1) * 7);
        const nbaEnd = new Date(nbaStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        const nbaRange = `${nbaStart.toISOString().split('T')[0]}-${nbaEnd.toISOString().split('T')[0]}`;
        const nbaGames = await getNBAScores(nbaRange);
        games = nbaGames.events || [];
        break;
      case 'mlb':
        // MLB uses day ranges, get current day
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const mlbRange = `${yesterday.toISOString().split('T')[0]}-${today.toISOString().split('T')[0]}`;
        const mlbGames = await getMLBScores(mlbRange);
        games = mlbGames.events || [];
        break;
      case 'college-football':
        const cfWeek = Math.floor((new Date().getTime() - new Date(2025, 6, 29).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        const cfStart = new Date(2025, 6, 29 + (cfWeek - 1) * 7);
        const cfEnd = new Date(cfStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        const cfRange = `${cfStart.toISOString().split('T')[0]}-${cfEnd.toISOString().split('T')[0]}`;
        const cfGames = await getNCAAFootballScores(cfRange);
        games = cfGames.events || [];
        break;
      case 'mens-college-basketball':
        // NCAA Basketball uses today only
        const todayStr = new Date().toISOString().split('T')[0];
        const cbGames = await getNCAABasketballScores(todayStr);
        games = cbGames.events || [];
        break;
      default:
        return `Unknown league: ${league}`;
    }

    // Filter games if team specified
    if (teamName) {
      games = games.filter((game: unknown) => {
        const gameObj = game as { competitions?: Array<{ competitors?: Array<{ homeAway?: string; team?: { displayName?: string } }> }> };
        const homeTeam = gameObj.competitions?.[0]?.competitors?.find((c: unknown) => (c as { homeAway?: string }).homeAway === 'home')?.team?.displayName;
        const awayTeam = gameObj.competitions?.[0]?.competitors?.find((c: unknown) => (c as { homeAway?: string }).homeAway === 'away')?.team?.displayName;
        return homeTeam?.toLowerCase().includes(teamName.toLowerCase()) ||
               awayTeam?.toLowerCase().includes(teamName.toLowerCase());
      });
    }

    // Take only the requested number of games
    const recentGames = games.slice(0, limit);

    if (recentGames.length === 0) {
      return `No recent games found for ${league.toUpperCase()}${teamName ? ` (${teamName})` : ''}.`;
    }

    let result = `Recent ${league.toUpperCase()} Games:\n\n`;
    recentGames.forEach((game: unknown, index: number) => {
      const gameObj = game as { competitions?: Array<{ competitors?: Array<{ homeAway?: string; team?: { displayName?: string }; score?: string }> }>; status?: { type?: { description?: string } } };
      const homeTeam = gameObj.competitions?.[0]?.competitors?.find((c: unknown) => (c as { homeAway?: string }).homeAway === 'home')?.team?.displayName;
      const awayTeam = gameObj.competitions?.[0]?.competitors?.find((c: unknown) => (c as { homeAway?: string }).homeAway === 'away')?.team?.displayName;
      const homeScore = gameObj.competitions?.[0]?.competitors?.find((c: unknown) => (c as { homeAway?: string }).homeAway === 'home')?.score;
      const awayScore = gameObj.competitions?.[0]?.competitors?.find((c: unknown) => (c as { homeAway?: string }).homeAway === 'away')?.score;
      const status = gameObj.status?.type?.description || 'Unknown';

      result += `${index + 1}. ${awayTeam} ${awayScore || 'vs'} ${homeTeam} ${homeScore || ''} (${status})\n`;
    });

    return result;

  } catch (error) {
    console.error('Error in getRecentGames:', error);
    return `Failed to retrieve recent games: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function getLeagueStandings(sport: string, league: string): Promise<string> {
  try {
    // Import ESPN functions dynamically
    const { getNFLTeams, getNBATeams, getMLBTeams, getNCAAFootballTeams, getNCAABasketballTeams } = await import('./espn');

    let teams: unknown[] = [];

    switch (league) {
      case 'nfl':
        const nflData = await getNFLTeams();
        teams = nflData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      case 'nba':
        const nbaData = await getNBATeams();
        teams = nbaData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      case 'mlb':
        const mlbData = await getMLBTeams();
        teams = mlbData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      case 'college-football':
        const cfData = await getNCAAFootballTeams();
        teams = cfData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      case 'mens-college-basketball':
        const cbData = await getNCAABasketballTeams();
        teams = cbData.sports?.[0]?.leagues?.[0]?.teams?.map((item: unknown) => (item as { team: unknown }).team) || [];
        break;
      default:
        return `Unknown league: ${league}`;
    }

    // Sort teams by record (this is a simple implementation)
    const sortedTeams = teams
      .filter((team: unknown) => {
        const teamObj = team as { record?: { summary?: string } };
        return teamObj.record?.summary;
      })
      .sort((a: unknown, b: unknown) => {
        const teamA = a as { record?: { summary?: string } };
        const teamB = b as { record?: { summary?: string } };
        // Simple sorting - in a real implementation, you'd parse the record properly
        const summaryA = teamA.record?.summary || '';
        const summaryB = teamB.record?.summary || '';
        return summaryA > summaryB ? -1 : 1;
      })
      .slice(0, 10); // Top 10

    if (sortedTeams.length === 0) {
      return `No standings data available for ${league.toUpperCase()}.`;
    }

    let result = `${league.toUpperCase()} Standings:\n\n`;
    sortedTeams.forEach((team: unknown, index: number) => {
      const teamObj = team as { displayName?: string; name?: string; record?: { summary?: string } };
      result += `${index + 1}. ${teamObj.displayName || teamObj.name} - ${teamObj.record?.summary || 'No record'}\n`;
    });

    return result;

  } catch (error) {
    console.error('Error in getLeagueStandings:', error);
    return `Failed to retrieve league standings: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function getAISportsAnalysis(
  sport: string,
  type: 'teams' | 'players',
  selection1: string,
  selection2: string,
  stats1: StatsRecord,
  stats2: StatsRecord,
  debugMode: boolean = false
): Promise<string> {
  try {
    // Check if tool calling is supported
    const toolCallingSupported = await checkToolCallingSupport();

    const systemPrompt = toolCallingSupported
      ? `You are a professional sports analyst providing expert analysis for ${sport}. You have access to current ESPN data and historical Baseball-Reference/Basketball-Reference statistics through tools. When analyzing teams or players, use the available tools to get up-to-date statistics, recent performance, league standings, and historical context to provide the most accurate analysis.

Compare the two ${type} provided and give detailed insights about their performance, strengths, weaknesses, and prediction for a matchup. Keep the analysis concise but informative, around 200-300 words. Use plain text only - no markdown, no bold, no special formatting, no asterisks. Structure your response with clear section labels like "Performance Comparison:", "Key Strengths:", "Critical Weaknesses:", and "Prediction:".

Use the available tools to gather current data and historical context before providing your analysis. For baseball analysis, you can access historical batting/pitching/fielding stats. For basketball analysis, you can access historical per-game, totals, advanced stats, and standings.`
      : `You are a professional sports analyst providing expert analysis for ${sport}. Compare the two ${type} provided and give detailed insights about their performance, strengths, weaknesses, and prediction for a matchup. Keep the analysis concise but informative, around 200-300 words. Use plain text only - no markdown, no bold, no special formatting, no asterisks. Structure your response with clear section labels like "Performance Comparison:", "Key Strengths:", "Critical Weaknesses:", and "Prediction:".`;

    const userPrompt = generateComparisonPrompt(sport, type, selection1, selection2, stats1, stats2);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    if (toolCallingSupported) {
      console.log(`Using Qwen model with tool calling: ${QWEN_MODEL}`);
      if (debugMode) {
        console.log('Available tools:', ESPN_TOOLS.map(t => t.function.name));
      }
    } else {
      console.log(`Using Qwen model without tool calling: ${QWEN_MODEL}`);
    }

    const maxIterations = toolCallingSupported ? 5 : 1; // Only 1 iteration if no tools
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      const requestBody: Record<string, unknown> = {
        model: QWEN_MODEL,
        messages,
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 800,
      };

      // Only add tools if supported
      if (toolCallingSupported) {
        requestBody.tools = ESPN_TOOLS;
        requestBody.tool_choice = iteration === 1 ? 'auto' : 'none';
      }

      const response = await fetch(`${NEBIUS_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NEBIUS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nebius API Error:', {
        status: response.status,
        statusText: response.statusText,
        response: errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Nebius API response format');
      throw new Error('Invalid API response format');
    }

      const message = data.choices[0].message;

      // Check if the AI wants to use tools (only if tools are supported)
      if (toolCallingSupported && message.tool_calls && message.tool_calls.length > 0) {
        console.log(`AI requested ${message.tool_calls.length} tool(s)`);

        if (debugMode) {
          message.tool_calls.forEach((toolCall: ToolCall, index: number) => {
            console.log(`Tool ${index + 1}: ${toolCall.function.name}`, JSON.parse(toolCall.function.arguments));
          });
        }

        // Add the assistant's message to conversation
        messages.push(message);

        // Execute each tool call
        for (const toolCall of message.tool_calls) {
          try {
            const toolResult = await executeTool(toolCall);
            console.log(`Tool ${toolCall.function.name} executed successfully`);

            if (debugMode) {
              console.log(`Tool result (${toolCall.function.name}):`, toolResult.substring(0, 200) + '...');
            }

            // Add tool result to conversation
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: toolResult
            });
          } catch (toolError) {
            console.error(`Tool execution failed:`, toolError);
            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: `Error executing tool: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`
            });
          }
        }

        // Continue the conversation with tool results
        continue;
      } else {
        // AI provided final answer
        const iterationInfo = toolCallingSupported ? ` (after ${iteration} iterations)` : '';
        console.log(`Success with Qwen model: ${QWEN_MODEL}${iterationInfo}`);

        if (debugMode) {
          console.log('Final AI response:', message.content.substring(0, 300) + '...');
        }

        return message.content;
      }
    }

    // If we exceeded max iterations, return what we have
    console.warn('Reached maximum tool calling iterations');
    return 'Analysis completed with available data.';

  } catch (error) {
    console.error('Qwen AI Analysis Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      sport,
      type,
      selection1,
      selection2
    });

    // Log to user-visible console for debugging
    if (typeof window !== 'undefined') {
      console.warn('AI Analysis failed - using fallback analysis. Check console for details.');
    }

    // Fallback to basic comparison if API fails
    return generateFallbackAnalysis(sport, type, selection1, selection2, stats1, stats2);
  }
}

function generateComparisonPrompt(
  sport: string,
  type: 'teams' | 'players',
  selection1: string,
  selection2: string,
  stats1: StatsRecord,
  stats2: StatsRecord
): string {
  let prompt = `Compare ${selection1} vs ${selection2} in ${sport}:\n\n`;

  if (type === 'teams') {
    prompt += `${selection1} Stats:\n`;
    Object.entries(stats1).forEach(([key, value]) => {
      prompt += `${key}: ${value}\n`;
    });

    prompt += `\n${selection2} Stats:\n`;
    Object.entries(stats2).forEach(([key, value]) => {
      prompt += `${key}: ${value}\n`;
    });
  } else {
    // Player comparison
    prompt += `${selection1} (${stats1.team}):\n`;
    Object.entries(stats1).forEach(([key, value]) => {
      if (key !== 'team') {
        prompt += `${key}: ${value}\n`;
      }
    });

    prompt += `\n${selection2} (${stats2.team}):\n`;
    Object.entries(stats2).forEach(([key, value]) => {
      if (key !== 'team') {
        prompt += `${key}: ${value}\n`;
      }
    });
  }

  prompt += '\nProvide a detailed analysis comparing their performance, strengths, weaknesses, and prediction for a head-to-head matchup.';

  return prompt;
}

function generateFallbackAnalysis(
  sport: string,
  type: 'teams' | 'players',
  selection1: string,
  selection2: string,
  stats1: StatsRecord,
  stats2: StatsRecord
): string {
  // Generate a more detailed fallback analysis using the actual stats
  let analysis = `**AI Analysis: ${selection1} vs ${selection2}**\n\n`;

  if (type === 'teams') {
    analysis += `*AI service temporarily unavailable. Here's a data-driven comparison:*\n\n`;
    analysis += `**${selection1} Stats:**\n`;
    Object.entries(stats1).forEach(([key, value]) => {
      analysis += `- ${key}: ${value}\n`;
    });

    analysis += `\n**${selection2} Stats:**\n`;
    Object.entries(stats2).forEach(([key, value]) => {
      analysis += `- ${key}: ${value}\n`;
    });
  } else {
    analysis += `*AI service temporarily unavailable. Here's a player comparison:*\n\n`;
    analysis += `**${selection1}:**\n`;
    Object.entries(stats1).forEach(([key, value]) => {
      if (key !== 'team') {
        analysis += `- ${key}: ${value}\n`;
      }
    });

    analysis += `\n**${selection2}:**\n`;
    Object.entries(stats2).forEach(([key, value]) => {
      if (key !== 'team') {
        analysis += `- ${key}: ${value}\n`;
      }
    });
  }

  analysis += `\n*Please try again later for AI-powered insights.*`;

  return analysis;
}
