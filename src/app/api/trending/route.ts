import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTrendingVideosWithToken } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in to view trending videos' },
        { status: 401 }
      );
    }

    const accessToken = (session as { accessToken?: string }).accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token available. Please sign in again.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const regionCode = searchParams.get('region') || 'US';
    const categoryId = searchParams.get('category') || '0';
    const maxResults = parseInt(searchParams.get('maxResults') || '20', 10);

    const videos = await getTrendingVideosWithToken(accessToken, regionCode, categoryId, maxResults);
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending videos' },
      { status: 500 }
    );
  }
}
