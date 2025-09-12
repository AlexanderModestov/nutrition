import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';
import { getTextFileBySlug, formatTextContent, generateSlug } from '@/lib/text-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TextPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(process.cwd(), 'public', 'configs', 'text_descriptions.json');
    if (!fs.existsSync(configPath)) {
      return [];
    }
    
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    return Object.keys(configData.texts || {}).map((textTitle) => ({
      slug: generateSlug(textTitle),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: TextPageProps) {
  const textFile = await getTextFileBySlug(params.slug);
  
  if (!textFile) {
    return {
      title: 'Text Not Found',
    };
  }

  return {
    title: textFile.title,
    description: textFile.content.slice(0, 160) + '...',
  };
}

export default async function TextPage({ params }: TextPageProps) {
  const textFile = await getTextFileBySlug(params.slug);
  
  if (!textFile) {
    notFound();
  }

  const formattedContent = formatTextContent(textFile.content);
  const paragraphs = formattedContent.split('\n\n');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/texts" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Texts
            </Link>
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/texts" className="hover:text-foreground">Texts</Link>
            <span>/</span>
            <span className="text-foreground">{textFile.title}</span>
          </div>
        </div>

        {/* Article Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">{textFile.title}</h1>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card>
          <CardContent className="pt-8">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              {paragraphs.map((paragraph, index) => {
                // Check if this is the first paragraph (title) - skip it since it's already shown in header
                if (index === 0 && paragraph.trim() === textFile.title) {
                  return null;
                }
                
                // Check if paragraph looks like a heading (short and ends without punctuation)
                const isHeading = paragraph.length < 100 && 
                  !paragraph.endsWith('.') && 
                  !paragraph.endsWith('?') && 
                  !paragraph.endsWith('!') &&
                  paragraph.split(' ').length < 15;
                
                if (isHeading) {
                  return (
                    <h2 key={index} className="text-xl font-semibold mt-8 mb-4 text-primary">
                      {paragraph}
                    </h2>
                  );
                }
                
                return (
                  <p key={index} className="mb-4 leading-relaxed text-foreground">
                    {paragraph}
                  </p>
                );
              })}
            </article>
            
            {/* Article Footer */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium">Expert Knowledge Hub</div>
                  <div>Professional Psychology Content</div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/texts">
                    View All Texts
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}