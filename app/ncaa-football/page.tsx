/*
 * Fanalytics - NCAA Football Scores Page
 *
 * This file contains the NCAA Football section page component for Fanalytics,
 * displaying college football game scores and team analytics.
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


import { Menu, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import SportsNavigation from '@/components/sports-navigation';
import { AuthButton } from '@/components/ui/auth-button';
import AIInsightsDialog from '@/components/ai-insights-dialog';
import {
  getNCAAFootballScores,
  getNCAAFootballTeams,
  getNCAAFootballNews,
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

// Sample NCAA Football game data
const ncaaFootballGamesData = {
  1: [
    {
      date: 'Thu, Aug 29',
      games: [
        {
          awayTeam: 'Old Dominion Monarchs',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/95.png',
          awaySpread: '',
          homeTeam: 'NC State Wolfpack',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/152.png',
          homeSpread: '-24.5',
          total: 'T:58.5',
          time: '7:30 PM',
        },
      ],
    },
    {
      date: 'Fri, Aug 30',
      games: [
        {
          awayTeam: 'Florida State Seminoles',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/52.png',
          awaySpread: '-3.5',
          homeTeam: 'LSU Tigers',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png',
          homeSpread: '',
          total: 'T:51.5',
          time: '7:30 PM',
        },
      ],
    },
    {
      date: 'Sat, Aug 31',
      games: [
        {
          awayTeam: 'Clemson Tigers',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png',
          awaySpread: '',
          homeTeam: 'Georgia Bulldogs',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png',
          homeSpread: '-8.5',
          total: 'T:49.5',
          time: '12:00 PM',
        },
        {
          awayTeam: 'Ohio State Buckeyes',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png',
          awaySpread: '-14.5',
          homeTeam: 'Indiana Hoosiers',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/84.png',
          homeSpread: '',
          total: 'T:55.5',
          time: '12:00 PM',
        },
        {
          awayTeam: 'Texas A&M Aggies',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/245.png',
          awaySpread: '',
          homeTeam: 'Notre Dame Fighting Irish',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/87.png',
          homeSpread: '-9.5',
          total: 'T:52.5',
          time: '3:30 PM',
        },
      ],
    },
  ],
  2: [
    {
      date: 'Sat, Sep 7',
      games: [
        {
          awayTeam: 'Alabama Crimson Tide',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png',
          awaySpread: '-16.5',
          homeTeam: 'Tennessee Volunteers',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png',
          homeSpread: '',
          total: 'T:48.5',
          time: '7:00 PM',
        },
        {
          awayTeam: 'USC Trojans',
          awayLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png',
          awaySpread: '-7.5',
          homeTeam: 'Stanford Cardinal',
          homeLogo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/24.png',
          homeSpread: '',
          total: 'T:57.5',
          time: '4:00 PM',
        },
      ],
    },
  ],
};

// NCAA Football Team stats data (2024 Season - Final Postseason Results)
const ncaaFootballTeamStats = {
  'Ohio State Buckeyes': { wins: 11, losses: 1, pointsPerGame: 39.2, pointsAllowed: 18.9, rank: 1 },
  'Georgia Bulldogs': { wins: 12, losses: 1, pointsPerGame: 43.1, pointsAllowed: 20.1, rank: 2 },
  'Tennessee Volunteers': { wins: 10, losses: 2, pointsPerGame: 35.8, pointsAllowed: 22.6, rank: 3 },
  'Texas Longhorns': { wins: 10, losses: 2, pointsPerGame: 34.4, pointsAllowed: 21.7, rank: 4 },
  'Alabama Crimson Tide': { wins: 9, losses: 3, pointsPerGame: 37.3, pointsAllowed: 24.1, rank: 5 },
  'Notre Dame Fighting Irish': { wins: 9, losses: 3, pointsPerGame: 34.1, pointsAllowed: 23.4, rank: 6 },
  'Penn State Nittany Lions': { wins: 10, losses: 2, pointsPerGame: 32.6, pointsAllowed: 18.7, rank: 7 },
  'LSU Tigers': { wins: 9, losses: 3, pointsPerGame: 31.9, pointsAllowed: 24.9, rank: 8 },
  'Oregon Ducks': { wins: 10, losses: 2, pointsPerGame: 30.1, pointsAllowed: 19.2, rank: 9 },
  'Miami Hurricanes': { wins: 9, losses: 3, pointsPerGame: 29.2, pointsAllowed: 22.5, rank: 10 },
  'Clemson Tigers': { wins: 9, losses: 3, pointsPerGame: 30.4, pointsAllowed: 24.6, rank: 11 },
  'Oklahoma Sooners': { wins: 8, losses: 4, pointsPerGame: 27.8, pointsAllowed: 23.2, rank: 12 },
  'Texas A&M Aggies': { wins: 8, losses: 4, pointsPerGame: 27.1, pointsAllowed: 24.9, rank: 13 },
  'Utah Utes': { wins: 9, losses: 3, pointsPerGame: 25.6, pointsAllowed: 20.7, rank: 14 },
  'USC Trojans': { wins: 7, losses: 5, pointsPerGame: 29.3, pointsAllowed: 28.5, rank: 15 },
};

// NCAA Football Player stats data (2024 Season - Final Stats)
const ncaaFootballPlayerStats = {
  'Shedeur Sanders': {
    team: 'Colorado Buffaloes',
    position: 'QB',
    passingYards: 3589,
    touchdowns: 32,
    interceptions: 8,
    rating: 168.7,
  },
  'Arch Manning': {
    team: 'Texas Longhorns',
    position: 'QB',
    passingYards: 3562,
    touchdowns: 31,
    interceptions: 9,
    rating: 161.4,
  },
  'Drake Maye': {
    team: 'UNC Tar Heels',
    position: 'QB',
    passingYards: 3318,
    touchdowns: 27,
    interceptions: 11,
    rating: 149.2,
  },
  'Bo Nix': {
    team: 'Oregon Ducks',
    position: 'QB',
    passingYards: 3134,
    touchdowns: 28,
    interceptions: 8,
    rating: 155.8,
  },
  'MarShawn Lloyd': {
    team: 'USC Trojans',
    position: 'RB',
    rushingYards: 1678,
    rushingTDs: 19,
    receptions: 54,
    receivingYards: 456,
  },
  'Jonathon Brooks': {
    team: 'Texas Longhorns',
    position: 'RB',
    rushingYards: 1456,
    rushingTDs: 15,
    receptions: 42,
    receivingYards: 378,
  },
  'Jaylen Wright': {
    team: 'Tennessee Volunteers',
    position: 'RB',
    rushingYards: 1324,
    rushingTDs: 16,
    receptions: 36,
    receivingYards: 298,
  },
  'TreVeyon Henderson': {
    team: 'Ohio State Buckeyes',
    position: 'RB',
    rushingYards: 1289,
    rushingTDs: 13,
    receptions: 38,
    receivingYards: 324,
  },
  'Ladd McConkey': {
    team: 'Georgia Bulldogs',
    position: 'WR',
    receptions: 89,
    receivingYards: 1243,
    receivingTDs: 11,
  },
  'Rome Odunze': {
    team: 'Washington Huskies',
    position: 'WR',
    receptions: 72,
    receivingYards: 1187,
    receivingTDs: 9,
  },
};

export default function NCAAFootball() {
  const [selectedWeek, setSelectedWeek] = useState(1);

  // ESPN API data state
  const [games, setGames] = useState<ESPNEvent[]>([]);
  const [teams, setTeams] = useState<ESPNTeam[]>([]);
  const [players, setPlayers] = useState<ESPNPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weeks = Array.from({ length: 15 }, (_, i) => i + 1);

  // Fetch NCAA Football data from ESPN API
  useEffect(() => {
    const fetchNCAAFootballData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current week's games (using date range for the selected week)
        const weekStartDate = getWeekStartDate(selectedWeek);
        const weekEndDate = getWeekEndDate(selectedWeek);
        const dateRange = `${weekStartDate}-${weekEndDate}`;

        const scoresResponse = await getNCAAFootballScores(dateRange);
        const teamsResponse = await getNCAAFootballTeams();

        setGames(scoresResponse.events || []);
        // NCAA Football API structure - teams are nested under .team property
        const teamsData = teamsResponse.sports?.[0]?.leagues?.[0]?.teams?.map(item => item.team) || [];
        setTeams(teamsData);
      } catch (err) {
        console.error('Failed to fetch NCAA Football data:', err);
        setError('Failed to load NCAA Football data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNCAAFootballData();
  }, [selectedWeek]);



  // Helper functions for date ranges
  const getWeekStartDate = (week: number) => {
    const startDate = new Date(2025, 7, 29); // August 29, 2025 (Thursday night football) - 2025 NCAA season
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (week - 1) * 7);
    return weekDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getWeekEndDate = (week: number) => {
    const startDate = new Date(2025, 7, 29); // August 29, 2025 - 2025 NCAA season
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (week - 1) * 7 + 6);
    return weekDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getWeekDate = (week: number) => {
    // NCAA Football season typically starts in August - show week since we fetch multiple days
    return `Week ${week}`;
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
                <TrendingUp className="h-6 w-6 text-red-500" />
                <div className="text-xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
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
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    SCORES
                  </TabsTrigger>
                  <TabsTrigger
                    value="news"
                    asChild
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    <Link href="/news">NEWS</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <AuthButton />
              <AIInsightsDialog>
                <Button className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
              </AIInsightsDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Week Selector */}
      <div className="border-b border-zinc-800 bg-[#0b0b0e] sticky top-0 z-10">
        <ScrollArea className="w-full">
          <div className="flex px-4 py-2">
            {weeks.map((week) => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${selectedWeek === week
                    ? 'text-white border-b-2 border-red-600'
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
            <span className="ml-2 text-zinc-400">Loading NCAA Football games...</span>
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
                    <span className={`text-sm px-2 py-1 rounded ${game.status.type.state === 'post'
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
