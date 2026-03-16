'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Trash2,
} from 'lucide-react';
import { ChannelInfo, Video as VideoType } from '@/types/youtube';
import { formatNumber } from '@/lib/youtube';

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<{ message: { content: string } } | string>;
      };
    };
  }
}

interface AIChatProps {
  channelInfo: ChannelInfo | null;
  videos: VideoType[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: 'Trending ideas for my niche', prompt: 'What are the most trending video ideas right now that would fit my channel niche? Give me 5 ideas with estimated view counts.' },
  { icon: Lightbulb, label: 'Viral content strategy', prompt: 'Analyze my channel and create a viral content strategy. What types of videos should I be making to maximize views and subscriber growth?' },
  { icon: Sparkles, label: 'Best titles & thumbnails', prompt: 'Based on my best performing videos, what title formulas and thumbnail strategies should I use for my next 5 videos? Be very specific.' },
];

export default function AIChat({ channelInfo, videos }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [puterLoaded, setPuterLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => setPuterLoaded(true);
      document.head.appendChild(script);
    } else if (typeof window !== 'undefined' && window.puter) {
      setPuterLoaded(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    const channelCtx = channelInfo
      ? `CHANNEL INFO:
- Name: "${channelInfo.title}"
- Subscribers: ${formatNumber(channelInfo.statistics.subscriberCount)}
- Total Views: ${formatNumber(channelInfo.statistics.viewCount)}
- Total Videos: ${channelInfo.statistics.videoCount}
- Description: ${channelInfo.description?.substring(0, 300) || 'N/A'}`
      : 'No channel data available';

    const videoCtx = videos.length > 0
      ? `\nRECENT VIDEO PERFORMANCE (study these carefully):
${videos.slice(0, 10).map(v => {
        const views = parseInt(v.statistics.viewCount || '0');
        const likes = parseInt(v.statistics.likeCount || '0');
        const engagement = views > 0 ? ((likes / views) * 100).toFixed(2) : '0';
        return `- "${v.title}" → ${formatNumber(views)} views, ${formatNumber(likes)} likes, ${engagement}% engagement${v.tags ? `, tags: [${v.tags.slice(0, 8).join(', ')}]` : ''}${v.description ? `, desc: "${v.description.substring(0, 100)}..."` : ''}`;
      }).join('\n')}`
      : '';

    const avgViews = videos.length > 0
      ? Math.round(videos.reduce((acc, v) => acc + parseInt(v.statistics.viewCount || '0'), 0) / videos.length)
      : 0;
    const avgLikes = videos.length > 0
      ? Math.round(videos.reduce((acc, v) => acc + parseInt(v.statistics.likeCount || '0'), 0) / videos.length)
      : 0;

    return `You are a YouTube growth expert AI assistant. You deeply study YouTube niches, trends, and analytics. You have access to this creator's channel data:

${channelCtx}
${videoCtx}

ANALYTICS:
- Average views per video: ${formatNumber(avgViews)}
- Average likes per video: ${formatNumber(avgLikes)}

YOUR ROLE:
1. Study this channel's content style, niche, titles, tags, and performance patterns
2. Give SPECIFIC, ACTIONABLE advice based on their ACTUAL data
3. When suggesting video ideas, predict REALISTIC view counts based on their channel size and past performance
4. Analyze YouTube trends that match THEIR specific niche
5. Be specific about WHY certain content would perform well for THEM
6. Consider their subscriber count when estimating views — be realistic
7. Format responses clearly with bullet points, numbers, and bold text for readability

IMPORTANT: Your view predictions must be based on their actual average views (${formatNumber(avgViews)}). Don't give unrealistically high or low numbers. A good viral video for their channel would be 3-10x their average.`;
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;
    if (!puterLoaded || !window.puter) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const context = buildContext();
      const conversationHistory = messages.slice(-6).map(m =>
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n\n');

      const fullPrompt = `${context}

${conversationHistory ? `CONVERSATION SO FAR:\n${conversationHistory}\n\n` : ''}User: ${text}

Respond helpfully. Use markdown formatting (bold, bullets, numbered lists). Be specific and data-driven based on their channel. When predicting views, always reference their average of ${formatNumber(
        videos.length > 0 ? Math.round(videos.reduce((acc, v) => acc + parseInt(v.statistics.viewCount || '0'), 0) / videos.length) : 0
      )} views per video as a baseline.`;

      const response = await window.puter.ai.chat(fullPrompt, { model: 'claude-sonnet-4-20250514' });

      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (response?.message?.content && typeof response.message.content === 'string') {
        responseText = response.message.content;
      } else if (response && typeof response === 'object') {
        responseText = JSON.stringify(response);
      }

      // Ensure it's always a string
      responseText = String(responseText || '');

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || 'Sorry, I could not generate a response. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI Chat error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Error generating response. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatMessageContent = (content: string) => {
    // Safety: ensure content is a string
    const text = String(content || '');
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^(\d+\.\s)/gm, '<span class="text-purple-400 font-bold">$1</span>')
      .replace(/^[-•]\s/gm, '<span class="text-purple-400">• </span>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-gray-800 bg-gray-900/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 p-2">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">AI Content Advisor</h2>
            <p className="text-xs text-gray-400">Chat about content ideas • Powered by Claude Sonnet 4</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-6">
              <Bot className="mx-auto mb-3 h-10 w-10 text-indigo-400" />
              <h3 className="mb-1 text-center font-semibold text-white">Ask me anything about your channel</h3>
              <p className="text-center text-sm text-gray-400">
                I study your niche, analyze trends, and give you data-driven content ideas with realistic view predictions.
              </p>
            </div>

            <div className="w-full max-w-lg space-y-2">
              <p className="mb-2 text-center text-xs font-medium text-gray-500">Quick Starters</p>
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(qp.prompt)}
                  disabled={!puterLoaded}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-left text-sm text-gray-300 transition-all hover:border-indigo-500/50 hover:bg-gray-800 hover:text-white disabled:opacity-50"
                >
                  <qp.icon size={18} className="shrink-0 text-indigo-400" />
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="mt-1 shrink-0 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 p-1.5">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
                      : 'border border-gray-700 bg-gray-800/50 text-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="mt-1 shrink-0 rounded-lg bg-gray-700 p-1.5">
                    <User size={16} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="mt-1 shrink-0 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 p-1.5">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="rounded-2xl border border-gray-700 bg-gray-800/50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="animate-spin" size={16} />
                    Analyzing your channel and thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-6 py-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={puterLoaded ? "Ask about content ideas, trending topics, view predictions..." : "Loading AI..."}
            disabled={!puterLoaded || loading}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || !puterLoaded}
            className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 p-3 text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
