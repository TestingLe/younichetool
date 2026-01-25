'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { ChannelInfo, Video, VideoIdea, NicheAnalysis } from '@/types/youtube';

interface AIGeneratorProps {
  channelInfo: ChannelInfo | null;
  videos: Video[];
}

type ContentType = 'full' | 'titles' | 'ideas' | 'niche';

interface GeneratedContent {
  titles?: string[];
  descriptions?: string[];
  tags?: string[];
  videoIdeas?: VideoIdea[];
  nicheAnalysis?: NicheAnalysis;
}

export default function AIGenerator({ channelInfo, videos }: AIGeneratorProps) {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>('full');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'full' as const, label: 'Full Analysis', icon: Brain },
    { id: 'titles' as const, label: 'Titles', icon: Sparkles },
    { id: 'ideas' as const, label: 'Video Ideas', icon: Lightbulb },
    { id: 'niche' as const, label: 'Niche Analysis', icon: Target },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelInfo,
          videos,
          niche,
          contentType: activeTab,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setContent(data);
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

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Content Generator</h2>
          <p className="text-sm text-gray-400">Powered by GPT-4 for viral content ideas</p>
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
            placeholder="e.g., Tech reviews, Gaming, Cooking tutorials..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
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
                <h3 className="font-semibold text-white">Niche Analysis</h3>
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
        </div>
      )}
    </div>
  );
}
