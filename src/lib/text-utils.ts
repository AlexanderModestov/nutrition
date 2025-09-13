import fs from 'fs';
import path from 'path';

export interface TextFile {
  slug: string;
  title: string;
  content: string;
  filename: string;
  originalKey?: string;
  shortDescription?: string;
  longDescription?: string;
}

export function generateSlug(title: string): string {
  // Remove .txt extension if present (for backwards compatibility)
  const nameWithoutExt = title.replace(/\.txt$/, '');
  
  // Transliteration map for Cyrillic to Latin
  const transliterationMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo',
    'Ж': 'zh', 'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm',
    'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
    'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'shch',
    'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya'
  };
  
  // Transliterate Cyrillic characters
  let transliterated = nameWithoutExt
    .split('')
    .map(char => transliterationMap[char] || char)
    .join('');
  
  // Convert to lowercase, replace spaces and special characters with hyphens
  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
}

export function getAllTextFiles(): TextFile[] {
  const textsDirectory = path.join(process.cwd(), 'public', 'data', 'text');
  
  if (!fs.existsSync(textsDirectory)) {
    return [];
  }
  
  const filenames = fs.readdirSync(textsDirectory);
  const textFiles = filenames
    .filter(name => name.endsWith('.txt'))
    .map(filename => {
      const filePath = path.join(textsDirectory, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      const title = content.split('\n')[0]?.trim() || filename.replace(/\.txt$/, '');
      
      return {
        slug: generateSlug(filename),
        title,
        content,
        filename
      };
    });
    
  return textFiles;
}

export async function getTextFileBySlug(slug: string): Promise<TextFile | null> {
  try {
    // Try to use the Google Drive service directly if we're on the server
    if (typeof window === 'undefined') {
      const { googleDriveService } = await import('@/lib/google-drive');
      const configPath = path.join(process.cwd(), 'public', 'configs', 'pdf_descriptions.json');
      
      if (!fs.existsSync(configPath)) {
        return null;
      }
      
      const localTextData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      
      // Get text files from Google Drive
      const textFolderId = process.env.GOOGLE_DRIVE_TEXT_FOLDER_ID;
      let driveTexts: any[] = [];
      
      if (textFolderId) {
        try {
          driveTexts = await googleDriveService.getTextFiles(textFolderId);
        } catch (error) {
          console.warn('Could not fetch text files from Google Drive:', error);
        }
      }

      // Create a map of drive texts by filename (without extension)
      const driveTextMap = new Map();
      driveTexts.forEach(text => {
        const nameWithoutExt = text.title.replace(/\.(txt|md|doc|docx)$/i, '');
        driveTextMap.set(nameWithoutExt, text);
      });

      // Find the matching text by slug
      const matchingEntry = Object.entries(localTextData.texts || {}).find(([textTitle]) => 
        generateSlug(textTitle) === slug
      );
      
      if (!matchingEntry) {
        return null;
      }
      
      const [textTitle, textConfig] = matchingEntry as [string, any];
      const driveText = driveTextMap.get(textTitle);
      
      return {
        slug,
        title: textConfig.name,
        content: driveText ? driveText.content.text : '',
        filename: textTitle + '.txt',
        originalKey: textTitle,
        shortDescription: textConfig.short_description,
        longDescription: textConfig.long_description
      };
    } else {
      // Client-side: fetch from API
      const response = await fetch('/api/texts');
      if (!response.ok) {
        console.error('Failed to fetch texts from API');
        return null;
      }
      
      const data = await response.json();
      
      // Find the matching text by slug
      const matchingEntry = Object.entries(data.texts || {}).find(([textTitle]) => 
        generateSlug(textTitle) === slug
      );
      
      if (!matchingEntry) {
        return null;
      }
      
      const [textTitle, textConfig] = matchingEntry as [string, any];
      
      return {
        slug,
        title: textConfig.name,
        content: textConfig.content || '',
        filename: textTitle + '.txt',
        originalKey: textTitle,
        shortDescription: textConfig.short_description,
        longDescription: textConfig.long_description
      };
    }
  } catch (error) {
    console.error('Error loading text file:', error);
    return null;
  }
}

export function formatTextContent(content: string): string {
  // Split content into paragraphs and clean up
  const paragraphs = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  return paragraphs.join('\n\n');
}