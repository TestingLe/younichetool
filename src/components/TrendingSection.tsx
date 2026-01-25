'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TrendingUp, Eye, ThumbsUp, Play, Globe, Filter } from 'lucide-react';
import { TrendingVideo } from '@/types/youtube';
import { formatNumber, getTimeAgo } from '@/lib/youtube';

const categories = [
  { id: '0', name: 'All' },
  { id: '10', name: 'Music' },
  { id: '20', name: 'Gaming' },
  { id: '24', name: 'Entertainment' },
  { id: '28', name: 'Science & Tech' },
  { id: '22', name: 'People & Blogs' },
  { id: '17', name: 'Sports' },
];

const regions = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
];

export default function TrendingSection() {
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('0');
  const [selectedRegion, setSelectedRegion] = useState('US');

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/trending?category=${selectedCategory}&region=${selectedRegion}&maxResults=12`
        );
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Error fetching trending:', err);
        setError('Failed to load trending videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [selectedCategory, selectedRegion]);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 p-2">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Trending Now</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
            <Globe size={16} className="text-gray-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-sm text-white outline-none"
            >
              {regions.map((region) => (
                <option key={region.code} value={region.code} className="bg-gray-800">
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-sm text-white outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-gray-800">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-lg bg-gray-800" />
              <div className="mt-3 h-4 w-3/4 rounded bg-gray-800" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video, index) => (
            <a
              key={video.id}
              href={`https://youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-800/50 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={video.thumbnails.high?.url || video.thumbnails.medium?.url}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="rounded-full bg-red-600 p-3">
                    <Play size={24} className="text-white" fill="white" />
                  </div>
                </div>
                <div className="absolute left-2 top-2 rounded bg-gradient-to-r from-red-600 to-orange-500 px-2 py-1 text-xs font-bold text-white">
                  #{index + 1}
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-medium text-white group-hover:text-red-400">
                  {video.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500">{video.channelTitle}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {formatNumber(video.statistics.viewCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={12} />
                    {formatNumber(video.statistics.likeCount)}
                  </span>
                  <span>{getTimeAgo(video.publishedAt)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
          <p>No trending videos found. Check your API configuration.</p>
        </div>
      )}
    </div>
  );
}
