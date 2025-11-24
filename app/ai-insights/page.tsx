/*
 * Fanalytics - AI Insights Page
 *
 * This page provides AI-powered sports analysis and insights using
 * integrated chatbot functionality with ESPN data and betting odds.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle,
  Send,
  Bot,
  TrendingUp,
  Users,
  Newspaper,
  Zap,
  Loader2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import SportsNavigation from '@/components/sports-navigation';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIInsightsPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'examples'>('chat');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage.content }),
      });

      const data = await response.json();

      if (data.ok) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQueries = [
    "Show me today's NFL scores",
    "How did the Lakers do last night?",
    "Compare Patrick Mahomes and Lamar Jackson fantasy stats",
    "Get betting odds for NBA games",
    "Show me Jalen Johnson's stats from last game",
    "What's the latest news about the Chiefs?",
    "Who are the top scorers in NBA this season?",
    "Show me MLB standings",
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-500" />
                <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  AI Insights
                </div>
              </div>
              <SportsNavigation />
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                <Bot className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-white">Sports AI Assistant</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === 'chat' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('chat')}
                      className="text-xs"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button
                      variant={activeTab === 'examples' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('examples')}
                      className="text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Examples
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-zinc-400">
                  Ask me anything about sports! I can provide live scores, player stats, betting odds, and analysis.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {activeTab === 'examples' ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-zinc-300">Try these example queries:</h3>
                    <div className="grid gap-2">
                      {exampleQueries.map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExampleClick(example)}
                          className="text-left justify-start text-zinc-300 hover:text-white hover:bg-zinc-800"
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages Area */}
                    <ScrollArea className="h-[400px] w-full pr-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center text-zinc-500 py-8">
                            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Start a conversation about sports!</p>
                            <p className="text-sm">Ask about scores, stats, odds, or analysis.</p>
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                  message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-zinc-800 text-zinc-200'
                                }`}
                              >
                                <div className="whitespace-pre-wrap text-sm">
                                  {message.content}
                                </div>
                                <div className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-zinc-800 text-zinc-200 rounded-lg px-4 py-2 max-w-[80%]">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about sports scores, player stats, betting odds..."
                        className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Live Scores</h4>
                      <p className="text-xs text-zinc-400">Real-time game scores and results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Player Stats</h4>
                      <p className="text-xs text-zinc-400">Detailed player performance data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Betting Odds</h4>
                      <p className="text-xs text-zinc-400">Current betting lines and spreads</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-sm font-medium text-white">AI Analysis</h4>
                      <p className="text-xs text-zinc-400">Intelligent insights and comparisons</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-yellow-500" />
                  Sports Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300">
                    NFL
                  </Badge>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300">
                    NBA
                  </Badge>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300">
                    MLB
                  </Badge>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300">
                    NHL
                  </Badge>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300">
                    NCAA FB
                  </Badge>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300">
                    NCAA BB
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-500" />
                  Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>ESPN</span>
                    <span className="text-green-400">✓ Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span>The Odds API</span>
                    <span className="text-green-400">✓ Odds</span>
                  </div>
                  <div className="flex justify-between">
                    <span>OpenAI</span>
                    <span className="text-blue-400">✓ AI</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
