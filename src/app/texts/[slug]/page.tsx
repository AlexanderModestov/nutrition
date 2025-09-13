import { notFound } from 'next/navigation';
import { getTextFileBySlug, formatTextContent, generateSlug } from '@/lib/text-utils';
import path from 'path';
import fs from 'fs';
import { TextPageClient } from './text-page-client';

interface TextPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(process.cwd(), 'public', 'configs', 'pdf_descriptions.json');
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

// Function to find PDF file by matching article key
function findPdfFile(articleKey: string): string | null {
  const pdfDir = path.join(process.cwd(), 'public', 'data', 'pdf');
  
  if (!fs.existsSync(pdfDir)) {
    return null;
  }
  
  const pdfFiles = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
  
  // Try exact match first
  const exactMatch = pdfFiles.find(file => 
    file.replace('.pdf', '') === articleKey
  );
  
  if (exactMatch) {
    return `/data/pdf/${exactMatch}`;
  }
  
  // Try partial match
  const partialMatch = pdfFiles.find(file => {
    const fileName = file.replace('.pdf', '').toLowerCase();
    const searchKey = articleKey.toLowerCase();
    return fileName.includes(searchKey.substring(0, 10)) || searchKey.includes(fileName.substring(0, 10));
  });
  
  if (partialMatch) {
    return `/data/pdf/${partialMatch}`;
  }
  
  return null;
}

export async function generateMetadata({ params }: TextPageProps) {
  const textFile = await getTextFileBySlug(params.slug);
  
  if (!textFile) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: textFile.title,
    description: textFile.shortDescription || textFile.content.slice(0, 160) + '...',
  };
}

export default async function TextPage({ params }: TextPageProps) {
  const textFile = await getTextFileBySlug(params.slug);
  
  if (!textFile) {
    notFound();
  }

  // Find the corresponding PDF file
  const pdfPath = findPdfFile(textFile.originalKey || textFile.title);

  return <TextPageClient textFile={textFile} pdfPath={pdfPath} />;
}