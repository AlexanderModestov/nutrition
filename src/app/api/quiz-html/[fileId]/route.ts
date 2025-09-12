import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId;
    
    // Path to the quiz HTML file
    const quizFilePath = path.join(process.cwd(), 'src', 'app', 'quizes', 'quizes', `${fileId}.html`);
    
    // Check if the file exists
    try {
      await fs.access(quizFilePath);
    } catch (error) {
      console.error(`Quiz file not found: ${quizFilePath}`);
      return NextResponse.json(
        { error: 'Quiz file not found' },
        { status: 404 }
      );
    }
    
    // Read the HTML file
    const htmlContent = await fs.readFile(quizFilePath, 'utf8');
    
    // Return the HTML content with proper headers
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving quiz HTML:', error);
    return NextResponse.json(
      { error: 'Failed to load quiz' },
      { status: 500 }
    );
  }
}