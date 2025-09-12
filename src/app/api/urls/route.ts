import { NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/google-drive';

export async function GET() {
  try {
    // Get URL folder ID from environment variables
    const urlFolderId = process.env.GOOGLE_DRIVE_URL_FOLDER_ID;
    
    const urls = await googleDriveService.getUrlFiles(urlFolderId);
    
    // Transform to match the expected format
    const urlData = {
      urls: urls.reduce((acc, url) => {
        acc[url.id] = {
          name: url.title,
          short_description: url.shortDescription,
          long_description: url.fullDescription,
          url: url.content.url,
          drive_file_id: url.content.driveFileId
        };
        return acc;
      }, {} as any)
    };
    
    return NextResponse.json(urlData);
  } catch (error) {
    console.error('Error fetching URLs from Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URLs from Google Drive' },
      { status: 500 }
    );
  }
}