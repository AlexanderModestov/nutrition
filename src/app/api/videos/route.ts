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

    // Transform videos from config file
    const videos: any = {};

    if (localVideoData.videos) {
      Object.entries(localVideoData.videos).forEach(([videoId, metadata]: [string, any]) => {
        videos[videoId] = {
          name: metadata.name,
          short_description: metadata.short_description,
          long_description: metadata.long_description,
          // Use URL from config file (BunnyCDN)
          url: metadata.url || null,
        };
      });
    }

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}