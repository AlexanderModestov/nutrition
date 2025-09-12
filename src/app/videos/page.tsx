"use client";

import { useState, useEffect } from "react";
import { Video } from "lucide-react";
import MaterialSection from "@/components/MaterialSection";

interface Material {
  id: string;
  title: string;
  type: "video" | "text" | "url";
  shortDescription: string;
  fullDescription: string;
  content: any;
  tags: string[];
  createdAt: string;
  author: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const videoData = await response.json();

        const transformVideos = (data: any) => {
          if (data.videos) {
            return Object.entries(data.videos)
              .filter(([_, video]: [string, any]) => video.url) // Only show videos with Google Drive URLs
              .map(([id, video]: [string, any]) => ({
                id,
                title: video.name,
                type: "video" as const,
                shortDescription: video.short_description,
                fullDescription: video.long_description,
                content: { url: video.url },
                tags: [],
                createdAt: new Date().toISOString(),
                author: "Expert Psychologist"
              }));
          }
          return [];
        };

        setVideos(transformVideos(videoData));
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MaterialSection
          title="Видеоматериалы"
          type="video"
          materials={videos}
          icon={<Video className="h-6 w-6" />}
          description="Экспертные уроки, лекции и образовательные видео"
        />

        <div className="mt-20 text-center fade-in">
          <div className="knowledge-card inline-block">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-primary">{videos.length}</div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Video Resources</div>
                <div className="text-sm text-muted-foreground">Educational content</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}