import { NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/google-drive';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Get text metadata from PDF descriptions JSON file
    const configPath = path.join(process.cwd(), 'public', 'configs', 'pdf_descriptions.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const localTextData = JSON.parse(configContent);

    // Get text files from Google Drive with timeout
    const textFolderId = process.env.GOOGLE_DRIVE_TEXT_FOLDER_ID;
    let driveTexts: any[] = [];
    
    if (textFolderId) {
      try {
        // Add timeout to Google Drive calls (increased for text files that need content download)
        const drivePromise = googleDriveService.getTextFiles(textFolderId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Drive API timeout')), 15000)
        );
        
        driveTexts = await Promise.race([drivePromise, timeoutPromise]) as any[];
        console.log(`Found ${driveTexts.length} text files in Google Drive`);
      } catch (error) {
        console.warn('Could not fetch text files from Google Drive:', error);
        // Continue with local files only
      }
    } else {
      console.log('Google Drive text folder not configured, using local files only');
    }

    // Create a map of drive texts by filename (without extension)
    const driveTextMap = new Map();
    driveTexts.forEach(text => {
      // Extract filename without extension for matching
      const nameWithoutExt = text.title.replace(/\.(txt|md|doc|docx)$/i, '');
      driveTextMap.set(nameWithoutExt, text);
    });

    // Combine local metadata with Google Drive content
    const combinedTexts: any = {};
    
    if (localTextData.texts) {
      Object.entries(localTextData.texts).forEach(([textId, metadata]: [string, any]) => {
        // Try to find matching text in Google Drive
        const driveText = driveTextMap.get(textId);
        
        combinedTexts[textId] = {
          name: metadata.name,
          short_description: metadata.short_description,
          long_description: metadata.long_description,
          // Use Google Drive content if available, otherwise empty
          content: driveText ? driveText.content.text : '',
          drive_file_id: driveText ? driveText.content.driveFileId : null,
          has_drive_file: !!driveText
        };
      });
    }

    // Also add any Google Drive texts that don't have local metadata
    driveTexts.forEach(driveText => {
      const nameWithoutExt = driveText.title.replace(/\.(txt|md|doc|docx)$/i, '');
      if (!combinedTexts[nameWithoutExt]) {
        combinedTexts[nameWithoutExt] = {
          name: driveText.title,
          short_description: `Text from Google Drive: ${driveText.title}`,
          long_description: `Text file from Google Drive. Content from ${driveText.title}`,
          content: driveText.content.text || '',
          drive_file_id: driveText.content.driveFileId,
          has_drive_file: true
        };
      }
    });
    
    return NextResponse.json({ texts: combinedTexts });
  } catch (error) {
    console.error('Error fetching texts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch texts' },
      { status: 500 }
    );
  }
}