"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import MaterialSection from "@/components/MaterialSection";
import { generateSlug } from "@/lib/text-utils-client";

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

export default function TextsPage() {
  const [texts, setTexts] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTexts = async () => {
      try {
        const response = await fetch('/api/texts');
        const textData = await response.json();

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

        setTexts(transformTexts(textData));
      } catch (error) {
        console.error('Error loading texts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTexts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading texts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MaterialSection
          title="Статьи автора"
          type="text"
          materials={texts}
          icon={<FileText className="h-6 w-6" />}
          description="Углубленные статьи, руководства и документация"
        />

      </main>
    </div>
  );
}