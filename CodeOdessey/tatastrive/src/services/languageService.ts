// Simple language detection and translation service
// In a real app, you'd use a proper translation API like Google Translate

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

class LanguageService {
  private currentLanguage: string = 'en';

  setLanguage(languageCode: string): void {
    this.currentLanguage = languageCode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tatastrive_language', languageCode);
    }
  }

  getCurrentLanguage(): string {
    if (typeof window === 'undefined') return this.currentLanguage;
    const saved = localStorage.getItem('tatastrive_language');
    return saved || this.currentLanguage;
  }

  detectLanguage(text: string): string {
    // Simple language detection based on character sets
    // In a real app, you'd use a proper language detection library
    
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi)
    if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0B00-\u0B7F]/.test(text)) return 'mr'; // Marathi
    
    return 'en'; // Default to English
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (targetLanguage === 'en') return text;
    
    // In a real app, you'd call a translation API here
    // For now, we'll return the original text with a note
    return `${text} [Translated to ${this.getLanguageName(targetLanguage)}]`;
  }

  getLanguageName(code: string): string {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : 'English';
  }

  getNativeLanguageName(code: string): string {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.nativeName : 'English';
  }

  // Business plan specific translations
  getBusinessTerms(languageCode: string): Record<string, string> {
    const terms: Record<string, Record<string, string>> = {
      en: {
        problem: 'Problem Statement',
        solution: 'Solution',
        customer: 'Target Customer',
        revenue: 'Revenue Model',
        risks: 'Risks & Mitigation',
      },
      hi: {
        problem: 'समस्या का विवरण',
        solution: 'समाधान',
        customer: 'लक्षित ग्राहक',
        revenue: 'राजस्व मॉडल',
        risks: 'जोखिम और निवारण',
      },
      bn: {
        problem: 'সমস্যার বিবরণ',
        solution: 'সমাধান',
        customer: 'লক্ষ্য গ্রাহক',
        revenue: 'রাজস্ব মডেল',
        risks: 'ঝুঁকি ও প্রশমন',
      },
    };

    return terms[languageCode] || terms.en;
  }
}

export const languageService = new LanguageService();
