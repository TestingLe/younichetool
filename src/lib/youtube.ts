import { ChannelInfo, Video, TrendingVideo } from '@/types/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function getChannelStats(accessToken: string): Promise<ChannelInfo | null> {
  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,contentDetails&mine=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch channel stats');
    
    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;
    
    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl,
      publishedAt: channel.snippet.publishedAt,
      thumbnails: channel.snippet.thumbnails,
      statistics: channel.statistics,
    };
  } catch (error) {
    console.error('Error fetching channel stats:', error);
    return null;
  }
}

export async function getChannelVideos(accessToken: string, channelId: string, maxResults = 10): Promise<Video[]> {
  try {
    // First get video IDs from search
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?part=id&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!searchResponse.ok) throw new Error('Failed to search videos');
    
    const searchData = await searchResponse.json();
    const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
    
    if (!videoIds) return [];
    
    // Then get full video details
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoIds}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!videosResponse.ok) throw new Error('Failed to fetch videos');
    
    const videosData = await videosResponse.json();
    
    return videosData.items.map((video: {
      id: string;
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: Video['thumbnails'];
        tags?: string[];
        categoryId?: string;
      };
      statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
      };
      contentDetails: {
        duration?: string;
      };
    }) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      statistics: video.statistics,
      tags: video.snippet.tags,
      categoryId: video.snippet.categoryId,
      duration: video.contentDetails.duration,
    }));
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
}

export async function getTrendingVideosWithToken(accessToken: string, regionCode = 'US', categoryId = '0', maxResults = 20): Promise<TrendingVideo[]> {
  try {
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.append('part', 'snippet,statistics');
    url.searchParams.append('chart', 'mostPopular');
    url.searchParams.append('regionCode', regionCode);
    url.searchParams.append('maxResults', maxResults.toString());
    
    if (categoryId !== '0') {
      url.searchParams.append('videoCategoryId', categoryId);
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch trending videos');
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) return [];
    
    return data.items.map((video: {
      id: string;
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails: TrendingVideo['thumbnails'];
        publishedAt: string;
      };
      statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
      };
    }) => ({
      id: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      thumbnails: video.snippet.thumbnails,
      statistics: video.statistics,
      publishedAt: video.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
}

export function formatNumber(num: string | number): string {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '0';
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'K';
  }
  return n.toString();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
}
