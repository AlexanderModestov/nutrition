import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
}

interface MaterialData {
  id: string;
  title: string;
  type: "video" | "text" | "url" | "podcast";
  shortDescription: string;
  fullDescription: string;
  content: any;
  tags: string[];
  createdAt: string;
  author: string;
}

class GoogleDriveService {
  private drive: any;
  private auth: JWT | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // For production, use service account authentication
      if (process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL) {
        // Use GoogleAuth instead of JWT directly
        const auth = new google.auth.GoogleAuth({
          credentials: {
            type: 'service_account',
            project_id: 'uniquers',
            private_key_id: 'dummy',
            private_key: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
            client_id: 'dummy'
          },
          scopes: ['https://www.googleapis.com/auth/drive.readonly']
        });

        this.drive = google.drive({ version: 'v3', auth });
        this.auth = auth as any;
      } else {
        console.warn('Google Drive credentials not configured. Using mock data.');
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive authentication:', error);
    }
  }

  private async ensureAuthenticated() {
    if (!this.auth) {
      throw new Error('Google Drive authentication not configured');
    }
    return this.auth;
  }

  private getCacheKey(folderId?: string, mimeType?: string): string {
    return `${folderId || 'root'}-${mimeType || 'all'}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  async listFiles(folderId?: string, mimeType?: string): Promise<DriveFile[]> {
    const cacheKey = this.getCacheKey(folderId, mimeType);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      await this.ensureAuthenticated();

      let query = '';
      if (folderId) {
        query += `'${folderId}' in parents`;
      }
      if (mimeType) {
        query += query ? ` and mimeType='${mimeType}'` : `mimeType='${mimeType}'`;
      }
      if (!query) {
        query = "mimeType != 'application/vnd.google-apps.folder'";
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
      });

      const files = response.data.files || [];
      this.cache.set(cacheKey, { data: files, timestamp: Date.now() });
      
      return files;
    } catch (error) {
      console.error('Error listing Google Drive files:', error);
      return [];
    }
  }

  async getFileContent(fileId: string): Promise<string | null> {
    try {
      await this.ensureAuthenticated();

      // Add timeout for Google Docs export
      const exportPromise = this.drive.files.export({
        fileId,
        mimeType: 'text/plain',
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout exporting Google Doc ${fileId}`)), 10000)
      );

      const response = await Promise.race([exportPromise, timeoutPromise]);
      return response.data;
    } catch (error) {
      console.error(`Error getting Google Doc content for ${fileId}:`, error);
      return null;
    }
  }

  async getRegularFileContent(fileId: string): Promise<string | null> {
    try {
      await this.ensureAuthenticated();

      // Add timeout for individual file downloads
      const fetchPromise = this.drive.files.get({
        fileId,
        alt: 'media',
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout fetching content for file ${fileId}`)), 10000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return response.data;
    } catch (error) {
      console.error(`Error getting regular file content for ${fileId}:`, error);
      return null;
    }
  }

  async getVideoFiles(folderId?: string): Promise<MaterialData[]> {
    try {
      await this.ensureAuthenticated();

      // Single API call with OR query for all video types
      let query = '';
      if (folderId) {
        query = `'${folderId}' in parents and (mimeType='video/mp4' or mimeType='video/avi' or mimeType='video/mov' or mimeType='video/quicktime' or mimeType='video/wmv' or mimeType='video/flv' or mimeType='video/webm')`;
      } else {
        query = `mimeType='video/mp4' or mimeType='video/avi' or mimeType='video/mov' or mimeType='video/quicktime' or mimeType='video/wmv' or mimeType='video/flv' or mimeType='video/webm'`;
      }

      const cacheKey = `videos-${folderId || 'root'}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
      });

      const files = response.data.files || [];
      const videoData = files.map((file: any) => ({
        id: file.id,
        title: file.name,
        type: "video" as const,
        shortDescription: `Video file: ${file.name}`,
        fullDescription: `Video file from Google Drive. Size: ${file.size ? Math.round(parseInt(file.size) / 1024 / 1024) + ' MB' : 'Unknown'}`,
        content: { 
          url: file.webContentLink || file.webViewLink,
          driveFileId: file.id,
          size: file.size ? Math.round(parseInt(file.size) / 1024 / 1024) + ' MB' : 'Unknown'
        },
        tags: [],
        createdAt: file.modifiedTime,
        author: "Google Drive"
      }));

      this.cache.set(cacheKey, { data: videoData, timestamp: Date.now() });
      return videoData;
    } catch (error) {
      console.error('Error listing Google Drive video files:', error);
      return [];
    }
  }

  async getTextFiles(folderId?: string): Promise<MaterialData[]> {
    try {
      await this.ensureAuthenticated();

      const cacheKey = `texts-${folderId || 'root'}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      const textMimeTypes = [
        'text/plain',
        'application/vnd.google-apps.document',
        'text/markdown',
        'text/html'
      ];

      const allTextFiles: DriveFile[] = [];
      
      // Fetch file listings first (faster)
      for (const mimeType of textMimeTypes) {
        try {
          const files = await this.listFiles(folderId, mimeType);
          allTextFiles.push(...files);
        } catch (error) {
          console.warn(`Failed to list files for ${mimeType}:`, error);
        }
      }

      console.log(`Found ${allTextFiles.length} text files, fetching content...`);

      // Fetch content for all files in parallel with individual error handling
      const contentPromises = allTextFiles.map(async (file) => {
        try {
          let content = '';
          
          if (file.mimeType === 'application/vnd.google-apps.document') {
            // Use export for Google Docs
            content = await this.getFileContent(file.id) || '';
          } else if (file.mimeType === 'text/plain' || file.mimeType === 'text/markdown' || file.mimeType === 'text/html') {
            // Use regular file download for plain text, markdown, and HTML files
            content = await this.getRegularFileContent(file.id) || '';
          }

          return {
            id: file.id,
            title: file.name,
            type: "text" as const,
            shortDescription: `Text document: ${file.name}`,
            fullDescription: `Text document from Google Drive. Type: ${file.mimeType}`,
            content: { 
              text: content,
              driveFileId: file.id,
              webViewLink: file.webViewLink
            },
            tags: [],
            createdAt: file.modifiedTime,
            author: "Google Drive"
          };
        } catch (error) {
          console.warn(`Failed to fetch content for file ${file.name}:`, error);
          // Return file without content if individual fetch fails
          return {
            id: file.id,
            title: file.name,
            type: "text" as const,
            shortDescription: `Text document: ${file.name}`,
            fullDescription: `Text document from Google Drive. Type: ${file.mimeType}`,
            content: { 
              text: '',
              driveFileId: file.id,
              webViewLink: file.webViewLink
            },
            tags: [],
            createdAt: file.modifiedTime,
            author: "Google Drive"
          };
        }
      });

      // Wait for all content fetches to complete
      const textMaterials = await Promise.all(contentPromises);
      
      this.cache.set(cacheKey, { data: textMaterials, timestamp: Date.now() });
      console.log(`Successfully fetched content for ${textMaterials.filter(t => t.content.text).length}/${textMaterials.length} text files`);
      
      return textMaterials;
    } catch (error) {
      console.error('Error listing Google Drive text files:', error);
      return [];
    }
  }

  async getPodcastFiles(folderId?: string): Promise<MaterialData[]> {
    try {
      await this.ensureAuthenticated();

      // Single API call with OR query for all podcast audio types
      let query = '';
      if (folderId) {
        query = `'${folderId}' in parents and (mimeType='audio/mpeg' or mimeType='audio/mp3' or mimeType='audio/wav' or mimeType='audio/m4a' or mimeType='audio/aac' or mimeType='audio/ogg' or mimeType='audio/flac')`;
      } else {
        query = `mimeType='audio/mpeg' or mimeType='audio/mp3' or mimeType='audio/wav' or mimeType='audio/m4a' or mimeType='audio/aac' or mimeType='audio/ogg' or mimeType='audio/flac'`;
      }

      const cacheKey = `podcasts-${folderId || 'root'}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
      });

      const files = response.data.files || [];
      const podcastData = files.map((file: any) => ({
        id: file.id,
        title: file.name,
        type: "podcast" as const,
        shortDescription: `Podcast file: ${file.name}`,
        fullDescription: `Podcast file from Google Drive. Size: ${file.size ? Math.round(parseInt(file.size) / 1024 / 1024) + ' MB' : 'Unknown'}`,
        content: { 
          url: file.webContentLink || file.webViewLink,
          driveFileId: file.id,
          size: file.size ? Math.round(parseInt(file.size) / 1024 / 1024) + ' MB' : 'Unknown'
        },
        tags: [],
        createdAt: file.modifiedTime,
        author: "Google Drive"
      }));

      this.cache.set(cacheKey, { data: podcastData, timestamp: Date.now() });
      return podcastData;
    } catch (error) {
      console.error('Error listing Google Drive podcast files:', error);
      return [];
    }
  }

  async getUrlFiles(folderId?: string): Promise<MaterialData[]> {
    // For URL files, we'll look for text files that contain URLs
    // or Google Sheets that might contain URL collections
    const files = await this.listFiles(folderId, 'application/vnd.google-apps.spreadsheet');
    
    return files.map(file => ({
      id: file.id,
      title: file.name,
      type: "url" as const,
      shortDescription: `URL collection: ${file.name}`,
      fullDescription: `URL collection from Google Drive spreadsheet`,
      content: { 
        url: file.webViewLink,
        driveFileId: file.id 
      },
      tags: [],
      createdAt: file.modifiedTime,
      author: "Google Drive"
    }));
  }
}

export const googleDriveService = new GoogleDriveService();