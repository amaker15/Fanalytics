'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Menu, TrendingUp, Clock, User, ExternalLink, Sparkles } from 'lucide-react';
import SportsNavigation from '@/components/sports-navigation';
import { getAISportsAnalysis } from '@/lib/nebius';

// Sample news data
const newsArticles = [
  {
    id: 1,
    title: "Lamar Jackson's MVP Campaign Takes Center Stage",
    summary: "The Baltimore Ravens quarterback is having another historic season, leading the league in rushing yards and putting together one of the greatest seasons ever.",
    content: "Lamar Jackson continues to rewrite the quarterback position with his dual-threat ability. At 27 years old, Jackson has already amassed over 3,000 rushing yards in his career and looks poised to become the first QB to win MVP since Patrick Mahomes in 2018.",
    author: "Mike Silver",
    publishedAt: "2024-11-05T14:30:00Z",
    category: "NFL",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop",
    readTime: 3,
  },
  {
    id: 2,
    title: "NBA Trade Deadline Looms as Teams Evaluate Options",
    summary: "With the February 8th deadline approaching, several teams are actively shopping stars and young talent.",
    content: "The NBA trade deadline is shaping up to be one of the most active in recent memory. Teams like the Boston Celtics, Los Angeles Lakers, and Brooklyn Nets are all rumored to be involved in multiple deals that could reshape the Eastern Conference landscape.",
    author: "Zach Lowe",
    publishedAt: "2024-11-05T12:15:00Z",
    category: "NBA",
    image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&h=400&fit=crop",
    readTime: 5,
  },
  {
    id: 3,
    title: "College Football Playoff Committee Releases Initial Rankings",
    summary: "Georgia and Ohio State top the first rankings, with several teams jockeying for position.",
    content: "The College Football Playoff Committee has released its initial rankings for the 2024 season. Georgia Bulldogs sit atop the rankings at No. 1, followed closely by Ohio State. The top 12 teams will be invited to participate in the expanded playoff format.",
    author: "Brett McMurphy",
    publishedAt: "2024-11-05T10:45:00Z",
    category: "NCAA Football",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop",
    readTime: 4,
  },
  {
    id: 4,
    title: "MLB Free Agency Heating Up with Star Players Available",
    summary: "Several All-Stars including Shohei Ohtani and Yoshinobu Yamamoto are expected to hit the market.",
    content: "The MLB offseason is already generating significant buzz with several star players expected to become free agents. Shohei Ohtani, the two-way superstar, and Japanese pitcher Yoshinobu Yamamoto are among the most sought-after talents available.",
    author: "Jeff Passan",
    publishedAt: "2024-11-05T09:20:00Z",
    category: "MLB",
    image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=400&fit=crop",
    readTime: 6,
  },
  {
    id: 5,
    title: "Duke Basketball Opens Season with Strong Performance",
    summary: "The Blue Devils dominated early season opponents, showcasing their championship potential.",
    content: "Duke University opened their college basketball season with a convincing victory over their first three opponents. The team features several returning starters and highly touted recruits, positioning them as one of the favorites for the ACC title.",
    author: "Jay Bilas",
    publishedAt: "2024-11-04T16:30:00Z",
    category: "NCAA Basketball",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop",
    readTime: 3,
  },
  {
    id: 6,
    title: "NFL Week 9 Recap: Upsets and Standout Performances",
    summary: "Several underdogs pulled off major upsets while stars continued to shine across the league.",
    content: "Week 9 of the NFL season delivered plenty of excitement with multiple upsets shaking up the playoff picture. The Kansas City Chiefs, Baltimore Ravens, and Detroit Lions all remained undefeated, while several teams below .500 pulled off stunning victories.",
    author: "Adam Schefter",
    publishedAt: "2024-11-04T13:15:00Z",
    category: "NFL",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop",
    readTime: 7,
  },
];

const categories = ['All', 'NFL', 'NBA', 'NCAA Football', 'NCAA Basketball', 'MLB'];

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredArticles = selectedCategory === 'All'
    ? newsArticles
    : newsArticles.filter(article => article.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'NFL': return 'bg-blue-600';
      case 'NBA': return 'bg-orange-600';
      case 'NCAA Football': return 'bg-red-600';
      case 'NCAA Basketball': return 'bg-green-600';
      case 'MLB': return 'bg-blue-700';
      default: return 'bg-gray-600';
    }
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
                <TrendingUp className="h-6 w-6 text-purple-500" />
                <div className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  fanalytics
                </div>
              </div>
              <SportsNavigation />
            </div>
            <div className="flex items-center gap-4">
              <Tabs defaultValue="news" className="hidden md:block">
                <TabsList className="bg-transparent border-b border-zinc-800 rounded-none h-auto p-0">
                  <TabsTrigger
                    value="scores"
                    asChild
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    <Link href="/">SCORES</Link>
                  </TabsTrigger>
                  <TabsTrigger
                    value="news"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-3"
                  >
                    NEWS
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Compare
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-purple-500" />
                      AI Insights Coming Soon
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Stay tuned for AI-powered news summaries and personalized headlines.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="border-b border-zinc-800 bg-[#0b0b0e] sticky top-0 z-10">
        <ScrollArea className="w-full">
          <div className="flex px-4 py-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'text-white border-b-2 border-purple-600'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {selectedArticle ? (
          // Article Detail View
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setSelectedArticle(null)}
              className="mb-6 text-zinc-400 hover:text-white"
            >
              ← Back to News
            </Button>

            {(() => {
              const article = newsArticles.find(a => a.id === selectedArticle);
              if (!article) return null;

              return (
                <article className="space-y-6">
                  <div className="space-y-4">
                    <Badge className={`${getCategoryColor(article.category)} text-white`}>
                      {article.category}
                    </Badge>
                    <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime} min read</span>
                      </div>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>

                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-xl text-zinc-300 leading-relaxed mb-6">
                      {article.summary}
                    </p>
                    <div className="text-zinc-200 leading-relaxed space-y-4">
                      {article.content.split('\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })()}
          </div>
        ) : (
          // News List View
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Sports News</h1>
              <p className="text-zinc-400">Latest updates from across all major sports</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-900/70 transition-colors cursor-pointer group"
                  onClick={() => setSelectedArticle(article.id)}
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getCategoryColor(article.category)} text-white text-xs`}>
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-zinc-400 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}m</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-zinc-400 text-sm line-clamp-2">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{article.author}</span>
                      </div>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center text-zinc-400 py-12">
                <p className="text-lg">No articles found for {selectedCategory}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
