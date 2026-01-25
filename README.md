# YouTube Stats Tracker 📊

A powerful YouTube analytics dashboard with AI-powered content generation. Track your channel stats, discover trending content, and get AI-generated video ideas, titles, descriptions, and tags.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)

## ✨ Features

- **📊 Channel Dashboard** - Real-time subscriber count, views, video count with interactive charts
- **🎬 Video Management** - View all your uploaded videos with stats
- **🔥 Trending Discovery** - Browse trending videos by region and category
- **🤖 AI Content Generator** - Powered by GPT-4:
  - Viral title suggestions
  - SEO-optimized descriptions
  - Tag recommendations
  - Complete video ideas with hooks and outlines
  - Niche analysis with competition insights
- **💾 Data Persistence** - Save analytics history and ideas with Supabase
- **🔐 Google OAuth** - Secure authentication with YouTube API access

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/TestingLe/younichetool.git
cd younichetool
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file with:

```env
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3** and **YouTube Analytics API**
4. Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables in Vercel's project settings
4. Deploy!

### Option 2: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

### Environment Variables for Vercel

Add these in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |
| `NEXTAUTH_URL` | Your Vercel app URL (e.g., https://younichetool.vercel.app) |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

**Important:** Update your Google OAuth redirect URI to include your Vercel URL!

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth API
│   │   │   ├── generate/            # AI content generation
│   │   │   └── trending/            # Trending videos API
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Main dashboard
│   ├── components/
│   │   ├── AIGenerator.tsx          # AI content generator UI
│   │   ├── AnalyticsChart.tsx       # Charts component
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   ├── StatsCard.tsx            # Stats display cards
│   │   ├── TrendingSection.tsx      # Trending videos
│   │   └── VideoCard.tsx            # Video display card
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── youtube.ts               # YouTube API utilities
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client
│   │       ├── server.ts            # Server Supabase client
│   │       └── database.ts          # Database operations
│   └── types/
│       └── youtube.ts               # TypeScript types
├── supabase/
│   └── schema.sql                   # Database schema
└── vercel.json                      # Vercel configuration
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js with Google OAuth
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4
- **Charts:** Recharts
- **Icons:** Lucide React

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.
