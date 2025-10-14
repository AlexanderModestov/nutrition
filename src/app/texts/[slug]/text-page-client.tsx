'use client';

import Link from 'next/link';
import { ChevronLeft, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { PDFViewer } from '@/components/PDFViewer';

interface TextPageClientProps {
  textFile: any;
  pdfPath: string | null;
}

export function TextPageClient({ textFile, pdfPath }: TextPageClientProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 sm:mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              На Главную
            </Link>
          </Button>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Статьи автора</span>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{textFile.title}</span>
          </div>
        </div>

        {/* Article Header */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{textFile.title}</h1>
                </div>
              </div>
            </div>
            
            {/* Article Description with toggle */}
            {textFile.shortDescription && (
              <div className="mb-6">
                {!showFullDescription ? (
                  <p className="text-lg text-muted-foreground mb-4">{textFile.shortDescription}</p>
                ) : (
                  <div className="prose prose-gray max-w-none mb-4">
                    <p className="text-lg text-muted-foreground leading-relaxed">{textFile.longDescription || textFile.shortDescription}</p>
                  </div>
                )}
                
                {textFile.longDescription && textFile.longDescription !== textFile.shortDescription && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="flex items-center text-primary hover:text-primary/80 transition-colors"
                  >
                    {showFullDescription ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    {showFullDescription ? "Краткое описание" : "Полное описание"}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF Viewer */}
        {pdfPath ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <PDFViewer pdfUrl={pdfPath} title={textFile.title} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">PDF Not Available</h3>
                <p className="text-muted-foreground mb-6">
                  The PDF file for this article could not be found.
                </p>
                {textFile.longDescription && (
                  <div className="max-w-2xl mx-auto text-left">
                    <h4 className="text-md font-semibold mb-3">Full Description</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {textFile.longDescription}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}