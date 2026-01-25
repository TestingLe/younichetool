export interface ChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  hiddenSubscriberCount: boolean;
}

export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  statistics: ChannelStats;
}

export interface VideoStats {
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
    maxres?: { url: string };
  };
  statistics: VideoStats;
  tags?: string[];
  categoryId?: string;
  duration?: string;
}

export interface TrendingVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnails: {
    medium: { url: string };
    high: { url: string };
  };
  statistics: VideoStats;
  publishedAt: string;
}

export interface AIGeneratedContent {
  titles: string[];
  descriptions: string[];
  tags: string[];
  videoIdeas: VideoIdea[];
  nicheAnalysis: NicheAnalysis;
}

export interface VideoIdea {
  title: string;
  hook: string;
  outline: string[];
  estimatedViews: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  trendScore: number;
}

export interface NicheAnalysis {
  recommendedNiche: string;
  reasoning: string;
  competitionLevel: 'Low' | 'Medium' | 'High';
  growthPotential: 'Low' | 'Medium' | 'High';
  trendingTopics: string[];
}

export interface AnalyticsData {
  date: string;
  views: number;
  subscribers: number;
  watchTime: number;
  likes: number;
}
