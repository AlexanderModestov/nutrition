"use client";

import { useState, useEffect } from "react";
import { Video, FileText, FileQuestion } from "lucide-react";
import MaterialSection from "@/components/MaterialSection";
import { generateSlug } from "@/lib/text-utils-client";

interface Material {
  id: string;
  title: string;
  type: "video" | "text" | "quiz";
  shortDescription: string;
  fullDescription: string;
  content: any;
  tags: string[];
  createdAt: string;
  author: string;
}

export default function HomePage() {
  const [materials, setMaterials] = useState<{
    videos: Material[];
    texts: Material[];
    quizes: Material[];
  }>({
    videos: [],
    texts: [],
    quizes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const [videoResponse, textResponse, quizResponse] = await Promise.all([
          fetch('/api/videos'),
          fetch('/api/texts'),
          fetch('/api/quizes')
        ]);

        const [videoData, textData, quizData] = await Promise.all([
          videoResponse.json(),
          textResponse.json(),
          quizResponse.json()
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
            return Object.entries(data.texts).map(([textTitle, text]: [string, any]) => ({
              id: generateSlug(textTitle),
              title: text.name,
              type: "text" as const,
              shortDescription: text.short_description,
              fullDescription: text.long_description,
              content: { text: text.content || "" },
              tags: [],
              createdAt: new Date().toISOString(),
              author: "Expert Psychologist"
            }));
          }
          return [];
        };


        const transformQuizes = (data: any) => {
          if (data.videos) {
            return Object.entries(data.videos).map(([quizId, quiz]: [string, any]) => ({
              id: quiz.drive_file_id || quizId,
              title: quiz.name,
              type: "quiz" as const,
              shortDescription: quiz.short_description,
              fullDescription: quiz.long_description,
              content: { 
                url: quiz.url,
                driveFileId: quiz.drive_file_id 
              },
              tags: [],
              createdAt: new Date().toISOString(),
              author: "Expert Psychologist"
            }));
          }
          return [];
        };

        setMaterials({
          videos: transformVideos(videoData),
          texts: transformTexts(textData),
          quizes: transformQuizes(quizData)
        });
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading knowledge hub...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Materials Sections */}
        <div className="space-y-16">
          <MaterialSection
            title="Видеоматериалы"
            type="video"
            materials={materials.videos}
            icon={<Video className="h-6 w-6" />}
            description="Экспертные уроки, лекции и образовательные видео"
          />

          <MaterialSection
            title="Статьи автора"
            type="text"
            materials={materials.texts}
            icon={<FileText className="h-6 w-6" />}
            description="Углубленные статьи, руководства и документация"
          />

        </div>
      </main>
    </div>
  );
} 