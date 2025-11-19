'use client';

import { useState, useEffect } from 'react';
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
import { Menu, TrendingUp, Clock, User, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';
import SportsNavigation from '@/components/sports-navigation';
import { 
  getNFLNews, 
  getNBANews, 
  getNCAAFootballNews, 
  getNCAABasketballNews, 
  getMLBNews,
  ESPNNewsItem 
} from '@/lib/espn';

const categories = ['All', 'NFL', 'NBA', 'NCAA Football', 'NCAA Basketball', 'MLB'];

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<ESPNNewsItem | null>(null);
  const [articles, setArticles] = useState<ESPNNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        let newsItems: ESPNNewsItem[] = [];

        if (selectedCategory === 'All') {
          const [nfl, nba, ncaaf, ncaab, mlb] = await Promise.all([
            getNFLNews(),
            getNBANews(),
            getNCAAFootballNews(),
            getNCAABasketballNews(),
            getMLBNews()
          ]);

          // Tag articles with their source category for display
          const tagArticles = (items: ESPNNewsItem[], category: string) => 
            items.map(item => ({ ...item, _category: category }));

          newsItems = [
            ...tagArticles(nfl.articles, 'NFL'),
            ...tagArticles(nba.articles, 'NBA'),
            ...tagArticles(ncaaf.articles, 'NCAA Football'),
            ...tagArticles(ncaab.articles, 'NCAA Basketball'),
            ...tagArticles(mlb.articles, 'MLB')
          ];

          // Sort by date (newest first)
          newsItems.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
        } else {
          let response;
          switch (selectedCategory) {
            case 'NFL': response = await getNFLNews(); break;
            case 'NBA': response = await getNBANews(); break;
            case 'NCAA Football': response = await getNCAAFootballNews(); break;
            case 'NCAA Basketball': response = await getNCAABasketballNews(); break;
            case 'MLB': response = await getMLBNews(); break;
            default: response = { articles: [], header: '' };
          }
          // Tag articles
          newsItems = response.articles.map(item => ({ ...item, _category: selectedCategory }));
        }

        setArticles(newsItems);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);

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

  // Helper to get the best image url
  const getImageUrl = (article: ESPNNewsItem) => {
    if (article.images && article.images.length > 0) {
      return article.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop'; // Fallback
  };

  // Helper to get category (either from our tag or infer it)
  const getArticleCategory = (article: any) => {
    return article._category || selectedCategory;
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
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedArticle(null);
                }}
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-zinc-400">Loading news...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">
            <p className="text-lg">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Try Again
            </Button>
          </div>
        ) : selectedArticle ? (
          // Article Detail View
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setSelectedArticle(null)}
              className="mb-6 text-zinc-400 hover:text-white"
            >
              ← Back to News
            </Button>

            <article className="space-y-6">
              <div className="space-y-4">
                <Badge className={`${getCategoryColor(getArticleCategory(selectedArticle))} text-white`}>
                  {getArticleCategory(selectedArticle)}
                </Badge>
                <h1 className="text-4xl font-bold leading-tight">{selectedArticle.headline}</h1>
                <div className="flex items-center gap-4 text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(selectedArticle.published)}</span>
                  </div>
                </div>
              </div>

              <div className="aspect-video w-full rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(selectedArticle)}
                  alt={selectedArticle.headline}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-zinc-300 leading-relaxed mb-6">
                  {selectedArticle.description}
                </p>
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold mb-2">Read Full Article</h3>
                  <p className="text-zinc-400 mb-4">
                    Read the complete story on ESPN.
                  </p>
                  {selectedArticle.links?.web?.href && (
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <a href={selectedArticle.links.web.href} target="_blank" rel="noopener noreferrer">
                        Read on ESPN <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </article>
          </div>
        ) : (
          // News List View
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Sports News</h1>
              <p className="text-zinc-400">Latest updates from across all major sports</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <article
                  key={`${article.headline}-${index}`}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-900/70 transition-colors cursor-pointer group flex flex-col"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img
                      src={getImageUrl(article)}
                      alt={article.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`${getCategoryColor(getArticleCategory(article))} text-white text-xs`}>
                        {getArticleCategory(article)}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {article.headline}
                    </h3>

                    <p className="text-zinc-400 text-sm line-clamp-3 flex-1">
                      {article.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 mt-auto border-t border-zinc-800">
                      <span>{formatDate(article.published)}</span>
                      <span className="flex items-center gap-1 text-purple-400 group-hover:underline">
                        Read More <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {articles.length === 0 && (
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
