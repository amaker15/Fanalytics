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

// Sample game data
const gamesData = {
  9: [
    {
      date: 'Fri, Oct 31',
      games: [
        {
          awayTeam: 'BAL Ravens',
          awayLogo: 'https://ext.same-assets.com/1855771146/2684254270.png',
          awaySpread: '-7.5',
          homeTeam: 'MIA Dolphins',
          homeLogo: 'https://ext.same-assets.com/1855771146/1824895503.png',
          homeSpread: '',
          total: 'T:51.5',
          time: '12:15 AM',
        },
      ],
    },
    {
      date: 'Sun, Nov 2',
      games: [
        {
          awayTeam: 'DEN Broncos',
          awayLogo: 'https://ext.same-assets.com/1855771146/1459761195.png',
          awaySpread: '',
          homeTeam: 'HOU Texans',
          homeLogo: 'https://ext.same-assets.com/1855771146/150070271.png',
          homeSpread: '-1.5',
          total: 'T:39.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'SF 49ers',
          awayLogo: 'https://ext.same-assets.com/1855771146/1338560517.png',
          awaySpread: '-2.5',
          homeTeam: 'NY Giants',
          homeLogo: 'https://ext.same-assets.com/1855771146/454448804.png',
          homeSpread: '',
          total: 'T:48.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'IND Colts',
          awayLogo: 'https://ext.same-assets.com/1855771146/2388602772.png',
          awaySpread: '-3.5',
          homeTeam: 'PIT Steelers',
          homeLogo: 'https://ext.same-assets.com/1855771146/2110862320.png',
          homeSpread: '',
          total: 'T:50.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'CAR Panthers',
          awayLogo: 'https://ext.same-assets.com/1855771146/822562775.png',
          awaySpread: '',
          homeTeam: 'GB Packers',
          homeLogo: 'https://ext.same-assets.com/1855771146/1582388298.png',
          homeSpread: '-13.5',
          total: 'T:44.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'MIN Vikings',
          awayLogo: 'https://ext.same-assets.com/1855771146/872866411.png',
          awaySpread: '',
          homeTeam: 'DET Lions',
          homeLogo: 'https://ext.same-assets.com/1855771146/2139754174.png',
          homeSpread: '-8.5',
          total: 'T:48.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'LA Chargers',
          awayLogo: 'https://ext.same-assets.com/1855771146/3654297104.png',
          awaySpread: '-9.5',
          homeTeam: 'TEN Titans',
          homeLogo: 'https://ext.same-assets.com/1855771146/1957419221.png',
          homeSpread: '',
          total: 'T:43.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'ATL Falcons',
          awayLogo: 'https://ext.same-assets.com/1855771146/1804082901.png',
          awaySpread: '',
          homeTeam: 'NE Patriots',
          homeLogo: 'https://ext.same-assets.com/1855771146/3562802611.png',
          homeSpread: '-4.5',
          total: 'T:44.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'CHI Bears',
          awayLogo: 'https://ext.same-assets.com/1855771146/4100422768.png',
          awaySpread: '-2.5',
          homeTeam: 'CIN Bengals',
          homeLogo: 'https://ext.same-assets.com/1855771146/4169319195.png',
          homeSpread: '',
          total: 'T:50.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'JAX Jaguars',
          awayLogo: 'https://ext.same-assets.com/1855771146/468638558.png',
          awaySpread: '-2.5',
          homeTeam: 'LV Raiders',
          homeLogo: 'https://ext.same-assets.com/1855771146/2564976890.png',
          homeSpread: '',
          total: 'T:44.5',
          time: '9:05 PM',
        },
        {
          awayTeam: 'NO Saints',
          awayLogo: 'https://ext.same-assets.com/1855771146/710206998.png',
          awaySpread: '',
          homeTeam: 'LA Rams',
          homeLogo: 'https://ext.same-assets.com/1855771146/119593563.png',
          homeSpread: '-14.5',
          total: 'T:43.5',
          time: '9:05 PM',
        },
        {
          awayTeam: 'KC Chiefs',
          awayLogo: 'https://ext.same-assets.com/1855771146/2904255030.png',
          awaySpread: '-2.5',
          homeTeam: 'BUF Bills',
          homeLogo: 'https://ext.same-assets.com/1855771146/970319941.png',
          homeSpread: '',
          total: 'T:52.5',
          time: '9:25 PM',
        },
      ],
    },
    {
      date: 'Mon, Nov 3',
      games: [
        {
          awayTeam: 'SEA Seahawks',
          awayLogo: 'https://ext.same-assets.com/1855771146/1474426673.png',
          awaySpread: '-2.5',
          homeTeam: 'WSH Commanders',
          homeLogo: 'https://ext.same-assets.com/1855771146/2535842499.png',
          homeSpread: '',
          total: 'T:47.5',
          time: '1:20 AM',
        },
      ],
    },
    {
      date: 'Tue, Nov 4',
      games: [
        {
          awayTeam: 'ARI Cardinals',
          awayLogo: 'https://ext.same-assets.com/1855771146/1287119777.png',
          awaySpread: '',
          homeTeam: 'DAL Cowboys',
          homeLogo: 'https://ext.same-assets.com/1855771146/16901816.png',
          homeSpread: '-2.5',
          total: 'T:53.5',
          time: '1:15 AM',
        },
      ],
    },
  ],
  10: [
    {
      date: 'Thu, Nov 7',
      games: [
        {
          awayTeam: 'CIN Bengals',
          awayLogo: 'https://ext.same-assets.com/1855771146/4169319195.png',
          awaySpread: '-6.5',
          homeTeam: 'BAL Ravens',
          homeLogo: 'https://ext.same-assets.com/1855771146/2684254270.png',
          homeSpread: '',
          total: 'T:54.5',
          time: '8:15 PM',
        },
      ],
    },
    {
      date: 'Sun, Nov 10',
      games: [
        {
          awayTeam: 'BUF Bills',
          awayLogo: 'https://ext.same-assets.com/1855771146/970319941.png',
          awaySpread: '-3.5',
          homeTeam: 'IND Colts',
          homeLogo: 'https://ext.same-assets.com/1855771146/2388602772.png',
          homeSpread: '',
          total: 'T:46.5',
          time: '6:00 PM',
        },
        {
          awayTeam: 'NYG Giants',
          awayLogo: 'https://ext.same-assets.com/1855771146/454448804.png',
          awaySpread: '',
          homeTeam: 'CAR Panthers',
          homeLogo: 'https://ext.same-assets.com/1855771146/822562775.png',
          homeSpread: '-5.5',
          total: 'T:41.5',
          time: '6:00 PM',
        },
      ],
    },
  ],
};

const byeWeeks: Record<number, string[]> = {
  9: ['CLE', 'NYJ', 'PHI', 'TB'],
  10: ['DAL', 'HOU', 'KC', 'SF'],
};

// Team stats data (2024 NFL Season - Updated January 2025)
const teamStats = {
  'KC Chiefs': { wins: 15, losses: 2, pointsPerGame: 27.8, pointsAllowed: 18.4, rank: 1 },
  'BUF Bills': { wins: 13, losses: 4, pointsPerGame: 30.7, pointsAllowed: 22.1, rank: 2 },
  'BAL Ravens': { wins: 12, losses: 5, pointsPerGame: 27.2, pointsAllowed: 19.8, rank: 3 },
  'DET Lions': { wins: 12, losses: 5, pointsPerGame: 29.4, pointsAllowed: 23.8, rank: 4 },
  'PIT Steelers': { wins: 10, losses: 7, pointsPerGame: 25.6, pointsAllowed: 21.1, rank: 5 },
  'ATL Falcons': { wins: 11, losses: 6, pointsPerGame: 26.1, pointsAllowed: 22.9, rank: 6 },
  'SF 49ers': { wins: 9, losses: 8, pointsPerGame: 26.8, pointsAllowed: 25.4, rank: 7 },
  'HOU Texans': { wins: 10, losses: 7, pointsPerGame: 23.1, pointsAllowed: 20.3, rank: 8 },
  'WAS Commanders': { wins: 9, losses: 8, pointsPerGame: 24.0, pointsAllowed: 22.8, rank: 9 },
  'TB Buccaneers': { wins: 8, losses: 9, pointsPerGame: 23.1, pointsAllowed: 24.2, rank: 10 },
  'LAR Rams': { wins: 8, losses: 9, pointsPerGame: 24.6, pointsAllowed: 25.1, rank: 11 },
  'GB Packers': { wins: 8, losses: 9, pointsPerGame: 25.2, pointsAllowed: 23.1, rank: 12 },
  'MIA Dolphins': { wins: 8, losses: 9, pointsPerGame: 24.8, pointsAllowed: 24.1, rank: 13 },
  'ARI Cardinals': { wins: 7, losses: 10, pointsPerGame: 22.4, pointsAllowed: 26.0, rank: 14 },
  'CIN Bengals': { wins: 7, losses: 10, pointsPerGame: 22.9, pointsAllowed: 25.7, rank: 15 },
};

// Player stats data (2024 NFL Season - Updated January 2025)
const playerStats = {
  'Patrick Mahomes': {
    team: 'KC Chiefs',
    position: 'QB',
    passingYards: 4183,
    touchdowns: 41,
    interceptions: 12,
    rating: 105.8,
  },
  'Josh Allen': {
    team: 'BUF Bills',
    position: 'QB',
    passingYards: 4306,
    touchdowns: 36,
    interceptions: 14,
    rating: 101.6,
  },
  'Lamar Jackson': {
    team: 'BAL Ravens',
    position: 'QB',
    passingYards: 3678,
    touchdowns: 24,
    interceptions: 7,
    rating: 113.4,
    rushingYards: 1122,
    rushingTDs: 5,
  },
  'C.J. Stroud': {
    team: 'HOU Texans',
    position: 'QB',
    passingYards: 4108,
    touchdowns: 29,
    interceptions: 11,
    rating: 98.7,
  },
  'Christian McCaffrey': {
    team: 'SF 49ers',
    position: 'RB',
    rushingYards: 1389,
    rushingTDs: 10,
    receptions: 67,
    receivingYards: 493,
  },
  'James Cook': {
    team: 'BUF Bills',
    position: 'RB',
    rushingYards: 1221,
    rushingTDs: 8,
    receptions: 44,
    receivingYards: 361,
  },
  'Marquise Brown': {
    team: 'ARI Cardinals',
    position: 'WR',
    receptions: 89,
    receivingYards: 1251,
    receivingTDs: 7,
  },
  'Keon Coleman': {
    team: 'BUF Bills',
    position: 'WR',
    receptions: 62,
    receivingYards: 850,
    receivingTDs: 6,
  },
  'Drake London': {
    team: 'ATL Falcons',
    position: 'WR',
    receptions: 78,
    receivingYards: 1024,
    receivingTDs: 8,
  },
  'Rome Odunze': {
    team: 'CHI Bears',
    position: 'WR',
    receptions: 54,
    receivingYards: 776,
    receivingTDs: 4,
  },
};

export default function Home() {
  const [selectedWeek, setSelectedWeek] = useState(9);
  const [comparisonType, setComparisonType] = useState<'teams' | 'players'>('teams');
  const [firstSelection, setFirstSelection] = useState('');
  const [secondSelection, setSecondSelection] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);

  const getWeekDate = (week: number) => {
    // NFL season typically starts in September
    const startDate = new Date(2024, 8, 5); // September 5, 2024 (Thursday night football)
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (week - 1) * 7);
    return weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAIComparison = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      if (comparisonType === 'teams') {
        const team1 = teamStats[firstSelection as keyof typeof teamStats];
        const team2 = teamStats[secondSelection as keyof typeof teamStats];

        if (team1 && team2) {
          const analysis = await getAISportsAnalysis('NFL', 'teams', firstSelection, secondSelection, team1, team2);
          setAiAnalysis(analysis);
        }
      } else {
        const player1 = playerStats[firstSelection as keyof typeof playerStats];
        const player2 = playerStats[secondSelection as keyof typeof playerStats];

        if (player1 && player2) {
          const analysis = await getAISportsAnalysis('NFL', 'players', firstSelection, secondSelection, player1, player2);
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
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
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
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
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
                      Compare teams or players using advanced analytics and AI insights
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
                            ? Object.keys(teamStats).map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            : Object.keys(playerStats).map((player) => (
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
                            ? Object.keys(teamStats).map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            : Object.keys(playerStats).map((player) => (
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
            {weeks.map((week) => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedWeek === week
                    ? 'text-white border-b-2 border-blue-600'
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
        {gamesData[selectedWeek as keyof typeof gamesData]?.map((section, idx) => (
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

        {/* Bye Week */}
        {byeWeeks[selectedWeek] && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Bye Week</h2>
            <div className="flex gap-8">
              {byeWeeks[selectedWeek].map((team) => (
                <div key={team} className="text-zinc-400 font-medium">
                  {team}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No games message */}
        {!gamesData[selectedWeek as keyof typeof gamesData] && (
          <div className="text-center text-zinc-400 py-12">
            <p className="text-lg">No games scheduled for Week {selectedWeek}</p>
          </div>
        )}
      </main>
    </div>
  );
}
