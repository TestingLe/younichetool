import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const privacyStatus = formData.get('privacyStatus') as string || 'private';
    const publishAt = formData.get('publishAt') as string | null;

    if (!videoFile || !title) {
      return NextResponse.json({ error: 'Video file and title are required' }, { status: 400 });
    }

    // Build the video resource metadata
    const videoMetadata: {
      snippet: { title: string; description: string; tags?: string[]; categoryId: string };
      status: { privacyStatus: string; publishAt?: string; selfDeclaredMadeForKids: boolean };
    } = {
      snippet: {
        title,
        description: description || '',
        categoryId: '22', // People & Blogs (default)
      },
      status: {
        privacyStatus: publishAt ? 'private' : privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    };

    if (tags) {
      videoMetadata.snippet.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (publishAt) {
      videoMetadata.status.publishAt = new Date(publishAt).toISOString();
    }

    // Step 1: Initiate resumable upload
    const initResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': videoFile.size.toString(),
          'X-Upload-Content-Type': videoFile.type,
        },
        body: JSON.stringify(videoMetadata),
      }
    );

    if (!initResponse.ok) {
      const errorData = await initResponse.json().catch(() => ({}));
      console.error('YouTube upload init error:', errorData);
      return NextResponse.json(
        { error: 'Failed to initiate upload', details: errorData },
        { status: initResponse.status }
      );
    }

    const uploadUrl = initResponse.headers.get('Location');
    if (!uploadUrl) {
      return NextResponse.json({ error: 'No upload URL returned' }, { status: 500 });
    }

    // Step 2: Upload the video file
    const videoBuffer = await videoFile.arrayBuffer();
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': videoFile.type,
        'Content-Length': videoFile.size.toString(),
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      console.error('YouTube upload error:', errorData);
      return NextResponse.json(
        { error: 'Failed to upload video', details: errorData },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();
    
    return NextResponse.json({
      success: true,
      videoId: uploadResult.id,
      title: uploadResult.snippet?.title,
      status: uploadResult.status?.uploadStatus,
      publishAt: uploadResult.status?.publishAt || null,
      url: `https://youtube.com/watch?v=${uploadResult.id}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
