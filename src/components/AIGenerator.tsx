'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  Tag,
  FileText,
  Target,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  Zap,
  Brain,
  Video,
  Clock,
  Eye,
} from 'lucide-react';
import { ChannelInfo, Video as VideoType, VideoIdea, NicheAnalysis } from '@/types/youtube';

// Declare puter as a global variable
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<string>;
      };
    };
  }
}

interface AIGeneratorProps {
  channelInfo: ChannelInfo | null;
  videos: VideoType[];
}

type ContentType = 'shorts' | 'full' | 'ideas' | 'viral';

interface ShortsIdea {
  title: string;
  hook: string;
  script: string;
  duration: string;
  hashtags: string[];
  trendScore: number;
  format: string;
}

interface GeneratedContent {
  titles?: string[];
  descriptions?: string[];
  tags?: string[];
  videoIdeas?: VideoIdea[];
  nicheAnalysis?: NicheAnalysis;
  shortsIdeas?: ShortsIdea[];
}

export default function AIGenerator({ channelInfo, videos }: AIGeneratorProps) {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>('shorts');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [puterLoaded, setPuterLoaded] = useState(false);

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

  const tabs = [
    { id: 'shorts' as const, label: 'YouTube Shorts', icon: Video },
    { id: 'full' as const, label: 'Full Videos', icon: Brain },
    { id: 'ideas' as const, label: 'Video Ideas', icon: Lightbulb },
    { id: 'viral' as const, label: 'Viral Analysis', icon: Target },
  ];

  const handleGenerate = async () => {
    if (!puterLoaded || !window.puter) {
      setError('AI is still loading. Please wait a moment and try again.');
      return;
    }

    if (!niche.trim()) {
      setError('Please enter a niche or topic to generate content.');
      return;
    }

    setLoading(true);
    setError(null);
    setContent(null);

    try {
      let prompt = '';
      
      if (activeTab === 'shorts') {
        prompt = `You are an expert YouTube Shorts content strategist. Generate 6 viral YouTube Shorts ideas for the niche: "${niche}".

For each Short, provide:
- A catchy title (max 60 characters, use emojis)
- A hook for the first 2 seconds
- A brief script outline (what happens in the Short)
- Duration suggestion (15s, 30s, or 60s)
- 5 trending hashtags
- A trend score (1-100)
- Format type (Tutorial, Challenge, POV, Storytime, Before/After, etc.)

${channelInfo ? `Channel context: ${channelInfo.title}` : ''}
${videos.length > 0 ? `Recent video themes: ${videos.slice(0, 3).map(v => v.title).join(', ')}` : ''}

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "shortsIdeas": [
    {
      "title": "🔥 Title here",
      "hook": "First 2 seconds hook",
      "script": "Brief outline of what happens",
      "duration": "30s",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
      "trendScore": 85,
      "format": "Tutorial"
    }
  ]
}`;
      } else if (activeTab === 'full') {
        prompt = `You are an expert YouTube content strategist. Generate comprehensive content recommendations for the niche: "${niche}".

${channelInfo ? `Channel: ${channelInfo.title}` : ''}
${videos.length > 0 ? `Recent videos: ${videos.slice(0, 3).map(v => v.title).join(', ')}` : ''}

RESPOND ONLY WITH VALID JSON:
{
  "titles": ["5 catchy, SEO-optimized video titles"],
  "descriptions": ["2 full video descriptions with keywords and CTAs"],
  "tags": ["20 relevant YouTube SEO tags"]
}`;
      } else if (activeTab === 'ideas') {
        prompt = `You are an expert YouTube content strategist. Generate 6 unique video content ideas for the niche: "${niche}".

${channelInfo ? `Channel: ${channelInfo.title}` : ''}

RESPOND ONLY WITH VALID JSON:
{
  "videoIdeas": [
    {
      "title": "Video title",
      "hook": "Attention-grabbing first 30 seconds",
      "outline": ["Point 1", "Point 2", "Point 3"],
      "estimatedViews": "10K-50K",
      "difficulty": "Easy",
      "trendScore": 85
    }
  ]
}`;
      } else if (activeTab === 'viral') {
        prompt = `You are an expert YouTube strategist. Analyze the best viral content strategy for: "${niche}".

${channelInfo ? `Channel: ${channelInfo.title}` : ''}
${videos.length > 0 ? `Current videos: ${videos.slice(0, 5).map(v => v.title).join(', ')}` : ''}

RESPOND ONLY WITH VALID JSON:
{
  "nicheAnalysis": {
    "recommendedNiche": "Specific niche recommendation",
    "reasoning": "Why this niche has viral potential",
    "competitionLevel": "Low",
    "growthPotential": "High",
    "trendingTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"]
  }
}`;
      }

      const response = await window.puter.ai.chat(prompt);
      
      // Parse the response - handle potential text around JSON
      let jsonStr = response;
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      const result = JSON.parse(jsonStr);
      setContent(result);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'High':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
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
    };
    return colors[format] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Content Generator</h2>
          <p className="text-sm text-gray-400">Powered by Puter AI - Generate viral YouTube content</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'border border-gray-700 bg-gray-800 text-gray-400 hover:border-purple-500/50 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label className="mb-2 block text-sm text-gray-400">Your Niche / Topic</label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g., Tech reviews, Gaming, Cooking tutorials, Fitness..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !puterLoaded}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 sm:self-end"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating...
            </>
          ) : (
            <>
              <Zap size={20} />
              Generate
            </>
          )}
        </button>
      </div>

      {/* Shorts Ideas Section */}
      {content?.shortsIdeas && content.shortsIdeas.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-800/50 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Video className="text-pink-400" size={18} />
            <h3 className="font-semibold text-white">YouTube Shorts Ideas</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.shortsIdeas.map((short, index) => (
              <div
                key={index}
                className="group rounded-xl border border-gray-700 bg-gray-900 p-4 transition-all hover:border-pink-500/50"
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
        </div>
      )}

      {/* Existing content sections */}
      {content && (
        <div className="space-y-6">
          {content.titles && content.titles.length > 0 && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-400" size={18} />
                <h3 className="font-semibold text-white">Generated Titles</h3>
              </div>
              <div className="space-y-2">
                {content.titles.map((title, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 p-3 transition-colors hover:border-purple-500/50"
                  >
                    <span className="text-gray-200">{title}</span>
                    <button
                      onClick={() => copyToClipboard(title, `title-${index}`)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      {copiedIndex === `title-${index}` ? (
                        <Check size={18} className="text-green-400" />
                      ) : (
                        <Copy size={18} className="text-gray-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.descriptions && content.descriptions.length > 0 && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="text-blue-400" size={18} />
                <h3 className="font-semibold text-white">Video Descriptions</h3>
              </div>
              <div className="space-y-4">
                {content.descriptions.map((desc, index) => (
                  <div
                    key={index}
                    className="group relative rounded-lg border border-gray-700 bg-gray-900 p-4"
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">{desc}</pre>
                    <button
                      onClick={() => copyToClipboard(desc, `desc-${index}`)}
                      className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      {copiedIndex === `desc-${index}` ? (
                        <Check size={18} className="text-green-400" />
                      ) : (
                        <Copy size={18} className="text-gray-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.tags && content.tags.length > 0 && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="text-green-400" size={18} />
                  <h3 className="font-semibold text-white">SEO Tags</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(content.tags!.join(', '), 'all-tags')}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                >
                  {copiedIndex === 'all-tags' ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy All
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-sm text-gray-300 transition-colors hover:border-green-500/50 hover:text-green-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {content.videoIdeas && content.videoIdeas.length > 0 && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" size={18} />
                <h3 className="font-semibold text-white">Video Ideas</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {content.videoIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-700 bg-gray-900 p-4 transition-all hover:border-yellow-500/50"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-white">{idea.title}</h4>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${getDifficultyColor(
                          idea.difficulty
                        )}`}
                      >
                        {idea.difficulty}
                      </span>
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
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
            </div>
          )}

          {content.nicheAnalysis && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Target className="text-cyan-400" size={18} />
                <h3 className="font-semibold text-white">Viral Analysis</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <p className="mb-1 text-sm text-gray-500">Recommended Niche</p>
                  <p className="text-lg font-semibold text-white">
                    {content.nicheAnalysis.recommendedNiche}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <p className="mb-2 text-sm text-gray-500">Market Analysis</p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Competition</p>
                      <p className={`font-semibold ${getCompetitionColor(content.nicheAnalysis.competitionLevel)}`}>
                        {content.nicheAnalysis.competitionLevel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Growth Potential</p>
                      <p className={`font-semibold ${getCompetitionColor(content.nicheAnalysis.growthPotential === 'High' ? 'Low' : content.nicheAnalysis.growthPotential === 'Low' ? 'High' : 'Medium')}`}>
                        {content.nicheAnalysis.growthPotential}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 md:col-span-2">
                  <p className="mb-2 text-sm text-gray-500">Why This Niche?</p>
                  <p className="text-gray-300">{content.nicheAnalysis.reasoning}</p>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 md:col-span-2">
                  <p className="mb-2 text-sm text-gray-500">Trending Topics to Cover</p>
                  <div className="flex flex-wrap gap-2">
                    {content.nicheAnalysis.trendingTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!content && !loading && !error && (
        <div className="py-12 text-center text-gray-500">
          <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
          <p>Enter your niche and click Generate to get AI-powered content suggestions</p>
          <p className="mt-2 text-sm text-gray-600">Powered by Puter AI - No API key required!</p>
        </div>
      )}
    </div>
  );
}
