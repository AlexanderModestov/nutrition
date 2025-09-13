'use client';

import Link from 'next/link';
import { ChevronLeft, FileText, Download, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

interface TextPageClientProps {
  textFile: any;
  pdfPath: string | null;
}

export function TextPageClient({ textFile, pdfPath }: TextPageClientProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              На Главную
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Статьи автора</span>
            <span>/</span>
            <span className="text-foreground">{textFile.title}</span>
          </div>
        </div>

        {/* Article Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{textFile.title}</h1>
                </div>
              </div>
              
              {pdfPath && (
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href={pdfPath} download className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Скачать
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Открыть в новой вкладке
                    </a>
                  </Button>
                </div>
              )}
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
            <CardContent className="p-0">
              <div className="w-full" style={{ height: '80vh' }}>
                <iframe
                  src={pdfPath}
                  className="w-full h-full border-0 rounded-lg"
                  title={textFile.title}
                >
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Your browser doesn't support PDF viewing.
                    </p>
                    <Button asChild>
                      <a href={pdfPath} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  </div>
                </iframe>
              </div>
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