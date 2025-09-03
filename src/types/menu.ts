import { OcrProvider } from './ocr';

export interface MenuItem {
  id: string;
  name: string;
  originalName: string;
  description: string;
  originalDescription: string;
  simplifiedDescription: string;
  ingredientTranslations: IngredientTranslation[];
  section: string;
  price: string;
  currency: string;
  confidence: number;
  proteins: string[];
  meatProteins: string[];
  meatTypes: MeatType[];
  cookingMethods: CookingMethod[];
  allergens: string[];
  herbsSpices: string[];
  dietaryInfo: DietaryInfo;
  imageUrl: string;
  nutritionEstimate?: NutritionInfo;
}

export interface IngredientTranslation {
  original: string;
  translation: string;
  explanation: string;
}

export interface DietaryInfo {
  vegetarian: boolean;
  vegan: boolean;
  halal: boolean;
  kosher: boolean;
  pescatarian: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  nutFree: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface ProcessedMenu {
  id: string;
  originalLanguage: string;
  targetLanguage: string;
  sections: MenuSection[];
  processingTime: number;
  totalItems: number;
  ocrProvider?: OcrProvider;
  ocrConfidence?: number;
}

export interface UserSettings {
  targetLanguage: string;
  nativeCurrency: string;
  showOriginalText: boolean;
  showAllergenHighlights: boolean;
  showNutritionInfo: boolean;
  maxItemsDisplay: number;
  imageSize: 'small' | 'medium' | 'large';
  parseOnlyMode: boolean;
  activeMeatFilters: MeatType[];
  activeCookingMethodFilters: CookingMethod[];
}

export interface ProcessingStatus {
  stage: 'uploading' | 'ocr' | 'parsing' | 'translating' | 'analyzing' | 'generating-images' | 'complete' | 'error';
  progress: number;
  message: string;
}

export type DietaryRestriction = 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'pescatarian' | 'glutenFree' | 'dairyFree' | 'nutFree';

export type MeatType = 'beef' | 'pork' | 'lamb' | 'poultry' | 'seafood' | 'vegetarian' | 'vegan';

export type CookingMethod = 'grilled' | 'fried' | 'steamed' | 'baked' | 'raw' | 'sautéed' | 'roasted' | 'braised' | 'boiled' | 'smoked' | 'barbecued';