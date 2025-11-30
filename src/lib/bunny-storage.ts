interface BunnyFile {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  IsDirectory: boolean;
  ServerId: number;
  ArrayNumber: number;
  DateCreated: string;
  FileId: string;
  Checksum: string | null;
  ReplicatedZones: string | null;
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

class BunnyStorageService {
  private readonly storageZoneName: string;
  private readonly apiKey: string;
  private readonly storageEndpoint: string;
  private readonly pullZoneUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  constructor() {
    this.storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME || '';
    this.apiKey = process.env.BUNNY_STORAGE_API_KEY || '';
    this.storageEndpoint = process.env.BUNNY_STORAGE_ENDPOINT || 'https://uk.storage.bunnycdn.com';
    this.pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL || '';

    if (!this.storageZoneName || !this.apiKey) {
      console.warn('Bunny Storage credentials not configured. Videos will not be available.');
    }
  }

  private ensureAuthenticated() {
    if (!this.apiKey || !this.storageZoneName) {
      throw new Error('Bunny Storage credentials not configured');
    }
  }

  private getCacheKey(path?: string, fileType?: string): string {
    return `${path || 'root'}-${fileType || 'all'}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private isVideoFile(filename: string): boolean {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    return videoExtensions.includes(this.getFileExtension(filename));
  }

  private isAudioFile(filename: string): boolean {
    const audioExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'];
    return audioExtensions.includes(this.getFileExtension(filename));
  }

  private formatFileSize(bytes: number): string {
    return Math.round(bytes / 1024 / 1024) + ' MB';
  }

  private getPublicUrl(filename: string): string {
    // Use Pull Zone URL for public access (CDN)
    return `${this.pullZoneUrl}/${encodeURIComponent(filename)}`;
  }

  async listFiles(path: string = ''): Promise<BunnyFile[]> {
    const cacheKey = this.getCacheKey(path);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      this.ensureAuthenticated();

      const url = `${this.storageEndpoint}/${this.storageZoneName}/${path}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'AccessKey': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Bunny Storage API error: ${response.status} ${response.statusText}`);
      }

      const files: BunnyFile[] = await response.json();

      // Filter out directories, only return files
      const fileList = files.filter(file => !file.IsDirectory);

      this.cache.set(cacheKey, { data: fileList, timestamp: Date.now() });
      return fileList;
    } catch (error) {
      console.error('Error listing Bunny Storage files:', error);
      return [];
    }
  }

  async getVideoFiles(path: string = ''): Promise<MaterialData[]> {
    try {
      this.ensureAuthenticated();

      const cacheKey = `videos-${path || 'root'}`;
      const cached = this.cache.get(cacheKey);

      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      const files = await this.listFiles(path);

      // Filter only video files
      const videoFiles = files.filter(file => this.isVideoFile(file.ObjectName));

      const videoData = videoFiles.map((file) => ({
        id: file.Guid,
        title: file.ObjectName,
        type: "video" as const,
        shortDescription: `Video file: ${file.ObjectName}`,
        fullDescription: `Video file from Bunny CDN. Size: ${this.formatFileSize(file.Length)}`,
        content: {
          url: this.getPublicUrl(file.ObjectName),
          bunnyFileId: file.Guid,
          fileName: file.ObjectName,
          size: this.formatFileSize(file.Length)
        },
        tags: [],
        createdAt: file.DateCreated,
        author: "Bunny CDN"
      }));

      this.cache.set(cacheKey, { data: videoData, timestamp: Date.now() });
      return videoData;
    } catch (error) {
      console.error('Error listing Bunny Storage video files:', error);
      return [];
    }
  }

  async getPodcastFiles(path: string = ''): Promise<MaterialData[]> {
    try {
      this.ensureAuthenticated();

      const cacheKey = `podcasts-${path || 'root'}`;
      const cached = this.cache.get(cacheKey);

      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      const files = await this.listFiles(path);

      // Filter only audio files
      const audioFiles = files.filter(file => this.isAudioFile(file.ObjectName));

      const podcastData = audioFiles.map((file) => ({
        id: file.Guid,
        title: file.ObjectName,
        type: "podcast" as const,
        shortDescription: `Podcast file: ${file.ObjectName}`,
        fullDescription: `Podcast file from Bunny CDN. Size: ${this.formatFileSize(file.Length)}`,
        content: {
          url: this.getPublicUrl(file.ObjectName),
          bunnyFileId: file.Guid,
          fileName: file.ObjectName,
          size: this.formatFileSize(file.Length)
        },
        tags: [],
        createdAt: file.DateCreated,
        author: "Bunny CDN"
      }));

      this.cache.set(cacheKey, { data: podcastData, timestamp: Date.now() });
      return podcastData;
    } catch (error) {
      console.error('Error listing Bunny Storage podcast files:', error);
      return [];
    }
  }

  async getTextFiles(path: string = ''): Promise<MaterialData[]> {
    // Not implemented for Bunny Storage since user only has videos
    return [];
  }

  async getUrlFiles(path: string = ''): Promise<MaterialData[]> {
    // Not implemented for Bunny Storage since user only has videos
    return [];
  }
}

export const bunnyStorageService = new BunnyStorageService();
