"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface QuizVideo {
  name: string;
  short_description: string;
  long_description: string;
  url: string;
  drive_file_id: string | null;
  has_drive_file: boolean;
  quiz_available: boolean;
}

interface QuizVideosData {
  videos: Record<string, QuizVideo>;
  total_count: number;
}

export default function QuizesPage() {
  const [videosData, setVideosData] = useState<QuizVideosData>({ videos: {}, total_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizVideos = async () => {
      try {
        const response = await fetch('/api/quizes');
        if (!response.ok) {
          throw new Error('Failed to fetch quiz videos');
        }
        const data = await response.json();
        setVideosData(data);
      } catch (error) {
        console.error('Error loading quiz videos:', error);
        setError('Failed to load quiz videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadQuizVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quiz videos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Error Loading Quizes</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const videoEntries = Object.entries(videosData.videos);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quizes</h1>
          <p className="text-muted-foreground">
            {videosData.total_count} interactive quizes available
          </p>
        </div>

        {/* Quiz List */}
        {videoEntries.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 text-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Quizes Available</h2>
              <p className="text-muted-foreground">
                No video quizes are currently available. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {videoEntries.map(([videoId, video]) => (
              <Card key={videoId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {video.name}
                      </CardTitle>
                      <p className="text-muted-foreground mb-4">
                        {video.short_description}
                      </p>
                    </div>
                    <Button 
                      asChild 
                      disabled={!video.drive_file_id}
                    >
                      <Link href={`/quizes/${video.drive_file_id}`}>
                        Start Quiz
                      </Link>
                    </Button>
                  </div>
                  
                  {!video.drive_file_id && (
                    <p className="text-sm text-muted-foreground">
                      Quiz temporarily unavailable
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}