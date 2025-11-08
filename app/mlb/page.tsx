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

  const weeks = Array.from({ length: 27 }, (_, i) => i + 1);

  const getDayDate = (day: number) => {
    // MLB season typically starts in March
    const startDate = new Date(2024, 2, 28); // March 28, 2024
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day - 1));
    return dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAIComparison = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      if (comparisonType === 'teams') {
        const team1 = mlbTeamStats[firstSelection as keyof typeof mlbTeamStats];
        const team2 = mlbTeamStats[secondSelection as keyof typeof mlbTeamStats];

        if (team1 && team2) {
          const analysis = await getAISportsAnalysis('MLB', 'teams', firstSelection, secondSelection, team1, team2);
          setAiAnalysis(analysis);
        }
      } else {
        const player1 = mlbPlayerStats[firstSelection as keyof typeof mlbPlayerStats];
        const player2 = mlbPlayerStats[secondSelection as keyof typeof mlbPlayerStats];

        if (player1 && player2) {
          const analysis = await getAISportsAnalysis('MLB', 'players', firstSelection, secondSelection, player1, player2);
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
                      <Select value={firstSelection} onValueChange={setFirstSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${comparisonType === 'teams' ? 'team' : 'player'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {comparisonType === 'teams'
                            ? Object.keys(mlbTeamStats).map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            : Object.keys(mlbPlayerStats).map((player) => (
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
                            ? Object.keys(mlbTeamStats).map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            : Object.keys(mlbPlayerStats).map((player) => (
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
        {mlbGamesData[selectedWeek as keyof typeof mlbGamesData]?.map((section, idx) => (
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
                      {game.awaySpread}
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
                      {game.homeSpread}
                    </div>

                    {/* Total */}
                    <div className="text-zinc-400 text-sm min-w-[80px] text-right">
                      {game.total}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* No games message */}
        {!mlbGamesData[selectedWeek as keyof typeof mlbGamesData] && (
          <div className="text-center text-zinc-400 py-12">
            <p className="text-lg">No games scheduled for Day {selectedWeek}</p>
          </div>
        )}
      </main>
    </div>
  );
}
