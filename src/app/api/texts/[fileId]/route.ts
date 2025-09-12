import { NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/google-drive';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const content = await googleDriveService.getFileContent(fileId);
    
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to fetch file content or file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fileId,
      content
    });
  } catch (error) {
    console.error('Error fetching file content from Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file content from Google Drive' },
      { status: 500 }
    );
  }
}