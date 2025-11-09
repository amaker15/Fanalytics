'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Menu, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import SportsNavigation from '@/components/sports-navigation';
import { getAISportsAnalysis } from '@/lib/nebius';
import {
  getNCAABasketballScores,
  getNCAABasketballTeams,
  getNCAABasketballNews,
  getAllNCAAPlayers,
  ESPNEvent,
  ESPNTeam,
  ESPNPlayer,
  formatGameStatus,
  getGameScore,
  getBettingOdds,
  getGameVenue,
  getGameBroadcast
} from '@/lib/espn';

// Sample NCAA Basketball game data
const ncaaBasketballGamesData = {
  1: [
    {
      date: 'Mon, Nov 4',
      games: [
        {
          awayTeam: 'Duke Blue Devils',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/150.png',
          awaySpread: '-8.5',
          homeTeam: 'UNC Tar Heels',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/153.png',
          homeSpread: '',
          total: 'T:155.5',
          time: '7:00 PM',
        },
        {
          awayTeam: 'Kentucky Wildcats',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/96.png',
          awaySpread: '',
          homeTeam: 'Tennessee Volunteers',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png',
          homeSpread: '-6.5',
          total: 'T:148.5',
          time: '9:00 PM',
        },
      ],
    },
    {
      date: 'Tue, Nov 5',
      games: [
        {
          awayTeam: 'UCLA Bruins',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/26.png',
          awaySpread: '-4.5',
          homeTeam: 'USC Trojans',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png',
          homeSpread: '',
          total: 'T:152.5',
          time: '10:00 PM',
        },
        {
          awayTeam: 'Kansas Jayhawks',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png',
          awaySpread: '-7.5',
          homeTeam: 'Texas Longhorns',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/251.png',
          homeSpread: '',
          total: 'T:149.5',
          time: '8:00 PM',
        },
      ],
    },
  ],
  2: [
    {
      date: 'Wed, Nov 6',
      games: [
        {
          awayTeam: 'Villanova Wildcats',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/222.png',
          awaySpread: '',
          homeTeam: 'Connecticut Huskies',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/41.png',
          homeSpread: '-5.5',
          total: 'T:142.5',
          time: '7:00 PM',
        },
        {
          awayTeam: 'Michigan State Spartans',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png',
          awaySpread: '-3.5',
          homeTeam: 'Ohio State Buckeyes',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png',
          homeSpread: '',
          total: 'T:151.5',
          time: '8:30 PM',
        },
      ],
    },
  ],
};

// NCAA Basketball Team stats data (2024-2025 Season - Updated January 2025)
const ncaaBasketballTeamStats = {
  'Houston Cougars': { wins: 16, losses: 1, pointsPerGame: 88.4, pointsAllowed: 68.7, rank: 1 },
  'Duke Blue Devils': { wins: 15, losses: 2, pointsPerGame: 87.2, pointsAllowed: 71.6, rank: 2 },
  'Auburn Tigers': { wins: 14, losses: 3, pointsPerGame: 84.8, pointsAllowed: 70.2, rank: 3 },
  'Tennessee Volunteers': { wins: 13, losses: 4, pointsPerGame: 82.9, pointsAllowed: 72.1, rank: 4 },
  'UCLA Bruins': { wins: 12, losses: 5, pointsPerGame: 80.6, pointsAllowed: 69.8, rank: 5 },
  'Purdue Boilermakers': { wins: 13, losses: 4, pointsPerGame: 83.7, pointsAllowed: 72.8, rank: 6 },
  'Arizona Wildcats': { wins: 11, losses: 6, pointsPerGame: 81.4, pointsAllowed: 74.9, rank: 7 },
  'Baylor Bears': { wins: 12, losses: 5, pointsPerGame: 79.2, pointsAllowed: 68.7, rank: 8 },
  'Marquette Golden Eagles': { wins: 11, losses: 6, pointsPerGame: 77.8, pointsAllowed: 71.9, rank: 9 },
  'Florida Gators': { wins: 12, losses: 5, pointsPerGame: 76.4, pointsAllowed: 69.1, rank: 10 },
  'Texas Tech Red Raiders': { wins: 10, losses: 7, pointsPerGame: 74.8, pointsAllowed: 71.6, rank: 11 },
  'USC Trojans': { wins: 11, losses: 6, pointsPerGame: 75.2, pointsAllowed: 72.4, rank: 12 },
  'Kentucky Wildcats': { wins: 10, losses: 7, pointsPerGame: 78.6, pointsAllowed: 73.8, rank: 13 },
  'Kansas Jayhawks': { wins: 9, losses: 8, pointsPerGame: 77.2, pointsAllowed: 74.7, rank: 14 },
  'UNC Tar Heels': { wins: 9, losses: 8, pointsPerGame: 75.8, pointsAllowed: 75.9, rank: 15 },
};

// NCAA Basketball Player stats data (2024-2025 Season - Updated January 2025)
const ncaaBasketballPlayerStats = {
  'Reed Sheppard': {
    team: 'Kentucky Wildcats',
    position: 'PG',
    pointsPerGame: 18.2,
    rebounds: 4.8,
    assists: 7.1,
    efficiency: 25.6,
  },
  'Isaiah Collier': {
    team: 'USC Trojans',
    position: 'PG',
    pointsPerGame: 21.4,
    rebounds: 4.2,
    assists: 6.8,
    efficiency: 26.9,
  },
  'Rob Dillingham': {
    team: 'Kentucky Wildcats',
    position: 'PG',
    pointsPerGame: 19.8,
    rebounds: 3.6,
    assists: 5.4,
    efficiency: 24.7,
  },
  'Zion Williamson': {
    team: 'Duke Blue Devils',
    position: 'PF',
    pointsPerGame: 24.2,
    rebounds: 9.4,
    assists: 2.8,
    efficiency: 29.8,
  },
  'Tristan da Silva': {
    team: 'Colorado Buffaloes',
    position: 'PF',
    pointsPerGame: 22.6,
    rebounds: 9.1,
    assists: 2.9,
    efficiency: 28.7,
  },
  'RJ Barrett': {
    team: 'Duke Blue Devils',
    position: 'SF',
    pointsPerGame: 23.8,
    rebounds: 7.4,
    assists: 4.9,
    efficiency: 27.6,
  },
  'Paolo Banchero': {
    team: 'Duke Blue Devils',
    position: 'PF',
    pointsPerGame: 18.6,
    rebounds: 7.8,
    assists: 3.9,
    efficiency: 26.4,
  },
  'Cade Cunningham': {
    team: 'Ohio State Buckeyes',
    position: 'PG',
    pointsPerGame: 21.3,
    rebounds: 6.8,
    assists: 5.2,
    efficiency: 28.1,
  },
  'Jalen Brown': {
    team: 'Houston Cougars',
    position: 'SG',
    pointsPerGame: 20.7,
    rebounds: 5.4,
    assists: 3.8,
    efficiency: 25.9,
  },
  'Jared McCain': {
    team: 'Duke Blue Devils',
    position: 'PG',
    pointsPerGame: 17.9,
    rebounds: 4.1,
    assists: 4.7,
    efficiency: 24.3,
  },
};

export default function NCAABasketball() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [comparisonType, setComparisonType] = useState<'teams' | 'players'>('teams');
  const [firstSelection, setFirstSelection] = useState('');
  const [secondSelection, setSecondSelection] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ESPN API data state
  const [games, setGames] = useState<ESPNEvent[]>([]);
  const [teams, setTeams] = useState<ESPNTeam[]>([]);
  const [players, setPlayers] = useState<ESPNPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weeks = Array.from({ length: 35 }, (_, i) => i + 1);

  // Fetch NCAA Basketball data from ESPN API
  useEffect(() => {
    const fetchNCAABasketballData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get games for today (NCAA Basketball API doesn't support date ranges)
        const today = new Date();
        const dateRange = today.toISOString().split('T')[0].replace(/-/g, '');

        const scoresResponse = await getNCAABasketballScores(dateRange);
        const teamsResponse = await getNCAABasketballTeams();

        setGames(scoresResponse.events || []);
        setTeams(teamsResponse.sports?.[0]?.leagues?.[0]?.teams || []);
      } catch (err) {
        console.error('Failed to fetch NCAA Basketball data:', err);
        setError('Failed to load NCAA Basketball data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNCAABasketballData();
  }, []); // Only fetch once on component mount

  // Fetch players only when switching to player comparison mode
  useEffect(() => {
    const fetchPlayers = async () => {
      if (comparisonType === 'players' && players.length === 0) {
        try {
          const playersData = await getAllNCAAPlayers('basketball');
          setPlayers(playersData);
        } catch (playerErr) {
          console.warn('Error fetching NCAA Basketball players:', playerErr);
        }
      }
    };

    fetchPlayers();
  }, [comparisonType, players.length]);

  // Helper functions for date ranges
  const getWeekStartDate = (week: number) => {
    const startDate = new Date(2025, 10, 4); // November 4, 2025 - 2025 NCAA Basketball season
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (week - 1) * 7);
    return weekDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getWeekEndDate = (week: number) => {
    const startDate = new Date(2025, 10, 4); // November 4, 2025 - 2025 NCAA Basketball season
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (week - 1) * 7 + 6);
    return weekDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getWeekDate = (week: number) => {
    // NCAA Basketball - show today's games since we fetch current day
    return "Today's Games";
  };

  const getAIComparison = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      if (comparisonType === 'teams') {
        // Find teams by name from ESPN data
        const team1 = teams.find(t => t.displayName === firstSelection || t.name === firstSelection);
        const team2 = teams.find(t => t.displayName === secondSelection || t.name === secondSelection);

        if (team1 && team2) {
          // Create stats objects from ESPN team data
          const team1Stats = {
            record: team1.record?.summary || '0-0',
            rank: team1.rank || 'Unranked',
            location: team1.location,
            nickname: team1.nickname
          };
          const team2Stats = {
            record: team2.record?.summary || '0-0',
            rank: team2.rank || 'Unranked',
            location: team2.location,
            nickname: team2.nickname
          };

          const analysis = await getAISportsAnalysis('NCAA Basketball', 'teams', team1.displayName, team2.displayName, team1Stats, team2Stats);
          setAiAnalysis(analysis);
        }
      } else {
        // For players, use live ESPN data
        const player1 = players.find(p => p.displayName === firstSelection || p.fullName === firstSelection);
        const player2 = players.find(p => p.displayName === secondSelection || p.fullName === secondSelection);

        if (player1 && player2) {
          // Create stats objects from ESPN player data
          const player1Stats = {
            position: player1.position.displayName,
            team: 'NCAA Basketball Player', // Generic since we don't have specific team from player data
            age: player1.age,
            height: player1.displayHeight,
            weight: player1.displayWeight,
            experience: player1.experience.years,
            college: player1.college?.name || 'Unknown'
          };
          const player2Stats = {
            position: player2.position.displayName,
            team: 'NCAA Basketball Player', // Generic since we don't have specific team from player data
            age: player2.age,
            height: player2.displayHeight,
            weight: player2.displayWeight,
            experience: player2.experience.years,
            college: player2.college?.name || 'Unknown'
          };

          const analysis = await getAISportsAnalysis('NCAA Basketball', 'players', player1.displayName, player2.displayName, player1Stats, player2Stats);
          setAiAnalysis(analysis);
        }
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiAnalysis('AI Analysis Error\n\nUnable to generate analysis at this time. Please try again later.');
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <div className="text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  fanalytics
                </div>
              </div>
              <SportsNavigation />
            </div>
            <div className="flex items-center gap-4">
              <Tabs defaultValue="scores" className="hidden md:block">
                <TabsList className="bg-transparent border-b border-zinc-800 rounded-none h-auto p-0">
                  <TabsTrigger
                    value="scores"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    SCORES
                  </TabsTrigger>
                  <TabsTrigger
                    value="news"
                    asChild
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    <Link href="/news">NEWS</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Compare
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-green-500" />
                      AI-Powered Comparison
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Compare NCAA Basketball teams or players using advanced analytics and AI insights
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Comparison Type */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Comparison Type</label>
                      <Tabs
                        value={comparisonType}
                        onValueChange={(v) => {
                          setComparisonType(v as 'teams' | 'players');
                          setFirstSelection('');
                          setSecondSelection('');
                          setAiAnalysis('');
                        }}
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="teams">Teams</TabsTrigger>
                          <TabsTrigger value="players">Players</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* First Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        First {comparisonType === 'teams' ? 'Team' : 'Player'}
                      </label>
                      <Select value={firstSelection} onValueChange={setFirstSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${comparisonType === 'teams' ? 'team' : 'player'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {comparisonType === 'teams'
                            ? teams.map((team) => (
                                <SelectItem key={team.id} value={team.displayName}>
                                  {team.displayName}
                                </SelectItem>
                              ))
                            : players.length > 0
                              ? players.map((player) => (
                                  <SelectItem key={player.id} value={player.displayName}>
                                    {player.displayName} ({player.position.abbreviation})
                                  </SelectItem>
                                ))
                              : [
                                  <SelectItem key="loading" value="loading" disabled>
                                    Loading players...
                                  </SelectItem>
                                ]}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Second Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Second {comparisonType === 'teams' ? 'Team' : 'Player'}
                      </label>
                      <Select value={secondSelection} onValueChange={setSecondSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${comparisonType === 'teams' ? 'team' : 'player'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {comparisonType === 'teams'
                            ? teams.map((team) => (
                                <SelectItem key={team.id} value={team.displayName}>
                                  {team.displayName}
                                </SelectItem>
                              ))
                            : players.length > 0
                              ? players.map((player) => (
                                  <SelectItem key={player.id} value={player.displayName}>
                                    {player.displayName} ({player.position.abbreviation})
                                  </SelectItem>
                                ))
                              : [
                                  <SelectItem key="loading" value="loading" disabled>
                                    Loading players...
                                  </SelectItem>
                                ]}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Compare Button */}
                    <Button
                      onClick={getAIComparison}
                      disabled={!firstSelection || !secondSelection || isAnalyzing}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate AI Analysis
                        </>
                      )}
                    </Button>

                    {/* AI Analysis Result */}
                    {aiAnalysis && (
                      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                        <div className="prose prose-invert max-w-none">
                          {aiAnalysis.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return (
                                <h4 key={i} className="text-green-400 font-semibold mt-3 mb-2">
                                  {line.replace(/\*\*/g, '')}
                                </h4>
                              );
                            }
                            return line ? (
                              <p key={i} className="text-zinc-300 text-sm mb-2">
                                {line}
                              </p>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Week Selector */}
      <div className="border-b border-zinc-800 bg-[#0b0b0e] sticky top-0 z-10">
        <ScrollArea className="w-full">
          <div className="flex px-4 py-2">
            {weeks.slice(0, 15).map((week) => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedWeek === week
                    ? 'text-white border-b-2 border-green-600'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {getWeekDate(week)}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-zinc-400">Loading NCAA Basketball games...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">
            <p className="text-lg">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        ) : games.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const competition = game.competitions[0];
              const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
              const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');
              const score = getGameScore(game);
              const odds = getBettingOdds(game);
              const gameStatus = formatGameStatus(game);
              const venue = getGameVenue(game);
              const broadcast = getGameBroadcast(game);

              return (
                <div
                  key={game.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:bg-zinc-900/70 transition-colors"
                >
                  {/* Game Status */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-zinc-400">
                      {new Date(game.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      game.status.type.state === 'post'
                        ? 'bg-green-600/20 text-green-400'
                        : game.status.type.state === 'in'
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {gameStatus}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {awayTeam?.team?.logo && (
                        <img
                          src={awayTeam.team.logo}
                          alt={awayTeam.team.displayName}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <span className="font-medium">{awayTeam?.team?.displayName || awayTeam?.displayName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {score && (
                        <span className="text-xl font-bold">{score.away}</span>
                      )}
                      {odds?.awayMoneyLine && (
                        <span className="text-sm text-zinc-400">{odds.awayMoneyLine}</span>
                      )}
                    </div>
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {homeTeam?.team?.logo && (
                        <img
                          src={homeTeam.team.logo}
                          alt={homeTeam.team.displayName}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <span className="font-medium">{homeTeam?.team?.displayName || homeTeam?.displayName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {score && (
                        <span className="text-xl font-bold">{score.home}</span>
                      )}
                      {odds?.homeMoneyLine && (
                        <span className="text-sm text-zinc-400">{odds.homeMoneyLine}</span>
                      )}
                    </div>
                  </div>

                  {/* Betting Info */}
                  {odds && (
                    <div className="pt-3 border-t border-zinc-700 space-y-2">
                      {odds.provider && (
                        <div className="text-xs text-zinc-500 text-center">
                          Odds by {odds.provider}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {odds.spread && (
                          <div className="text-center">
                            <div className="text-zinc-400">Spread</div>
                            <div className="font-semibold">{odds.spread}</div>
                            {odds.spreadOdds && (
                              <div className="text-xs text-zinc-500">{odds.spreadOdds}</div>
                            )}
                          </div>
                        )}
                        {odds.overUnder && (
                          <div className="text-center">
                            <div className="text-zinc-400">Total</div>
                            <div className="font-semibold">{odds.overUnder}</div>
                            {odds.overUnderOdds && (
                              <div className="text-xs text-zinc-500">{odds.overUnderOdds}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Venue & Broadcast Info */}
                  {(venue || broadcast) && (
                    <div className="pt-2 text-xs text-zinc-500">
                      {venue && <div>{venue}</div>}
                      {broadcast && <div>{broadcast}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-zinc-400 py-12">
            <p className="text-lg">No games scheduled for Week {selectedWeek}</p>
            <p className="text-sm mt-2">Try selecting a different week or check back later for updated schedules.</p>
          </div>
        )}
      </main>
    </div>
  );
}
