'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image';
import {
  Users,
  Eye,
  Video,
  ThumbsUp,
  Youtube,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import AnalyticsChart from '@/components/AnalyticsChart';
import VideoCard from '@/components/VideoCard';
import TrendingSection from '@/components/TrendingSection';
import AIGenerator from '@/components/AIGenerator';
import SettingsPanel from '@/components/SettingsPanel';
import { ChannelInfo, Video as VideoType } from '@/types/youtube';
import { formatNumber, getChannelStats, getChannelVideos } from '@/lib/youtube';

const generateMockAnalytics = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 10000) + 5000,
      subscribers: Math.floor(Math.random() * 100) + 20,
      likes: Math.floor(Math.random() * 500) + 100,
    });
  }
  return data;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyticsData] = useState(generateMockAnalytics());

  const fetchChannelData = useCallback(async () => {
    if (!session?.accessToken) return;

    // Check if there's a token refresh error
    if ((session as { error?: string }).error === 'RefreshAccessTokenError') {
      console.error('Token refresh failed, please sign in again');
      signIn('google');
      return;
    }

    setLoading(true);
    try {
      const channel = await getChannelStats(session.accessToken);
      setChannelInfo(channel);
      if (channel) {
        const channelVideos = await getChannelVideos(session.accessToken, channel.id, 12);
        setVideos(channelVideos);
      }
    } catch (error) {
      console.error('Error fetching channel data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchChannelData();
    }
  }, [session?.accessToken, fetchChannelData]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-purple-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
          <div className="mb-8 flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-red-600 to-red-500 p-4 shadow-lg shadow-red-500/30">
              <Youtube className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">YT Stats</h1>
              <p className="text-gray-400">YouTube Analytics Dashboard</p>
            </div>
          </div>

          <div className="mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-5xl font-bold leading-tight text-white">
              Grow Your YouTube Channel with{' '}
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                AI-Powered
              </span>{' '}
              Insights
            </h2>
            <p className="text-lg text-gray-400">
              Track your channel stats, discover trending content, and get AI-generated video ideas,
              titles, descriptions, and tags to maximize your reach.
            </p>
          </div>

          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Eye, title: 'Track Stats', desc: 'Real-time channel analytics' },
              { icon: TrendingUp, title: 'Trending Ideas', desc: 'Discover whats hot' },
              { icon: Sparkles, title: 'AI Generator', desc: 'Viral titles & tags' },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-4 w-fit rounded-xl bg-gradient-to-r from-red-600/20 to-pink-600/20 p-3">
                  <feature.icon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="mb-1 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => signIn('google')}
            className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-8 py-4 font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/40"
          >
            <Image
              src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
              alt="Google"
              width={24}
              height={24}
              className="rounded-full"
            />
            Sign in with Google
            <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Connect your YouTube channel to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="lg:ml-64">
        <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {channelInfo && (
                    <div className="mb-8 flex flex-wrap items-center gap-4">
                      <Image
                        src={channelInfo.thumbnails.medium.url}
                        alt={channelInfo.title}
                        width={80}
                        height={80}
                        className="rounded-full ring-4 ring-red-500/30"
                      />
                      <div>
                        <h1 className="text-2xl font-bold text-white">{channelInfo.title}</h1>
                        <p className="text-gray-400">{channelInfo.customUrl}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                      title="Subscribers"
                      value={channelInfo ? formatNumber(channelInfo.statistics.subscriberCount) : '0'}
                      icon={Users}
                      trend={{ value: 12.5, isPositive: true }}
                      color="red"
                    />
                    <StatsCard
                      title="Total Views"
                      value={channelInfo ? formatNumber(channelInfo.statistics.viewCount) : '0'}
                      icon={Eye}
                      trend={{ value: 8.2, isPositive: true }}
                      color="blue"
                    />
                    <StatsCard
                      title="Total Videos"
                      value={channelInfo ? formatNumber(channelInfo.statistics.videoCount) : '0'}
                      icon={Video}
                      color="green"
                    />
                    <StatsCard
                      title="Avg. Likes"
                      value={videos.length > 0 ? formatNumber(
                        Math.round(
                          videos.reduce((acc, v) => acc + parseInt(v.statistics.likeCount || '0'), 0) / videos.length
                        )
                      ) : '0'}
                      icon={ThumbsUp}
                      color="purple"
                    />
                  </div>

                  <AnalyticsChart data={analyticsData} />

                  {videos.length > 0 && (
                    <>
                      {/* Top Videos by Likes */}
                      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-2">
                            <ThumbsUp className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-xl font-bold text-white">Top Videos by Likes</h2>
                        </div>
                        <div className="space-y-3">
                          {[...videos]
                            .sort((a, b) => parseInt(b.statistics.likeCount || '0') - parseInt(a.statistics.likeCount || '0'))
                            .slice(0, 5)
                            .map((video, index) => (
                              <a
                                key={video.id}
                                href={`https://youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 rounded-xl border border-gray-700 bg-gray-800/50 p-3 transition-all hover:border-pink-500/50 hover:bg-gray-800"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-sm font-bold text-white">
                                  {index + 1}
                                </div>
                                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg">
                                  <Image
                                    src={video.thumbnails.medium?.url || video.thumbnails.default?.url}
                                    alt={video.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate text-sm font-medium text-white">{video.title}</h3>
                                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1 text-pink-400">
                                      <ThumbsUp size={12} />
                                      {formatNumber(video.statistics.likeCount || '0')} likes
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye size={12} />
                                      {formatNumber(video.statistics.viewCount || '0')} views
                                    </span>
                                  </div>
                                </div>
                              </a>
                            ))}
                        </div>
                      </div>

                      {/* Top Videos by Views */}
                      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-2">
                            <Eye className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-xl font-bold text-white">Top Videos by Views</h2>
                        </div>
                        <div className="space-y-3">
                          {[...videos]
                            .sort((a, b) => parseInt(b.statistics.viewCount || '0') - parseInt(a.statistics.viewCount || '0'))
                            .slice(0, 5)
                            .map((video, index) => (
                              <a
                                key={video.id}
                                href={`https://youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 rounded-xl border border-gray-700 bg-gray-800/50 p-3 transition-all hover:border-blue-500/50 hover:bg-gray-800"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-sm font-bold text-white">
                                  {index + 1}
                                </div>
                                <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg">
                                  <Image
                                    src={video.thumbnails.medium?.url || video.thumbnails.default?.url}
                                    alt={video.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate text-sm font-medium text-white">{video.title}</h3>
                                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1 text-blue-400">
                                      <Eye size={12} />
                                      {formatNumber(video.statistics.viewCount || '0')} views
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <ThumbsUp size={12} />
                                      {formatNumber(video.statistics.likeCount || '0')} likes
                                    </span>
                                  </div>
                                </div>
                              </a>
                            ))}
                        </div>
                      </div>

                      {/* Recent Videos */}
                      <div>
                        <h2 className="mb-4 text-xl font-bold text-white">Recent Videos</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {videos.slice(0, 4).map((video) => (
                            <VideoCard key={video.id} video={video} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'videos' && (
                <div>
                  <h1 className="mb-6 text-2xl font-bold text-white">My Videos</h1>
                  {videos.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-500">
                      <Video size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No videos found. Upload some content to see them here!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'trending' && <TrendingSection />}

              {activeTab === 'ai' && <AIGenerator channelInfo={channelInfo} videos={videos} />}

              {activeTab === 'settings' && <SettingsPanel />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
