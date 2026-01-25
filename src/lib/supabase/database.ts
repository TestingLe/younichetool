import { createClient } from './client';

// Types for Supabase tables
export interface UserProfile {
  id: string;
  email: string;
  channel_id?: string;
  channel_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  user_id: string;
  subscriber_count: number;
  view_count: number;
  video_count: number;
  recorded_at: string;
}

export interface SavedIdea {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  tags?: string[];
  niche?: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  default_niche?: string;
  preferred_region?: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Database operations
export async function saveAnalyticsSnapshot(
  userId: string,
  subscriberCount: number,
  viewCount: number,
  videoCount: number
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .insert({
      user_id: userId,
      subscriber_count: subscriberCount,
      view_count: viewCount,
      video_count: videoCount,
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAnalyticsHistory(userId: string, days: number = 30) {
  const supabase = createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return data as AnalyticsSnapshot[];
}

export async function saveIdea(
  userId: string,
  title: string,
  description?: string,
  tags?: string[],
  niche?: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('saved_ideas')
    .insert({
      user_id: userId,
      title,
      description,
      tags,
      niche,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSavedIdeas(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('saved_ideas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SavedIdea[];
}

export async function deleteIdea(ideaId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('saved_ideas')
    .delete()
    .eq('id', ideaId);

  if (error) throw error;
}

export async function getUserPreferences(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as UserPreferences | null;
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertUserProfile(
  userId: string,
  email: string,
  channelId?: string,
  channelName?: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      email,
      channel_id: channelId,
      channel_name: channelName,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
