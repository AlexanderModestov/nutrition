export interface TextFile {
  slug: string;
  title: string;
  content: string;
  filename: string;
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

export function formatTextContent(content: string): string {
  // Split content into paragraphs and clean up
  const paragraphs = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  return paragraphs.join('\n\n');
}