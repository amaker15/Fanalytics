'use client';

import { useState } from 'react';
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
import { Menu, Sparkles, TrendingUp } from 'lucide-react';
import SportsNavigation from '@/components/sports-navigation';
import { getAISportsAnalysis } from '@/lib/nebius';

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
  const [comparisonType, setComparisonType] = useState<'teams' | 'players'>('teams');
  const [firstSelection, setFirstSelection] = useState('');
  const [secondSelection, setSecondSelection] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const weeks = Array.from({ length: 82 }, (_, i) => i + 1);

  const getGameDate = (game: number) => {
    // NBA season typically starts in October
    const startDate = new Date(2024, 9, 22); // October 22, 2024
    const gameDate = new Date(startDate);
    gameDate.setDate(startDate.getDate() + (game - 1));
    return gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAIComparison = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      if (comparisonType === 'teams') {
        const team1 = nbaTeamStats[firstSelection as keyof typeof nbaTeamStats];
        const team2 = nbaTeamStats[secondSelection as keyof typeof nbaTeamStats];

        if (team1 && team2) {
          const analysis = await getAISportsAnalysis('NBA', 'teams', firstSelection, secondSelection, team1, team2);
          setAiAnalysis(analysis);
        }
      } else {
        const player1 = nbaPlayerStats[firstSelection as keyof typeof nbaPlayerStats];
        const player2 = nbaPlayerStats[secondSelection as keyof typeof nbaPlayerStats];

        if (player1 && player2) {
          const analysis = await getAISportsAnalysis('NBA', 'players', firstSelection, secondSelection, player1, player2);
          setAiAnalysis(analysis);
        }
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiAnalysis('**AI Analysis Error**\n\nUnable to generate analysis at this time. Please try again later.');
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
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Compare
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-orange-500" />
                      AI-Powered Comparison
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Compare NBA teams or players using advanced analytics and AI insights
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
                            ? Object.keys(nbaTeamStats).map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            : Object.keys(nbaPlayerStats).map((player) => (
                                <SelectItem key={player} value={player}>
                                  {player}
                                </SelectItem>
                              ))}
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
                            ? Object.keys(nbaTeamStats).map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            : Object.keys(nbaPlayerStats).map((player) => (
                                <SelectItem key={player} value={player}>
                                  {player}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Compare Button */}
                    <Button
                      onClick={getAIComparison}
                      disabled={!firstSelection || !secondSelection || isAnalyzing}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
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
                                <h4 key={i} className="text-orange-400 font-semibold mt-3 mb-2">
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
            {weeks.slice(0, 20).map((week) => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedWeek === week
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
        {nbaGamesData[selectedWeek as keyof typeof nbaGamesData]?.map((section, idx) => (
          <div key={idx} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{section.date}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {section.games.map((game, gameIdx) => (
                <div
                  key={gameIdx}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:bg-zinc-900/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={game.awayLogo}
                        alt={game.awayTeam}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="font-medium">{game.awayTeam}</span>
                    </div>

                    {/* Away Spread/Total */}
                    <div className="text-zinc-400 text-sm mx-4">
                      {game.awaySpread || game.total}
                    </div>

                    {/* Time */}
                    <div className="text-zinc-400 text-sm min-w-[80px] text-right">
                      {game.time}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={game.homeLogo}
                        alt={game.homeTeam}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="font-medium">{game.homeTeam}</span>
                    </div>

                    {/* Home Spread/Total */}
                    <div className="text-zinc-400 text-sm mx-4">
                      {game.homeSpread || game.total}
                    </div>

                    {/* Empty space for alignment */}
                    <div className="min-w-[80px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* No games message */}
        {!nbaGamesData[selectedWeek as keyof typeof nbaGamesData] && (
          <div className="text-center text-zinc-400 py-12">
            <p className="text-lg">No games scheduled for Game {selectedWeek}</p>
          </div>
        )}
      </main>
    </div>
  );
}
