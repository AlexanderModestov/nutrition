"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
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

export default function UrlsPage() {
  const [urls, setUrls] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUrls = async () => {
      try {
        const response = await fetch('/configs/url_descriptions.json');
        const urlData = await response.json();

        const transformUrls = (data: any) => {
          if (data.urls) {
            return Object.entries(data.urls).map(([id, url]: [string, any]) => ({
              id,
              title: url.name,
              type: "url" as const,
              shortDescription: url.short_description,
              fullDescription: url.long_description,
              content: { url: url.url },
              tags: [],
              createdAt: new Date().toISOString(),
              author: "Expert Psychologist"
            }));
          }
          return [];
        };

        setUrls(transformUrls(urlData));
      } catch (error) {
        console.error('Error loading URLs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUrls();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading URLs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MaterialSection
          title="Useful URLs"
          type="url"
          materials={urls}
          icon={<ExternalLink className="h-6 w-6" />}
          description="External resources, tools, and references"
        />

        <div className="mt-20 text-center fade-in">
          <div className="knowledge-card inline-block">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-primary">{urls.length}</div>
              <div className="text-left">
                <div className="font-semibold text-foreground">URL Resources</div>
                <div className="text-sm text-muted-foreground">External links</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}