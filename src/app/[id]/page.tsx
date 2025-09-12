"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag, ChevronDown, ChevronUp, Video, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Material {
  id: string;
  title: string;
  type: "video" | "text" | "url" | "podcast";
  shortDescription: string;
  fullDescription: string;
  content: any;
  tags: string[];
  createdAt: string;
  author: string;
}

export default function MaterialDetailPage() {
  const params = useParams();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleVideoError = (errorMessage: string) => {
    setVideoError(errorMessage);
    setVideoLoading(false);
  };

  const handleVideoRetry = () => {
    setVideoError(null);
    setVideoLoading(true);
    setRetryCount(prev => prev + 1);
    
    // Force video element to reload by updating the src
    const videoElement = document.querySelector('video');
    if (videoElement && material?.content.driveFileId) {
      videoElement.src = `/api/video-stream/${material.content.driveFileId}?retry=${retryCount}`;
    }
  };

  useEffect(() => {
    const loadMaterial = async () => {
      try {
        const [videoResponse, textResponse, urlResponse, podcastResponse] = await Promise.all([
          fetch('/api/videos'),
          fetch('/configs/text_descriptions.json'),
          fetch('/configs/url_descriptions.json'),
          fetch('/api/podcasts')
        ]);

        const [videoData, textData, urlData, podcastData] = await Promise.all([
          videoResponse.json(),
          textResponse.json(),
          urlResponse.json(),
          podcastResponse.json()
        ]);

        // Transform the data structure to match our interface
        const transformVideos = (data: any) => {
          if (data.videos) {
            return Object.entries(data.videos).map(([id, video]: [string, any]) => ({
              id,
              title: video.name,
              type: "video" as const,
              shortDescription: video.short_description,
              fullDescription: video.long_description,
              content: { 
                url: video.url,
                driveFileId: video.drive_file_id 
              },
              tags: [],
              createdAt: new Date().toISOString(),
              author: "Expert Psychologist"
            }));
          }
          return [];
        };

        const transformTexts = (data: any) => {
          if (data.texts) {
            return Object.entries(data.texts).map(([id, text]: [string, any]) => ({
              id,
              title: text.name,
              type: "text" as const,
              shortDescription: text.short_description,
              fullDescription: text.long_description,
              content: { 
                text: text.content || "",
                driveFileId: text.drive_file_id,
                webViewLink: text.web_view_link
              },
              tags: [],
              createdAt: new Date().toISOString(),
              author: "Expert Psychologist"
            }));
          }
          return [];
        };

        const transformUrls = (data: any) => {
          if (data.urls) {
            return Object.entries(data.urls).map(([id, url]: [string, any]) => ({
              id,
              title: url.name,
              type: "url" as const,
              shortDescription: url.short_description,
              fullDescription: url.long_description,
              content: { 
                url: url.url,
                driveFileId: url.drive_file_id 
              },
              tags: [],
              createdAt: new Date().toISOString(),
              author: "Expert Psychologist"
            }));
          }
          return [];
        };

        const transformPodcasts = (data: any) => {
          if (data.podcasts) {
            return Object.entries(data.podcasts).map(([id, podcast]: [string, any]) => ({
              id,
              title: podcast.name,
              type: "podcast" as const,
              shortDescription: podcast.short_description,
              fullDescription: podcast.long_description,
              content: { 
                url: podcast.url,
                driveFileId: podcast.drive_file_id 
              },
              tags: [],
              createdAt: new Date().toISOString(),
              author: "Expert Psychologist"
            }));
          }
          return [];
        };

        const allMaterials = [
          ...transformVideos(videoData),
          ...transformTexts(textData),
          ...transformUrls(urlData),
          ...transformPodcasts(podcastData)
        ];

        const foundMaterial = allMaterials.find((m: Material) => 
          m.content?.driveFileId === params?.id || m.id === params?.id
        );
        setMaterial(foundMaterial || null);
        
        // Reset video states when material changes
        if (foundMaterial?.type === 'video') {
          setVideoLoading(true);
          setVideoError(null);
          setRetryCount(0);
        }
      } catch (error) {
        console.error('Error loading material:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadMaterial();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading material...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Material Not Found</h1>
            <p className="text-muted-foreground mb-8">The material you're looking for doesn't exist.</p>
            <Link href="/" className="knowledge-button-primary px-6 py-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Materials
          </Link>
        </div>

        {/* Material Content - Single Block */}
        <div className="knowledge-card">
          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-4">{material.title}</h1>
          
          {/* Description with toggle */}
          <div className="mb-6">
            {!showFullDescription ? (
              <p className="text-lg text-muted-foreground mb-4">{material.shortDescription}</p>
            ) : (
              <div className="prose prose-gray max-w-none mb-4">
                <p className="text-lg text-muted-foreground leading-relaxed">{material.fullDescription}</p>
              </div>
            )}
            
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              {showFullDescription ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              {showFullDescription ? "Show" : "Show"} {showFullDescription ? "short" : "full"} description
            </button>
          </div>

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {material.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content Display based on type */}
          {material.content && (
            <div>
              {material.type === "video" && material.content.url && (
                <div className="rounded-lg overflow-hidden">
                  {/* Video Loading Skeleton */}
                  {videoLoading && (
                    <div className="max-w-4xl mx-auto aspect-video bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-gray-500 text-lg">Loading video...</div>
                        <div className="w-32 h-2 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Video Error State */}
                  {videoError && (
                    <div className="max-w-4xl mx-auto aspect-video bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
                      <div className="text-center p-8">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-700 mb-2">Video Temporarily Unavailable</h3>
                        <p className="text-red-600 mb-4 max-w-md">{videoError}</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                          <button
                            onClick={handleVideoRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                          </button>
                          <Link
                            href="/videos"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Browse Videos
                          </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">💡 Tip: Check your internet connection or try refreshing the page</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Actual Video Player */}
                  {!videoError && (
                    <div className={videoLoading ? "hidden" : "block"}>
                      {material.content.driveFileId ? (
                        <div className="max-w-4xl mx-auto bg-black rounded-lg">
                          <video
                            src={`/api/video-stream/${material.content.driveFileId}`}
                            controls
                            className="w-full h-auto rounded-lg"
                            preload="metadata"
                            style={{ maxHeight: '70vh' }}
                            onLoadStart={() => setVideoLoading(true)}
                            onLoadedMetadata={() => setVideoLoading(false)}
                            onCanPlay={() => setVideoLoading(false)}
                            onError={() => handleVideoError('Failed to load video from Google Drive. The file may be temporarily unavailable or there may be a connection issue.')}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <video
                            src={material.content.url}
                            controls
                            className="w-full h-full object-contain"
                            preload="metadata"
                            onLoadStart={() => setVideoLoading(true)}
                            onLoadedMetadata={() => setVideoLoading(false)}
                            onCanPlay={() => setVideoLoading(false)}
                            onError={() => handleVideoError('Failed to load video. Please check the video URL and your connection.')}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {material.type === "url" && material.content.url && (
                <div className="p-4 bg-muted rounded-lg">
                  <a
                    href={material.content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {material.content.url}
                  </a>
                </div>
              )}
              {material.type === "podcast" && material.content.url && (
                <div className="rounded-lg overflow-hidden">
                  {material.content.driveFileId ? (
                    <div className="max-w-4xl mx-auto bg-gray-100 rounded-lg p-4">
                      <audio
                        src={`/api/audio-stream/${material.content.driveFileId}`}
                        controls
                        className="w-full"
                        preload="metadata"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-4">
                      <audio
                        src={material.content.url}
                        controls
                        className="w-full"
                        preload="metadata"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              )}
              {material.type === "text" && material.content.text && (
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {material.content.text}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mt-8 pt-6 border-t border-border">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {material.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(material.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              {material.type}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 