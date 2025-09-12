import { NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/google-drive';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Get podcast metadata from local JSON file
    const configPath = path.join(process.cwd(), 'public', 'configs', 'podcast_descriptions.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const localPodcastData = JSON.parse(configContent);

    // Get podcast files from Google Drive with timeout
    const podcastFolderId = process.env.GOOGLE_DRIVE_PODCAST_FOLDER_ID;
    let drivePodcasts: any[] = [];
    
    if (podcastFolderId && podcastFolderId !== 'your-podcast-folder-id') {
      try {
        // Add timeout to Google Drive calls
        const drivePromise = googleDriveService.getPodcastFiles(podcastFolderId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Drive API timeout')), 5000)
        );
        
        drivePodcasts = await Promise.race([drivePromise, timeoutPromise]) as any[];
        console.log(`Found ${drivePodcasts.length} podcast files in Google Drive`);
      } catch (error) {
        console.warn('Could not fetch podcast files from Google Drive:', error);
        // Continue with local files only
      }
    } else {
      console.log('Google Drive podcast folder not configured, using local files only');
    }

    // Create a map of drive podcasts by filename (without extension)
    const drivePodcastMap = new Map();
    drivePodcasts.forEach(podcast => {
      // Extract filename without extension for matching
      const nameWithoutExt = podcast.title.replace(/\.(mp3|wav|m4a|aac|ogg|flac|mpeg)$/i, '');
      drivePodcastMap.set(nameWithoutExt, podcast);
    });

    // Combine local metadata with Google Drive URLs
    const combinedPodcasts: any = {};
    
    if (localPodcastData.videos) {
      Object.entries(localPodcastData.videos).forEach(([podcastId, metadata]: [string, any]) => {
        // Try to find matching podcast in Google Drive
        const drivePodcast = drivePodcastMap.get(podcastId);
        
        combinedPodcasts[podcastId] = {
          name: metadata.name,
          short_description: metadata.short_description,
          long_description: metadata.long_description,
          // Use streaming API if Google Drive file exists, otherwise local path as fallback
          url: drivePodcast ? `/api/audio-stream/${drivePodcast.content.driveFileId}` : `/data/podcast/${podcastId}.mp3`,
          drive_file_id: drivePodcast ? drivePodcast.content.driveFileId : null,
          has_drive_file: !!drivePodcast
        };
      });
    }

    // Also add any Google Drive podcasts that don't have local metadata
    drivePodcasts.forEach(drivePodcast => {
      const nameWithoutExt = drivePodcast.title.replace(/\.(mp3|wav|m4a|aac|ogg|flac|mpeg)$/i, '');
      if (!combinedPodcasts[nameWithoutExt]) {
        combinedPodcasts[nameWithoutExt] = {
          name: drivePodcast.title,
          short_description: `Podcast from Google Drive: ${drivePodcast.title}`,
          long_description: `Podcast file from Google Drive. Size: ${drivePodcast.content.size || 'Unknown'}`,
          url: `/api/audio-stream/${drivePodcast.content.driveFileId}`,
          drive_file_id: drivePodcast.content.driveFileId,
          has_drive_file: true
        };
      }
    });
    
    return NextResponse.json({ podcasts: combinedPodcasts });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch podcasts' },
      { status: 500 }
    );
  }
}