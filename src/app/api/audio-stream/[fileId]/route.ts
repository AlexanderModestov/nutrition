import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/google-drive';
import { google } from 'googleapis';

export async function GET(
  request: NextRequest,
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

    // Initialize Google Drive with service account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: 'uniquers',
        private_key_id: 'dummy',
        private_key: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
        client_id: 'dummy'
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    const drive = google.drive({ version: 'v3', auth });

    // Get file metadata first
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'name,mimeType,size'
    });

    // Handle range requests for audio streaming
    const range = request.headers.get('range');
    const fileSize = parseInt(fileMetadata.data.size || '0');
    
    if (range) {
      // Parse range header (e.g., "bytes=0-1023")
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      // Get partial file content
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { 
        responseType: 'stream',
        headers: {
          'Range': `bytes=${start}-${end}`
        }
      });

      // Create response with partial content
      const headers = new Headers();
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Length', chunksize.toString());
      headers.set('Content-Type', fileMetadata.data.mimeType || 'audio/mpeg');

      // Convert stream to ReadableStream
      const readableStream = new ReadableStream({
        start(controller) {
          response.data.on('data', (chunk: Buffer) => {
            controller.enqueue(new Uint8Array(chunk));
          });
          
          response.data.on('end', () => {
            controller.close();
          });
          
          response.data.on('error', (err: Error) => {
            controller.error(err);
          });
        }
      });

      return new NextResponse(readableStream, {
        status: 206, // Partial Content
        headers
      });
    } else {
      // Full file request
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      const headers = new Headers();
      headers.set('Content-Type', fileMetadata.data.mimeType || 'audio/mpeg');
      headers.set('Content-Length', fileSize.toString());
      headers.set('Accept-Ranges', 'bytes');

      // Convert stream to ReadableStream
      const readableStream = new ReadableStream({
        start(controller) {
          response.data.on('data', (chunk: Buffer) => {
            controller.enqueue(new Uint8Array(chunk));
          });
          
          response.data.on('end', () => {
            controller.close();
          });
          
          response.data.on('error', (err: Error) => {
            controller.error(err);
          });
        }
      });

      return new NextResponse(readableStream, {
        status: 200,
        headers
      });
    }
  } catch (error) {
    console.error('Error streaming audio from Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to stream audio' },
      { status: 500 }
    );
  }
}