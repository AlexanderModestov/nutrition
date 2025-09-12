"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function QuizVideoPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fileId) {
      // Check if quiz HTML file exists and redirect to it
      fetch(`/api/quiz-html/${fileId}`)
        .then(response => {
          if (response.ok) {
            // Redirect to the quiz HTML page
            window.location.href = `/api/quiz-html/${fileId}`;
          } else {
            // Show error page if quiz not found
            setError(`Quiz with ID ${fileId} not found`);
            setLoading(false);
          }
        })
        .catch(error => {
          console.error('Error checking quiz file:', error);
          setError('Failed to load quiz. Please try again later.');
          setLoading(false);
        });
    }
  }, [fileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/quizes" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Quizes
              </Link>
            </Button>
          </div>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Quiz Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Quiz ID: <code className="bg-muted px-2 py-1 rounded text-xs">{fileId}</code>
                </p>
              </div>
              <div className="mt-6 space-y-2">
                <Button asChild className="w-full">
                  <Link href="/quizes">
                    Browse Available Quizes
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}