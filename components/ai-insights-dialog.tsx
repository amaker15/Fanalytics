'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Sparkles, Bot, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AIInsightsDialogProps {
    children?: React.ReactNode;
    initialQuery?: string;
}

export default function AIInsightsDialog({ children, initialQuery = '' }: AIInsightsDialogProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(initialQuery);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingChat, setIsLoadingChat] = useState(false);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoadingChat) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoadingChat(true);
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
            setIsLoadingChat(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Insights
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] bg-zinc-900 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Bot className="h-6 w-6 text-blue-500" />
                        AI Insights
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Ask me anything about sports! I can provide live scores, player stats, betting odds, and analysis.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Messages Area */}
                    <ScrollArea className="h-[400px] w-full pr-4">
                        <div className="space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-zinc-500 py-8">
                                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="mb-2">Start a conversation about sports!</p>
                                    <p className="text-sm">Try asking:</p>
                                    <div className="mt-4 space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuery("Show me today's scores")}
                                            className="text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 w-full"
                                        >
                                            Show me today&apos;s scores
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuery("Compare top players")}
                                            className="text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 w-full"
                                        >
                                            Compare top players
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuery("Get betting odds for today's games")}
                                            className="text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 w-full"
                                        >
                                            Get betting odds for today&apos;s games
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-lg px-4 py-2 ${message.role === 'user'
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
                            {isLoadingChat && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-800 text-zinc-200 rounded-lg px-4 py-2 max-w-[85%]">
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
                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask about sports scores, player stats, betting odds..."
                            className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                            disabled={isLoadingChat}
                        />
                        <Button
                            type="submit"
                            disabled={isLoadingChat || !query.trim()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {isLoadingChat ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
