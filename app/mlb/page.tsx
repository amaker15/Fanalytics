/*
 * Fanalytics - MLB Scores Page
 *
 * This file contains the MLB section page component for Fanalytics,
 * displaying MLB game scores, standings, and team analytics.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

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
import { Combobox } from '@/components/ui/combobox';
import { Menu, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import SportsNavigation from '@/components/sports-navigation';
import { getAISportsAnalysis } from '@/lib/nebius';
import {
  getMLBScores,
  getMLBTeams,
  getMLBNews,
  getAllMLBPlayers,
  ESPNEvent,
  ESPNTeam,
  ESPNPlayer,
  formatGameStatus,
  getGameScore,
  getBettingOdds,
  getGameVenue,
  getGameBroadcast
} from '@/lib/espn';

// Sample MLB game data
const mlbGamesData = {
  1: [
    {
      date: 'Mon, Mar 30',
      games: [
        {
          awayTeam: 'Los Angeles Dodgers',
          awayLogo: 'https://www.mlbstatic.com/team-logos/119.svg',
          awaySpread: '-150',
          homeTeam: 'San Diego Padres',
          homeLogo: 'https://www.mlbstatic.com/team-logos/135.svg',
          homeSpread: '+130',
          total: 'O/U 8.5',
          time: '4:10 PM',
        },
      ],
    },
    {
      date: 'Tue, Mar 31',
      games: [
        {
          awayTeam: 'New York Yankees',
          awayLogo: 'https://www.mlbstatic.com/team-logos/147.svg',
          awaySpread: '-140',
          homeTeam: 'Baltimore Orioles',
          homeLogo: 'https://www.mlbstatic.com/team-logos/110.svg',
          homeSpread: '+120',
          total: 'O/U 8.0',
          time: '7:05 PM',
        },
        {
          awayTeam: 'Houston Astros',
          awayLogo: 'https://www.mlbstatic.com/team-logos/117.svg',
          awaySpread: '-160',
          homeTeam: 'Texas Rangers',
          homeLogo: 'https://www.mlbstatic.com/team-logos/140.svg',
          homeSpread: '+140',
          total: 'O/U 8.5',
          time: '8:05 PM',
        },
      ],
    },
  ],
  2: [
    {
      date: 'Wed, Apr 1',
      games: [
        {
          awayTeam: 'Atlanta Braves',
          awayLogo: 'https://www.mlbstatic.com/team-logos/144.svg',
          awaySpread: '-130',
          homeTeam: 'Washington Nationals',
          homeLogo: 'https://www.mlbstatic.com/team-logos/120.svg',
          homeSpread: '+110',
          total: 'O/U 8.5',
          time: '7:05 PM',
        },
        {
          awayTeam: 'Boston Red Sox',
          awayLogo: 'https://www.mlbstatic.com/team-logos/111.svg',
          awaySpread: '+150',
          homeTeam: 'Toronto Blue Jays',
          homeLogo: 'https://www.mlbstatic.com/team-logos/141.svg',
          homeSpread: '-170',
          total: 'O/U 8.0',
          time: '7:07 PM',
        },
      ],
    },
  ],
};

// MLB Team stats data (2024 Season - Final Stats + Postseason)
const mlbTeamStats = {
  'Los Angeles Dodgers': { wins: 98, losses: 64, runsPerGame: 5.2, runsAllowed: 4.1, rank: 1 },
  'New York Yankees': { wins: 94, losses: 68, runsPerGame: 4.8, runsAllowed: 4.2, rank: 2 },
  'Baltimore Orioles': { wins: 91, losses: 71, runsPerGame: 4.9, runsAllowed: 4.3, rank: 3 },
  'Cleveland Guardians': { wins: 92, losses: 69, runsPerGame: 4.7, runsAllowed: 4.1, rank: 4 },
  'Minnesota Twins': { wins: 82, losses: 80, runsPerGame: 4.5, runsAllowed: 4.6, rank: 5 },
  'Kansas City Royals': { wins: 86, losses: 76, runsPerGame: 4.6, runsAllowed: 4.4, rank: 6 },
  'Houston Astros': { wins: 88, losses: 73, runsPerGame: 4.8, runsAllowed: 4.1, rank: 7 },
  'Detroit Tigers': { wins: 86, losses: 76, runsPerGame: 4.4, runsAllowed: 4.5, rank: 8 },
  'Seattle Mariners': { wins: 85, losses: 77, runsPerGame: 4.1, runsAllowed: 4.3, rank: 9 },
  'Boston Red Sox': { wins: 81, losses: 81, runsPerGame: 4.3, runsAllowed: 4.4, rank: 10 },
  'Texas Rangers': { wins: 78, losses: 84, runsPerGame: 4.1, runsAllowed: 4.6, rank: 11 },
  'Tampa Bay Rays': { wins: 80, losses: 82, runsPerGame: 4.0, runsAllowed: 4.2, rank: 12 },
  'Toronto Blue Jays': { wins: 74, losses: 88, runsPerGame: 4.2, runsAllowed: 4.7, rank: 13 },
  'Arizona Diamondbacks': { wins: 89, losses: 73, runsPerGame: 4.7, runsAllowed: 4.5, rank: 14 },
  'Atlanta Braves': { wins: 89, losses: 73, runsPerGame: 4.6, runsAllowed: 4.2, rank: 15 },
};

// MLB Player stats data (2024 Season - Final Stats)
const mlbPlayerStats = {
  'Aaron Judge': {
    team: 'New York Yankees',
    position: 'RF',
    battingAverage: 0.322,
    homeRuns: 58,
    rbis: 144,
    ops: 1.159,
  },
  'Shohei Ohtani': {
    team: 'Los Angeles Dodgers',
    position: 'DH',
    battingAverage: 0.310,
    homeRuns: 54,
    rbis: 130,
    ops: 1.026,
  },
  'Juan Soto': {
    team: 'New York Yankees',
    position: 'RF',
    battingAverage: 0.288,
    homeRuns: 41,
    rbis: 109,
    ops: 0.962,
  },
  'Mookie Betts': {
    team: 'Los Angeles Dodgers',
    position: 'RF',
    battingAverage: 0.307,
    homeRuns: 39,
    rbis: 107,
    ops: 0.948,
  },
  'Gunnar Henderson': {
    team: 'Baltimore Orioles',
    position: 'SS',
    battingAverage: 0.283,
    homeRuns: 37,
    rbis: 94,
    ops: 0.894,
  },
  'Corbin Burnes': {
    team: 'Baltimore Orioles',
    position: 'SP',
    era: 2.94,
    wins: 15,
    strikeouts: 238,
    whip: 1.02,
  },
  'Luis Gil': {
    team: 'New York Yankees',
    position: 'SP',
    era: 3.29,
    wins: 10,
    strikeouts: 166,
    whip: 1.15,
  },
  'Gerrit Cole': {
    team: 'New York Yankees',
    position: 'SP',
    era: 3.50,
    wins: 14,
    strikeouts: 222,
    whip: 1.09,
  },
  'Tarik Skubal': {
    team: 'Detroit Tigers',
    position: 'SP',
    era: 2.85,
    wins: 18,
    strikeouts: 228,
    whip: 0.96,
  },
  'Zack Wheeler': {
    team: 'Philadelphia Phillies',
    position: 'SP',
    era: 2.57,
    wins: 16,
    strikeouts: 212,
    whip: 1.04,
  },
};

export default function MLB() {
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

  const weeks = Array.from({ length: 27 }, (_, i) => i + 1);

  // Fetch MLB data from ESPN API
  useEffect(() => {
    const fetchMLBData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get games for the selected day (using date range)
        const dayStartDate = getDayStartDate(selectedWeek);
        const dayEndDate = getDayEndDate(selectedWeek);
        const dateRange = `${dayStartDate}-${dayEndDate}`;

        const scoresResponse = await getMLBScores(dateRange);
        const teamsResponse = await getMLBTeams();

        setGames(scoresResponse.events || []);
        // MLB API structure is different - teams are nested under .team property
        const teamsData = teamsResponse.sports?.[0]?.leagues?.[0]?.teams?.map(item => item.team) || [];
        setTeams(teamsData);
      } catch (err) {
        console.error('Failed to fetch MLB data:', err);
        setError('Failed to load MLB data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMLBData();
  }, [selectedWeek]);

  // Fetch players only when switching to player comparison mode
  useEffect(() => {
    const fetchPlayers = async () => {
      if (comparisonType === 'players' && players.length === 0) {
        try {
          const playersData = await getAllMLBPlayers();
          setPlayers(playersData);
        } catch (playerErr) {
          console.warn('Error fetching MLB players:', playerErr);
        }
      }
    };

    fetchPlayers();
  }, [comparisonType, players.length]);

  // Helper functions for date ranges
  const getDayStartDate = (day: number) => {
    const startDate = new Date(2025, 2, 28); // March 28, 2025 - 2025 MLB season
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day - 1));
    return dayDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getDayEndDate = (day: number) => {
    const startDate = new Date(2025, 2, 28); // March 28, 2025 - 2025 MLB season
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day - 1));
    return dayDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getDayDate = (day: number) => {
    // MLB season - show day since we fetch games for that day range
    return `Day ${day}`;
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

          const analysis = await getAISportsAnalysis('MLB', 'teams', team1.displayName, team2.displayName, team1Stats, team2Stats);
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
            team: 'MLB Player', // Generic since we don't have specific team from player data
            age: player1.age,
            height: player1.displayHeight,
            weight: player1.displayWeight,
            experience: player1.experience.years,
            college: player1.college?.name || 'Unknown'
          };
          const player2Stats = {
            position: player2.position.displayName,
            team: 'MLB Player', // Generic since we don't have specific team from player data
            age: player2.age,
            height: player2.displayHeight,
            weight: player2.displayWeight,
            experience: player2.experience.years,
            college: player2.college?.name || 'Unknown'
          };

          const analysis = await getAISportsAnalysis('MLB', 'players', player1.displayName, player2.displayName, player1Stats, player2Stats, true); // Enable debug mode for testing
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
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-white bg-clip-text text-transparent">
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
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    SCORES
                  </TabsTrigger>
                  <TabsTrigger
                    value="news"
                    asChild
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    <Link href="/news">NEWS</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-white hover:from-blue-700 hover:to-gray-200 text-black font-semibold">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Compare
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-blue-500" />
                      AI-Powered Comparison
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Compare MLB teams or players using advanced analytics and AI insights
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
                      {comparisonType === 'teams' ? (
                        <Select value={firstSelection} onValueChange={setFirstSelection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.displayName}>
                                {team.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Combobox
                          options={
                            players.length > 0
                              ? players.map((player) => ({
                                  value: player.displayName,
                                  label: player.displayName,
                                  position: player.position.abbreviation,
                                }))
                              : [{ value: "loading", label: "Loading players..." }]
                          }
                          value={firstSelection}
                          onValueChange={setFirstSelection}
                          placeholder="Select player"
                          searchPlaceholder="Search players..."
                          emptyMessage="No players found."
                        />
                      )}
                    </div>

                    {/* Second Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Second {comparisonType === 'teams' ? 'Team' : 'Player'}
                      </label>
                      {comparisonType === 'teams' ? (
                        <Select value={secondSelection} onValueChange={setSecondSelection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.displayName}>
                                {team.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Combobox
                          options={
                            players.length > 0
                              ? players.map((player) => ({
                                  value: player.displayName,
                                  label: player.displayName,
                                  position: player.position.abbreviation,
                                }))
                              : [{ value: "loading", label: "Loading players..." }]
                          }
                          value={secondSelection}
                          onValueChange={setSecondSelection}
                          placeholder="Select player"
                          searchPlaceholder="Search players..."
                          emptyMessage="No players found."
                        />
                      )}
                    </div>

                    {/* Compare Button */}
                    <Button
                      onClick={getAIComparison}
                      disabled={!firstSelection || !secondSelection || isAnalyzing}
                      className="w-full bg-gradient-to-r from-blue-600 to-white hover:from-blue-700 hover:to-gray-200 text-black font-semibold"
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
                                <h4 key={i} className="text-blue-400 font-semibold mt-3 mb-2">
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
                    ? 'text-white border-b-2 border-blue-600'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {getDayDate(week)}
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
            <span className="ml-2 text-zinc-400">Loading MLB games...</span>
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
            <p className="text-lg">No MLB games scheduled today</p>
            <p className="text-sm mt-2">Check back later or select a different day for MLB schedules.</p>
          </div>
        )}
      </main>
    </div>
  );
}
