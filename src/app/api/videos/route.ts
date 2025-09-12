import { NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/google-drive';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Get video metadata from local JSON file
    const configPath = path.join(process.cwd(), 'public', 'configs', 'video_descriptions.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const localVideoData = JSON.parse(configContent);

    // Get video files from Google Drive with timeout
    const videoFolderId = process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID;
    let driveVideos: any[] = [];
    
    if (videoFolderId) {
      try {
        // Add timeout to Google Drive calls
        const drivePromise = googleDriveService.getVideoFiles(videoFolderId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Drive API timeout')), 5000)
        );
        
        driveVideos = await Promise.race([drivePromise, timeoutPromise]) as any[];
        console.log(`Found ${driveVideos.length} video files in Google Drive`);
      } catch (error) {
        console.warn('Could not fetch video files from Google Drive:', error);
        // Continue with local files only
      }
    } else {
      console.log('Google Drive video folder not configured, using local files only');
    }

    // Create a map of drive videos by filename (without extension)
    const driveVideoMap = new Map();
    driveVideos.forEach(video => {
      // Extract filename without extension for matching
      const nameWithoutExt = video.title.replace(/\.(mp4|mov|avi|wmv|flv|webm)$/i, '');
      driveVideoMap.set(nameWithoutExt, video);
    });

    // Combine local metadata with Google Drive URLs
    const combinedVideos: any = {};
    
    if (localVideoData.videos) {
      Object.entries(localVideoData.videos).forEach(([videoId, metadata]: [string, any]) => {
        // Try to find matching video in Google Drive
        const driveVideo = driveVideoMap.get(videoId);
        
        combinedVideos[videoId] = {
          name: metadata.name,
          short_description: metadata.short_description,
          long_description: metadata.long_description,
          // Only use Google Drive streaming API
          url: driveVideo ? `/api/video-stream/${driveVideo.content.driveFileId}` : null,
          drive_file_id: driveVideo ? driveVideo.content.driveFileId : null,
          has_drive_file: !!driveVideo
        };
      });
    }

    // Also add any Google Drive videos that don't have local metadata
    driveVideos.forEach(driveVideo => {
      const nameWithoutExt = driveVideo.title.replace(/\.(mp4|mov|avi|wmv|flv|webm)$/i, '');
      if (!combinedVideos[nameWithoutExt]) {
        combinedVideos[nameWithoutExt] = {
          name: driveVideo.title,
          short_description: `Video from Google Drive: ${driveVideo.title}`,
          long_description: `Video file from Google Drive. Size: ${driveVideo.content.size || 'Unknown'}`,
          url: `/api/video-stream/${driveVideo.content.driveFileId}`,
          drive_file_id: driveVideo.content.driveFileId,
          has_drive_file: true
        };
      }
    });
    
    return NextResponse.json({ videos: combinedVideos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}