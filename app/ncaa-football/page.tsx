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
  const [comparisonType, setComparisonType] = useState<'teams' | 'players'>('teams');
  const [firstSelection, setFirstSelection] = useState('');
  const [secondSelection, setSecondSelection] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const weeks = Array.from({ length: 15 }, (_, i) => i + 1);

  const getWeekDate = (week: number) => {
    // NCAA Football season typically starts in August
    const startDate = new Date(2024, 7, 29); // August 29, 2024
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (week - 1) * 7);
    return weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAIComparison = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      if (comparisonType === 'teams') {
        const team1 = ncaaFootballTeamStats[firstSelection as keyof typeof ncaaFootballTeamStats];
        const team2 = ncaaFootballTeamStats[secondSelection as keyof typeof ncaaFootballTeamStats];

        if (team1 && team2) {
          const analysis = await getAISportsAnalysis('NCAA Football', 'teams', firstSelection, secondSelection, team1, team2);
          setAiAnalysis(analysis);
        }
      } else {
        const player1 = ncaaFootballPlayerStats[firstSelection as keyof typeof ncaaFootballPlayerStats];
        const player2 = ncaaFootballPlayerStats[secondSelection as keyof typeof ncaaFootballPlayerStats];

        if (player1 && player2) {
          const analysis = await getAISportsAnalysis('NCAA Football', 'players', firstSelection, secondSelection, player1, player2);
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
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Compare
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-red-500" />
                      AI-Powered Comparison
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Compare NCAA Football teams or players using advanced analytics and AI insights
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
                            ? Object.keys(ncaaFootballTeamStats).map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            : Object.keys(ncaaFootballPlayerStats).map((player) => (
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
                            ? Object.keys(ncaaFootballTeamStats).map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            : Object.keys(ncaaFootballPlayerStats).map((player) => (
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
                      className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700"
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
                                <h4 key={i} className="text-red-400 font-semibold mt-3 mb-2">
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
            {weeks.map((week) => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedWeek === week
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
        {ncaaFootballGamesData[selectedWeek as keyof typeof ncaaFootballGamesData]?.map((section, idx) => (
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
        {!ncaaFootballGamesData[selectedWeek as keyof typeof ncaaFootballGamesData] && (
          <div className="text-center text-zinc-400 py-12">
            <p className="text-lg">No games scheduled for Week {selectedWeek}</p>
          </div>
        )}
      </main>
    </div>
  );
}
