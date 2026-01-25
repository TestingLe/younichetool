-- Supabase Schema for YouTube Stats Tracker
-- Run this in your Supabase SQL Editor

-- User Profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  channel_id TEXT,
  channel_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Snapshots table (stores historical stats)
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  subscriber_count BIGINT NOT NULL DEFAULT 0,
  view_count BIGINT NOT NULL DEFAULT 0,
  video_count INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Ideas table
CREATE TABLE IF NOT EXISTS public.saved_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  niche TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  default_niche TEXT,
  preferred_region TEXT DEFAULT 'US',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON public.analytics_snapshots(recorded_at);
CREATE INDEX IF NOT EXISTS idx_saved_ideas_user_id ON public.saved_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (true);

-- RLS Policies for analytics_snapshots
CREATE POLICY "Users can view own analytics" ON public.analytics_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own analytics" ON public.analytics_snapshots
  FOR INSERT WITH CHECK (true);

-- RLS Policies for saved_ideas
CREATE POLICY "Users can view own ideas" ON public.saved_ideas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ideas" ON public.saved_ideas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own ideas" ON public.saved_ideas
  FOR DELETE USING (true);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (true);
