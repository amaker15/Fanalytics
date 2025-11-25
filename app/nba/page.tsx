/*
 * Fanalytics - NBA Scores Page
 *
 * This file contains the NBA section page component for Fanalytics,
 * displaying NBA game scores, standings, and player analytics.
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
import AIInsightsDialog from '@/components/ai-insights-dialog';
import {
  getNBAScores,
  getNBATeams,
  getNBANews,
  getAllNBAPlayers,
  ESPNEvent,
  ESPNTeam,
  ESPNPlayer,
  formatGameStatus,
  getGameScore,
  getBettingOdds,
  getGameVenue,
  getGameBroadcast
} from '@/lib/espn';

// Sample NBA game data
const nbaGamesData = {
  1: [
    {
      date: 'Wed, Oct 23',
      games: [
        {
          awayTeam: 'BOS Celtics',
          awayLogo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg',
          awaySpread: '-4.5',
          homeTeam: 'NY Knicks',
          homeLogo: 'https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg',
          homeSpread: '',
          total: 'T:225.5',
          time: '7:30 PM',
        },
        {
          awayTeam: 'LAL Lakers',
          awayLogo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
          awaySpread: '',
          homeTeam: 'DEN Nuggets',
          homeLogo: 'https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg',
          homeSpread: '-6.5',
          total: 'T:230.5',
          time: '9:00 PM',
        },
      ],
    },
    {
      date: 'Thu, Oct 24',
      games: [
        {
          awayTeam: 'GS Warriors',
          awayLogo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg',
          awaySpread: '-3.5',
          homeTeam: 'PHO Suns',
          homeLogo: 'https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg',
          homeSpread: '',
          total: 'T:235.5',
          time: '10:00 PM',
        },
      ],
    },
  ],
  2: [
    {
      date: 'Fri, Oct 25',
      games: [
        {
          awayTeam: 'MIL Bucks',
          awayLogo: 'https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg',
          awaySpread: '-2.5',
          homeTeam: 'BOS Celtics',
          homeLogo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg',
          homeSpread: '',
          total: 'T:228.5',
          time: '7:30 PM',
        },
        {
          awayTeam: 'DAL Mavericks',
          awayLogo: 'https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg',
          awaySpread: '',
          homeTeam: 'LAL Lakers',
          homeLogo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
          homeSpread: '-5.5',
          total: 'T:240.5',
          time: '10:00 PM',
        },
      ],
    },
  ],
};

// NBA Team stats data (2024-2025 Season - Updated January 2025)
const nbaTeamStats = {
  'OKC Thunder': { wins: 20, losses: 7, pointsPerGame: 121.2, pointsAllowed: 109.4, rank: 1 },
  'BOS Celtics': { wins: 19, losses: 8, pointsPerGame: 117.8, pointsAllowed: 111.6, rank: 2 },
  'DEN Nuggets': { wins: 18, losses: 9, pointsPerGame: 116.4, pointsAllowed: 110.8, rank: 3 },
  'LAL Lakers': { wins: 17, losses: 10, pointsPerGame: 119.1, pointsAllowed: 116.2, rank: 4 },
  'MIN Timberwolves': { wins: 17, losses: 10, pointsPerGame: 114.7, pointsAllowed: 109.5, rank: 5 },
  'PHO Suns': { wins: 16, losses: 11, pointsPerGame: 118.2, pointsAllowed: 117.1, rank: 6 },
  'GS Warriors': { wins: 16, losses: 11, pointsPerGame: 120.8, pointsAllowed: 115.9, rank: 7 },
  'MIL Bucks': { wins: 15, losses: 12, pointsPerGame: 118.9, pointsAllowed: 117.8, rank: 8 },
  'CLE Cavaliers': { wins: 15, losses: 12, pointsPerGame: 115.1, pointsAllowed: 112.4, rank: 9 },
  'DAL Mavericks': { wins: 15, losses: 12, pointsPerGame: 116.4, pointsAllowed: 115.8, rank: 10 },
  'NY Knicks': { wins: 14, losses: 13, pointsPerGame: 113.8, pointsAllowed: 110.9, rank: 11 },
  'SAC Kings': { wins: 14, losses: 13, pointsPerGame: 117.2, pointsAllowed: 115.6, rank: 12 },
  'MIA Heat': { wins: 13, losses: 14, pointsPerGame: 110.2, pointsAllowed: 113.8, rank: 13 },
  'ORL Magic': { wins: 12, losses: 15, pointsPerGame: 109.6, pointsAllowed: 112.3, rank: 14 },
  'ATL Hawks': { wins: 11, losses: 16, pointsPerGame: 116.1, pointsAllowed: 119.4, rank: 15 },
};

// NBA Player stats data (2024-2025 Season - Updated January 2025)
const nbaPlayerStats = {
  'Shai Gilgeous-Alexander': {
    team: 'OKC Thunder',
    position: 'PG',
    pointsPerGame: 31.8,
    rebounds: 6.4,
    assists: 7.2,
    efficiency: 33.6,
  },
  'Luka Doncic': {
    team: 'DAL Mavericks',
    position: 'PG',
    pointsPerGame: 29.4,
    rebounds: 10.1,
    assists: 9.8,
    efficiency: 31.7,
  },
  'Nikola Jokic': {
    team: 'DEN Nuggets',
    position: 'C',
    pointsPerGame: 27.8,
    rebounds: 14.2,
    assists: 8.4,
    efficiency: 33.9,
  },
  'Stephen Curry': {
    team: 'GS Warriors',
    position: 'PG',
    pointsPerGame: 28.9,
    rebounds: 4.6,
    assists: 7.1,
    efficiency: 30.2,
  },
  'Giannis Antetokounmpo': {
    team: 'MIL Bucks',
    position: 'PF',
    pointsPerGame: 29.1,
    rebounds: 12.8,
    assists: 6.7,
    efficiency: 32.4,
  },
  'Jayson Tatum': {
    team: 'BOS Celtics',
    position: 'SF',
    pointsPerGame: 26.2,
    rebounds: 8.1,
    assists: 8.4,
    efficiency: 28.6,
  },
  'Kevin Durant': {
    team: 'PHO Suns',
    position: 'SF',
    pointsPerGame: 28.7,
    rebounds: 7.2,
    assists: 5.8,
    efficiency: 29.4,
  },
  'Anthony Edwards': {
    team: 'MIN Timberwolves',
    position: 'SG',
    pointsPerGame: 27.1,
    rebounds: 5.9,
    assists: 5.2,
    efficiency: 26.8,
  },
  'LeBron James': {
    team: 'LAL Lakers',
    position: 'SF',
    pointsPerGame: 24.3,
    rebounds: 7.8,
    assists: 8.2,
    efficiency: 27.1,
  },
  'Devin Booker': {
    team: 'PHO Suns',
    position: 'SG',
    pointsPerGame: 26.4,
    rebounds: 4.8,
    assists: 6.9,
    efficiency: 28.7,
  },
};

export default function NBA() {
  const [selectedWeek, setSelectedWeek] = useState(1);

  // ESPN API data state
  const [games, setGames] = useState<ESPNEvent[]>([]);
  const [teams, setTeams] = useState<ESPNTeam[]>([]);
  const [players, setPlayers] = useState<ESPNPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weeks = Array.from({ length: 82 }, (_, i) => i + 1);

  // Fetch NBA data from ESPN API
  useEffect(() => {
    const fetchNBAData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get games for the selected week (using date range)
        const weekStartDate = getWeekStartDate(selectedWeek);
        const weekEndDate = getWeekEndDate(selectedWeek);
        const dateRange = `${weekStartDate}-${weekEndDate}`;

        const scoresResponse = await getNBAScores(dateRange);
        const teamsResponse = await getNBATeams();

        setGames(scoresResponse.events || []);
        // NBA API structure - teams are nested under .team property
        const teamsData = teamsResponse.sports?.[0]?.leagues?.[0]?.teams?.map(item => item.team) || [];
        setTeams(teamsData);
      } catch (err) {
        console.error('Failed to fetch NBA data:', err);
        setError('Failed to load NBA data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNBAData();
  }, [selectedWeek]);



  // Helper functions for date ranges
  const getWeekStartDate = (week: number) => {
    const startDate = new Date(2025, 9, 22); // October 22, 2025 - 2025 NBA season
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (week - 1) * 7);
    return weekDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getWeekEndDate = (week: number) => {
    const startDate = new Date(2025, 9, 22); // October 22, 2025 - 2025 NBA season
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (week - 1) * 7 + 6);
    return weekDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getGameDate = (game: number) => {
    // NBA season typically starts in October - show week ranges since we fetch multiple days
    return `Week ${game}`;
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
                <TrendingUp className="h-6 w-6 text-orange-500" />
                <div className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
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
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    SCORES
                  </TabsTrigger>
                  <TabsTrigger
                    value="news"
                    asChild
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    <Link href="/news">NEWS</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <AIInsightsDialog>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
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
            {weeks.slice(0, 20).map((week) => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${selectedWeek === week
                    ? 'text-white border-b-2 border-orange-600'
                    : 'text-zinc-400 hover:text-white'
                  }`}
              >
                {getGameDate(week)}
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
            <span className="ml-2 text-zinc-400">Loading NBA games...</span>
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
            <p className="text-lg">No games scheduled for Game {selectedWeek}</p>
            <p className="text-sm mt-2">Try selecting a different game or check back later for updated schedules.</p>
          </div>
        )}
      </main>
    </div>
  );
}
