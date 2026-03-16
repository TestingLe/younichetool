'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Upload,
  X,
  FileVideo,
  Calendar,
  Clock,
  Eye,
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  TrendingUp,
  BarChart3,
  Tag,
} from 'lucide-react';
import { ChannelInfo, Video as VideoType } from '@/types/youtube';
import { formatNumber } from '@/lib/youtube';

// Puter.js global type
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<{ message: { content: string } } | string>;
      };
    };
  }
}

interface VideoUploadProps {
  channelInfo: ChannelInfo | null;
  videos: VideoType[];
}

interface ViewPrediction {
  estimatedViews: string;
  confidence: string;
  reasoning: string;
  bestTimeToPost: string;
  trendScore: number;
  tips: string[];
}

export default function VideoUpload({ channelInfo, videos }: VideoUploadProps) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<{ videoId?: string; url?: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // AI View Prediction
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<ViewPrediction | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [puterLoaded, setPuterLoaded] = useState(false);

  // Load Puter.js
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => setPuterLoaded(true);
      document.head.appendChild(script);
    } else if (typeof window !== 'undefined' && window.puter) {
      setPuterLoaded(true);
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a video file');
      return;
    }
    if (file.size > 128 * 1024 * 1024 * 1024) {
      setUploadError('File size exceeds YouTube limit (128GB)');
      return;
    }
    setVideoFile(file);
    setUploadError(null);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) {
      setUploadError('Video file and title are required');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags);
      formData.append('privacyStatus', privacyStatus);

      if (scheduleEnabled && scheduledDate && scheduledTime) {
        const publishAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        formData.append('publishAt', publishAt);
      }

      setUploadProgress(30);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress(100);
      setUploadStatus('success');
      setUploadResult(result);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const predictViews = async () => {
    if (!puterLoaded || !window.puter) {
      setPredictionError('AI is still loading. Please wait...');
      return;
    }
    if (!title.trim()) {
      setPredictionError('Please enter a title first');
      return;
    }

    setPredicting(true);
    setPredictionError(null);
    setPrediction(null);

    try {
      const channelContext = channelInfo
        ? `Channel: "${channelInfo.title}"
Subscribers: ${formatNumber(channelInfo.statistics.subscriberCount)}
Total Views: ${formatNumber(channelInfo.statistics.viewCount)}
Total Videos: ${channelInfo.statistics.videoCount}
Channel Description: ${channelInfo.description?.substring(0, 200) || 'N/A'}`
        : 'No channel data available';

      const recentVideosContext = videos.length > 0
        ? `Recent video performance:
${videos.slice(0, 8).map(v => `- "${v.title}" → ${formatNumber(v.statistics.viewCount)} views, ${formatNumber(v.statistics.likeCount)} likes${v.tags ? `, tags: ${v.tags.slice(0, 5).join(', ')}` : ''}`).join('\n')}`
        : 'No recent videos';

      const avgViews = videos.length > 0
        ? Math.round(videos.reduce((acc, v) => acc + parseInt(v.statistics.viewCount || '0'), 0) / videos.length)
        : 0;

      const prompt = `You are a YouTube analytics expert. Analyze this channel's performance data and predict the potential views for a new video.

${channelContext}

${recentVideosContext}

Average views per video: ${formatNumber(avgViews)}

NEW VIDEO DETAILS:
Title: "${title}"
Description: "${description || 'Not provided'}"
Tags: ${tags || 'Not provided'}
${scheduleEnabled ? `Scheduled for: ${scheduledDate} ${scheduledTime}` : 'Immediate upload'}

Based on the channel's niche, subscriber count, average video performance, and the new video's title/description/tags, predict:
1. How many views this video could get in its first 30 days
2. Your confidence level
3. Why you think it will perform at that level
4. Best time/day to post for maximum reach
5. A trend score (0-100)
6. 3 tips to boost this specific video's performance

RESPOND ONLY WITH VALID JSON:
{
  "estimatedViews": "X - Y views",
  "confidence": "High/Medium/Low",
  "reasoning": "Brief explanation of why",
  "bestTimeToPost": "Best day and time recommendation",
  "trendScore": 75,
  "tips": ["tip1", "tip2", "tip3"]
}`;

      const response = await window.puter.ai.chat(prompt, { model: 'claude-sonnet-4-20250514' });

      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (response?.message?.content) {
        responseText = response.message.content;
      } else if (response && typeof response === 'object') {
        responseText = JSON.stringify(response);
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setPrediction(result);
      } else {
        throw new Error('Could not parse prediction');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setPredictionError('Failed to predict views. Try again.');
    } finally {
      setPredicting(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-2">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Upload to YouTube</h2>
          <p className="text-sm text-gray-400">Upload, schedule, and predict views with AI</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column — Upload Form */}
        <div className="space-y-4">
          {/* File Drop Zone */}
          {!videoFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                dragActive
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-700 bg-gray-900/50 hover:border-green-500/50 hover:bg-gray-800/50'
              }`}
            >
              <FileVideo className={`mx-auto mb-4 h-12 w-12 ${dragActive ? 'text-green-400' : 'text-gray-500 group-hover:text-green-400'} transition-colors`} />
              <p className="mb-1 text-lg font-medium text-white">
                {dragActive ? 'Drop your video here' : 'Drag & drop your video'}
              </p>
              <p className="text-sm text-gray-500">or click to browse files</p>
              <p className="mt-2 text-xs text-gray-600">MP4, AVI, MOV, WMV • Max 128GB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileVideo className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{videoFile.name}</p>
                    <p className="text-xs text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                </div>
                <button onClick={removeFile} className="rounded-lg p-1 hover:bg-gray-700 transition-colors">
                  <X className="h-5 w-5 text-gray-400 hover:text-red-400" />
                </button>
              </div>
              {videoPreview && (
                <video src={videoPreview} controls className="w-full rounded-xl max-h-48 bg-black" />
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              maxLength={100}
              className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
            <p className="mt-1 text-xs text-gray-600">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              rows={4}
              maxLength={5000}
              className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
              <Tag size={14} />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="gaming, tutorial, vlog (comma separated)"
              className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>

          {/* Privacy */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Privacy</label>
            <div className="flex gap-2">
              {(['public', 'unlisted', 'private'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setPrivacyStatus(status)}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                    privacyStatus === status
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                      : 'border border-gray-700 bg-gray-800 text-gray-400 hover:border-green-500/50 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Toggle */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Schedule Upload</span>
              </div>
              <button
                onClick={() => setScheduleEnabled(!scheduleEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  scheduleEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                    scheduleEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {scheduleEnabled && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">
                    <Calendar size={12} className="inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">
                    <Clock size={12} className="inline mr-1" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !videoFile || !title.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                {scheduleEnabled ? 'Schedule Upload' : 'Upload to YouTube'}
              </>
            )}
          </button>

          {/* Progress Bar */}
          {uploadStatus === 'uploading' && (
            <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-400">Uploading to YouTube...</span>
                <span className="text-green-400">{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'success' && uploadResult && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-400" />
                <span className="font-medium text-green-400">Uploaded Successfully!</span>
              </div>
              <a
                href={uploadResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-300 underline hover:text-green-200"
              >
                Watch on YouTube →
              </a>
            </div>
          )}

          {/* Error Message */}
          {(uploadError || uploadStatus === 'error') && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-400">{uploadError || 'Upload failed'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — AI View Prediction */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 p-2">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">AI View Prediction</h3>
                <p className="text-xs text-gray-400">Powered by Claude Sonnet 4 via Puter.js</p>
              </div>
            </div>

            <button
              onClick={predictViews}
              disabled={predicting || !title.trim()}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/50 bg-violet-500/10 px-4 py-3 font-medium text-violet-300 transition-all hover:bg-violet-500/20 disabled:opacity-50"
            >
              {predicting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Predict Views
                </>
              )}
            </button>

            {prediction && (
              <div className="space-y-4">
                {/* View Estimate */}
                <div className="rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Estimated Views (30 days)</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      prediction.confidence === 'High' ? 'bg-green-500/20 text-green-400' :
                      prediction.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {prediction.confidence} confidence
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{prediction.estimatedViews}</p>
                </div>

                {/* Trend Score */}
                <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800/50 p-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">Trend Score</span>
                      <span className="text-sm font-bold text-green-400">{prediction.trendScore}/100</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                        style={{ width: `${prediction.trendScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
                  <p className="mb-1 text-xs font-medium text-purple-400">💡 Analysis</p>
                  <p className="text-sm text-gray-300">{prediction.reasoning}</p>
                </div>

                {/* Best Time */}
                <div className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/30 p-3">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500">Best time to post</p>
                    <p className="text-sm font-medium text-white">{prediction.bestTimeToPost}</p>
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
                  <p className="mb-2 text-xs font-medium text-yellow-400">🚀 Tips to boost views</p>
                  <ul className="space-y-1.5">
                    {prediction.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {predictionError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{predictionError}</p>
              </div>
            )}

            {!prediction && !predicting && !predictionError && (
              <div className="py-8 text-center">
                <Eye className="mx-auto mb-3 h-10 w-10 text-gray-600" />
                <p className="text-sm text-gray-500">Fill in your video details and click<br />"Predict Views" to get AI insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
