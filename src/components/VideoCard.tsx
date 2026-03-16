'use client';

import Image from 'next/image';
import { Eye, ThumbsUp, MessageCircle, Clock } from 'lucide-react';
import { Video } from '@/types/youtube';
import { formatNumber, getTimeAgo } from '@/lib/youtube';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  // Use mqdefault which is always available; hqdefault returns 404 for some videos
  const getThumbnailUrl = () => {
    const url = video.thumbnails.medium?.url || video.thumbnails.default?.url || '';
    // Replace hqdefault/sddefault/maxresdefault with mqdefault as fallback
    return url.replace(/(?:hq|sd|maxres)default/, 'mqdefault');
  };
  const thumbnailUrl = getThumbnailUrl();

  return (
    <a
      href={`https://youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
          <Clock size={12} className="mr-1 inline" />
          {video.duration || 'N/A'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-red-400">
          {video.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{getTimeAgo(video.publishedAt)}</p>
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={14} className="text-red-400" />
            {formatNumber(video.statistics.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={14} className="text-blue-400" />
            {formatNumber(video.statistics.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} className="text-green-400" />
            {formatNumber(video.statistics.commentCount)}
          </span>
        </div>
      </div>
    </a>
  );
}
