import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { channelInfo, videos, niche, contentType } = await request.json();

    const systemPrompt = `You are an expert YouTube content strategist and SEO specialist. You help creators grow their channels by providing data-driven recommendations for video titles, descriptions, tags, and content ideas.

Always respond with valid JSON matching the requested format. Be specific, actionable, and creative. Focus on viewer psychology, trending topics, and SEO optimization.`;

    let userPrompt = '';
    
    if (contentType === 'full') {
      userPrompt = `Based on this YouTube channel data, provide comprehensive content recommendations:

Channel: ${channelInfo?.title || 'Unknown'}
Niche/Topic: ${niche || 'General content'}
Recent Videos: ${videos?.slice(0, 5).map((v: { title: string }) => v.title).join(', ') || 'None provided'}

Provide a JSON response with this exact structure:
{
  "titles": ["5 catchy, SEO-optimized video title suggestions"],
  "descriptions": ["2 full video descriptions with keywords, timestamps placeholder, and call-to-actions"],
  "tags": ["20 relevant tags for YouTube SEO"],
  "videoIdeas": [
    {
      "title": "Video idea title",
      "hook": "First 30 seconds hook to retain viewers",
      "outline": ["Introduction", "Main point 1", "Main point 2", "Conclusion"],
      "estimatedViews": "10K-50K",
      "difficulty": "Easy|Medium|Hard",
      "trendScore": 85
    }
  ],
  "nicheAnalysis": {
    "recommendedNiche": "Specific niche recommendation",
    "reasoning": "Why this niche is good for the channel",
    "competitionLevel": "Low|Medium|High",
    "growthPotential": "Low|Medium|High",
    "trendingTopics": ["5 trending topics in this niche"]
  }
}

Generate 5 titles, 2 descriptions, 20 tags, and 5 video ideas.`;
    } else if (contentType === 'titles') {
      userPrompt = `Generate 10 viral video title ideas for a ${niche || 'general'} YouTube channel.
      
Channel context: ${channelInfo?.title || 'Unknown channel'}
Recent videos: ${videos?.slice(0, 3).map((v: { title: string }) => v.title).join(', ') || 'None'}

Return JSON: { "titles": ["title1", "title2", ...] }

Make titles clickable with curiosity gaps, numbers, power words, and emotional triggers.`;
    } else if (contentType === 'ideas') {
      userPrompt = `Generate 8 unique video content ideas for a ${niche || 'general'} YouTube channel.

Channel: ${channelInfo?.title || 'Unknown'}

Return JSON with this structure:
{
  "videoIdeas": [
    {
      "title": "Video title",
      "hook": "Attention-grabbing first 30 seconds",
      "outline": ["Point 1", "Point 2", "Point 3"],
      "estimatedViews": "Range like 10K-50K",
      "difficulty": "Easy|Medium|Hard",
      "trendScore": 75
    }
  ]
}`;
    } else if (contentType === 'niche') {
      userPrompt = `Analyze the best niche strategy for this YouTube channel:

Channel: ${channelInfo?.title || 'Unknown'}
Current videos: ${videos?.slice(0, 5).map((v: { title: string }) => v.title).join(', ') || 'None'}
Stated interest: ${niche || 'Not specified'}

Return JSON:
{
  "nicheAnalysis": {
    "recommendedNiche": "Specific niche recommendation with sub-niche",
    "reasoning": "Detailed reasoning based on channel data and market analysis",
    "competitionLevel": "Low|Medium|High",
    "growthPotential": "Low|Medium|High",
    "trendingTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"]
  }
}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
