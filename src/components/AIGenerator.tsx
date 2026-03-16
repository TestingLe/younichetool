'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  Zap,
  Video,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { ChannelInfo, Video as VideoType } from '@/types/youtube';

// Declare puter as a global variable
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<{ message: { content: string } } | string>;
      };
    };
  }
}

interface AIGeneratorProps {
  channelInfo: ChannelInfo | null;
  videos: VideoType[];
}

interface ShortsIdea {
  title: string;
  hook: string;
  script: string;
  duration: string;
  hashtags: string[];
  trendScore: number;
  format: string;
}

interface VideoIdea {
  title: string;
  hook: string;
  outline: string[];
  estimatedViews: string;
  trendScore: number;
}

interface GeneratedContent {
  shortsIdeas?: ShortsIdea[];
  videoIdeas?: VideoIdea[];
}

export default function AIGenerator({ channelInfo, videos }: AIGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [puterLoaded, setPuterLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'shorts' | 'videos'>('shorts');

  // Derive niche from channel info and videos
  const detectedNiche = channelInfo?.title ||
    (videos.length > 0 ? videos.slice(0, 3).map(v => v.title).join(', ') : 'General Content');

  // Load Puter.js script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        setPuterLoaded(true);
      };
      document.head.appendChild(script);
    } else if (typeof window !== 'undefined' && window.puter) {
      setPuterLoaded(true);
    }
  }, []);

  // Auto-generate on load when puter is ready and we have channel info
  useEffect(() => {
    if (puterLoaded && channelInfo && !content && !loading) {
      handleGenerate();
    }
  }, [puterLoaded, channelInfo]);

  const handleGenerate = async () => {
    if (!puterLoaded || !window.puter) {
      setError('AI is still loading. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const nicheContext = channelInfo
        ? `Channel: "${channelInfo.title}"
Subscribers: ${channelInfo.statistics.subscriberCount}
Total Views: ${channelInfo.statistics.viewCount}
Total Videos: ${channelInfo.statistics.videoCount}
Channel Description: ${channelInfo.description?.substring(0, 300) || 'N/A'}`
        : 'General YouTube content';

      const avgViews = videos.length > 0
        ? Math.round(videos.reduce((acc, v) => acc + parseInt(v.statistics.viewCount || '0'), 0) / videos.length)
        : 0;

      const videoContext = videos.length > 0
        ? `Recent videos with FULL data (study ALL of this):
${videos.slice(0, 10).map(v => {
          const views = parseInt(v.statistics.viewCount || '0');
          const likes = parseInt(v.statistics.likeCount || '0');
          const engagement = views > 0 ? ((likes / views) * 100).toFixed(2) : '0';
          return `- Title: "${v.title}"
  Views: ${views} | Likes: ${likes} | Engagement: ${engagement}%
  Tags: [${(v.tags || []).slice(0, 8).join(', ')}]
  Description: "${(v.description || '').substring(0, 120)}..."`;
        }).join('\n')}

Average views per video: ${avgViews}`
        : '';

      const prompt = `You are a YouTube content cloner and niche expert. Study this channel's EXACT content style deeply.

${nicheContext}

${videoContext}

CRITICAL DEEP ANALYSIS:
1. Study EVERY title above — what is the EXACT structure, word choice, length, capitalization, emoji usage?
2. Study the TAGS — what niche keywords do they repeatedly use?
3. Study the DESCRIPTIONS — what tone, call-to-actions, and style do they use?
4. Study the ENGAGEMENT — which videos got the most views/likes? WHY?
5. What is their content FORMAT? (memes, edits, tutorials, vlogs, reactions, compilations, etc.)
6. What TOPICS within their niche perform best?

STRICT CLONING RULES:
- Your new titles MUST look like they came from the SAME CHANNEL
- Copy the EXACT title structure, word patterns, and tone
- If they use short meme titles, YOU use short meme titles
- If they use "when X does Y" format, YOU use that format
- Match their capitalization and punctuation style exactly
- Tags must match their actual niche keywords
- Estimated views must be REALISTIC based on their average of ${avgViews} views
- A viral video for them = 3-10x their average (${avgViews * 3}-${avgViews * 10} views)
- DO NOT use generic YouTube formats that don't match their style
- ONLY use formats their titles already use

Generate:
- 5 YouTube Shorts ideas (CLONE their title style exactly)
- 4 Full video ideas (CLONE their title style exactly)

RESPOND ONLY WITH VALID JSON:
{
  "shortsIdeas": [
    {
      "title": "Title that matches their exact style and format",
      "hook": "First 2 seconds hook matching their content tone",
      "script": "Brief outline matching how their videos flow",
      "duration": "30s",
      "hashtags": ["relevant", "to", "their", "specific", "niche"],
      "trendScore": 90,
      "format": "Their actual format type"
    }
  ],
  "videoIdeas": [
    {
      "title": "Title matching their naming style",
      "hook": "Opening that fits their video style",
      "outline": ["Matching", "Their", "Video", "Structure"],
      "estimatedViews": "Realistic range based on their ${avgViews} avg",
      "trendScore": 85
    }
  ]
}`;

      const response = await window.puter.ai.chat(prompt, { model: 'claude-sonnet-4-20250514' });

      // Handle different response formats from Puter AI
      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (response && typeof response === 'object') {
        // Handle object response with message.content
        if (response.message && typeof response.message.content === 'string') {
          responseText = response.message.content;
        } else if (response.message && Array.isArray(response.message.content)) {
          responseText = response.message.content.map((c: any) => c.text || '').join('\n');
        } else if ((response as Record<string, unknown>).content && typeof (response as Record<string, unknown>).content === 'string') {
          responseText = (response as Record<string, unknown>).content as string;
        } else if ((response as Record<string, unknown>).text && typeof (response as Record<string, unknown>).text === 'string') {
          responseText = (response as Record<string, unknown>).text as string;
        } else if (Array.isArray(response)) {
          // Handle array responses
          const firstItem = response[0];
          if (firstItem?.message?.content && typeof firstItem.message.content === 'string') {
            responseText = firstItem.message.content;
          } else if (typeof firstItem === 'string') {
            responseText = firstItem;
          } else {
            responseText = JSON.stringify(response);
          }
        } else {
          // Try to stringify and use as-is
          responseText = JSON.stringify(response);
        }
      }

      // Ensure responseText is always a string
      responseText = String(responseText || '');

      if (!responseText || responseText === 'undefined' || responseText === 'null') {
        console.error('Empty response from AI:', response);
        throw new Error('Empty response from AI');
      }

      // Extract JSON from response - try to find the JSON object
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          setContent(result);
        } catch (parseErr) {
          console.error('JSON parse error:', parseErr, 'Text:', responseText.substring(0, 200));
          throw new Error('Could not parse AI response as JSON');
        }
      } else {
        console.error('No JSON found in response:', responseText.substring(0, 200));
        throw new Error('Could not find JSON in AI response');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate content. Click refresh to try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'Tutorial': 'bg-blue-500/20 text-blue-400',
      'Challenge': 'bg-pink-500/20 text-pink-400',
      'POV': 'bg-purple-500/20 text-purple-400',
      'Storytime': 'bg-orange-500/20 text-orange-400',
      'Before/After': 'bg-cyan-500/20 text-cyan-400',
      'Tips': 'bg-green-500/20 text-green-400',
      'Reaction': 'bg-red-500/20 text-red-400',
      'Review': 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[format] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Content Ideas</h2>
            <p className="text-sm text-gray-400">Based on your channel: {detectedNiche}</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !puterLoaded}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Refresh Ideas
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('shorts')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'shorts'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'border border-gray-700 bg-gray-800 text-gray-400 hover:border-purple-500/50 hover:text-white'
            }`}
        >
          <Video size={16} />
          YouTube Shorts
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'videos'
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'border border-gray-700 bg-gray-800 text-gray-400 hover:border-purple-500/50 hover:text-white'
            }`}
        >
          <Lightbulb size={16} />
          Video Ideas
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <p className="text-gray-400">Generating content ideas based on your channel...</p>
        </div>
      )}

      {/* Shorts Ideas */}
      {!loading && activeTab === 'shorts' && content?.shortsIdeas && content.shortsIdeas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {content.shortsIdeas.map((short, index) => (
            <div
              key={index}
              className="group rounded-xl border border-gray-700 bg-gray-800/50 p-4 transition-all hover:border-pink-500/50"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h4 className="font-semibold text-white line-clamp-2">{short.title}</h4>
                <button
                  onClick={() => copyToClipboard(`${short.title}\n\n${short.script}\n\n${short.hashtags.map(h => '#' + h).join(' ')}`, `short-${index}`)}
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {copiedIndex === `short-${index}` ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-gray-400 hover:text-white" />
                  )}
                </button>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${getFormatColor(short.format)}`}>
                  {short.format}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                  <Clock size={12} />
                  {short.duration}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-purple-400 mb-1">🎣 Hook:</p>
                <p className="text-sm text-gray-300">{short.hook}</p>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-blue-400 mb-1">📝 Script:</p>
                <p className="text-sm text-gray-400 line-clamp-3">{short.script}</p>
              </div>

              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {short.hashtags.slice(0, 4).map((tag, i) => (
                    <span key={i} className="text-xs text-cyan-400">#{tag}</span>
                  ))}
                  {short.hashtags.length > 4 && (
                    <span className="text-xs text-gray-500">+{short.hashtags.length - 4}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-sm text-green-400">{short.trendScore}%</span>
                </div>
                <span className="text-xs text-gray-500">Trend Score</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Ideas */}
      {!loading && activeTab === 'videos' && content?.videoIdeas && content.videoIdeas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {content.videoIdeas.map((idea, index) => (
            <div
              key={index}
              className="group rounded-xl border border-gray-700 bg-gray-800/50 p-4 transition-all hover:border-yellow-500/50"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h4 className="font-semibold text-white">{idea.title}</h4>
                <button
                  onClick={() => copyToClipboard(`${idea.title}\n\nHook: ${idea.hook}\n\nOutline:\n${idea.outline.map((p, i) => `${i + 1}. ${p}`).join('\n')}`, `video-${index}`)}
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {copiedIndex === `video-${index}` ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-gray-400 hover:text-white" />
                  )}
                </button>
              </div>

              <p className="mb-3 text-sm text-gray-400">
                <strong className="text-gray-300">Hook:</strong> {idea.hook}
              </p>

              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-gray-500">Outline:</p>
                <ul className="space-y-1 text-sm text-gray-400">
                  {idea.outline.map((point, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                <span className="text-sm text-gray-500">
                  Est. Views: <span className="text-gray-300">{idea.estimatedViews}</span>
                </span>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-green-400">{idea.trendScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={handleGenerate}
            className="mt-3 text-sm text-red-300 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!content && !loading && !error && (
        <div className="py-12 text-center text-gray-500">
          <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
          <p>Loading AI content ideas...</p>
          <p className="mt-2 text-sm text-gray-600">Powered by Puter AI</p>
        </div>
      )}
    </div>
  );
}
