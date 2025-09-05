import { OcrService } from './ocr/ocrService';
import { LlmService } from './llmService';
import { ApiService } from './apiService';
import { validateApiKeys, convertCurrency, getCurrencySymbol } from '../config/api';
import { MenuItem, ProcessedMenu, ProcessingStatus, MeatType, UserSettings } from '../types/menu';
import { OcrProvider, OcrProgress } from '../types/ocr';

export class MenuService {
  private ocrService: OcrService;
  private llmService: LlmService;
  private apiService: ApiService;

  constructor() {
    this.ocrService = OcrService.getInstance();
    this.llmService = LlmService.getInstance();
    this.apiService = ApiService.getInstance();
  }

  async processMenu(
    file: File,
    setProcessingStatus: (status: ProcessingStatus) => void,
    targetLanguage: string = 'en',
    meatFilters: MeatType[] = [],
    ocrProvider?: OcrProvider
  ): Promise<ProcessedMenu> {
    try {
      // Step 1: Extract text from image using selected OCR provider
      setProcessingStatus({
        stage: 'ocr',
        progress: 10,
        message: 'Starting OCR processing...',
      });

      const ocrResult = await this.ocrService.processImage(
        file,
        (ocrProgress: OcrProgress) => {
          // Convert OCR progress to menu processing status
          setProcessingStatus({
            stage: 'ocr',
            progress: Math.round(10 + (ocrProgress.progress * 0.3)), // 10-40%
            message: ocrProgress.message,
          });
        },
        ocrProvider
      );

      const extractedText = ocrResult.text;
      
      if (!extractedText.trim()) {
        throw new Error('No text could be extracted from the image');
      }

      // Step 2: Process menu data through LLM
      setProcessingStatus({
        stage: 'parsing',
        progress: 45,
        message: 'Analyzing menu structure...',
      });

      const processedMenu = await this.llmService.processMenuData(
        extractedText, 
        targetLanguage,
        (llmProgress) => {
          // Convert LLM progress to menu processing status
          setProcessingStatus({
            stage: 'parsing',
            progress: Math.round(45 + (llmProgress.progress * 0.35)), // 45-80%
            message: `LLM Processing: ${llmProgress.message}`,
          });
        }
      );

      // Step 3: Flatten items from all sections
      const allItems = processedMenu.sections.flatMap(section => section.items);

      // Step 4: Filter items based on dietary restrictions
      const filteredItems = this.filterItemsByMeatType(allItems, meatFilters);

      // Step 5: Generate images for menu items
      setProcessingStatus({
        stage: 'generating-images',
        progress: 80,
        message: 'Finding food images...',
      });

      const itemsWithImages = await this.generateImagesForItems(filteredItems, setProcessingStatus);

      // Step 6: Re-integrate processed items back into sections
      const updatedSections = processedMenu.sections.map(section => ({
        ...section,
        items: section.items.map(item => {
          const updatedItem = itemsWithImages.find(updated => updated.id === item.id);
          return updatedItem || item;
        })
      }));

      // Step 7: Complete processing
      setProcessingStatus({
        stage: 'complete',
        progress: 100,
        message: 'Menu processing complete!',
      });

      return {
        ...processedMenu,
        sections: updatedSections,
        ocrProvider: ocrResult.provider,
        ocrConfidence: ocrResult.confidence,
      };

    } catch (error) {
      console.error('Menu processing error:', error);
      setProcessingStatus({
        stage: 'error',
        progress: 0,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  /**
   * Cancel ongoing OCR operation
   */
  async cancelProcessing(): Promise<void> {
    await this.ocrService.cancelOperation();
  }

  private filterItemsByMeatType(items: MenuItem[], filters: MeatType[]): MenuItem[] {
    if (filters.length === 0) return items;

    return items.filter(item => {
      return filters.every(filter => {
        switch (filter) {
          case 'vegetarian':
            return item.dietaryInfo.vegetarian;
          case 'vegan':
            return item.dietaryInfo.vegan;
          case 'beef':
          case 'pork':
          case 'lamb':
          case 'poultry':
          case 'seafood':
            return item.meatTypes && item.meatTypes.includes(filter);
          default:
            return true;
        }
      });
    });
  }

  private async generateImagesForItems(
    items: MenuItem[], 
    setProcessingStatus?: (status: ProcessingStatus) => void
  ): Promise<MenuItem[]> {
    const itemsWithImages: MenuItem[] = [];
    
    // Check if Pexels API key is configured
    const validation = validateApiKeys();
    if (!validation.isValid && validation.missingKeys.includes('Pexels API Key')) {
      console.warn('Pexels API key not configured. Skipping image generation.');
      setProcessingStatus?.({
        stage: 'generating-images',
        progress: 100,
        message: 'Skipping image generation - Pexels API key not configured',
      });
      
      // Return items with empty image URLs
      return items.map(item => ({ ...item, imageUrl: '' }));
    }
    
    // Process items in batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Update progress before processing batch
      const currentProgress = 80 + Math.round((i / items.length) * 15);
      setProcessingStatus?.({
        stage: 'generating-images',
        progress: currentProgress,
        message: `Finding food images... (${i + 1}/${items.length})`,
      });
      
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          try {
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const imageUrl = await this.apiService.searchFoodImage(item.name);
            console.log(`Image search for "${item.name}":`, imageUrl ? 'Found' : 'Not found');
            return {
              ...item,
              imageUrl: imageUrl || ''
            };
          } catch (error) {
            console.warn(`Failed to find image for ${item.name}:`, error);
            return {
              ...item,
              imageUrl: ''
            };
          }
        })
      );
      
      itemsWithImages.push(...batchResults);
    }
    
    return itemsWithImages;
  }

  exportToJson(menu: ProcessedMenu): string {
    // Create a comprehensive export object with metadata
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
        originalLanguage: menu.originalLanguage,
        targetLanguage: menu.targetLanguage,
        totalItems: menu.totalItems,
        processingTime: menu.processingTime,
        ocrProvider: menu.ocrProvider,
        ocrConfidence: menu.ocrConfidence,
      },
      menu: {
        id: menu.id,
        originalLanguage: menu.originalLanguage,
        targetLanguage: menu.targetLanguage,
        sections: menu.sections,
        processingTime: menu.processingTime,
        totalItems: menu.totalItems,
        ocrProvider: menu.ocrProvider,
        ocrConfidence: menu.ocrConfidence,
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  exportToHtml(menu: ProcessedMenu, settings?: UserSettings): string {
    const allItems = menu.sections.flatMap(section => section.items);
    
    // Helper function to format price with currency conversion
    const formatPrice = (item: MenuItem) => {
      const originalPrice = parseFloat(item.price) || 0;
      const originalCurrencySymbol = item.currency || '$';
      
      if (!settings || !originalPrice) {
        return `${originalCurrencySymbol}${item.price}`;
      }
      
      const convertedPrice = convertCurrency(originalPrice, 'USD', settings.nativeCurrency);
      const nativeCurrencySymbol = getCurrencySymbol(settings.nativeCurrency);
      const showConvertedPrice = settings.nativeCurrency !== 'USD' && originalPrice > 0;
      
      if (showConvertedPrice) {
        return `
          <div class="price-container">
            <div class="original-price">${originalCurrencySymbol}${item.price}</div>
            <div class="converted-price">${nativeCurrencySymbol}${convertedPrice.toFixed(2)}</div>
          </div>
        `;
      } else {
        return `${originalCurrencySymbol}${item.price}`;
      }
    };
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu Export - ${menu.originalLanguage} to ${menu.targetLanguage}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 1000px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8fafc;
            color: #1f2937;
        }
        .menu-header { 
            text-align: center; 
            margin-bottom: 40px; 
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .menu-header h1 { 
            color: #1f2937; 
            margin-bottom: 10px; 
            font-size: 2.5rem;
        }
        .menu-header p { 
            color: #6b7280; 
            margin: 5px 0;
        }
        .menu-stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
            font-size: 0.9rem;
            color: #6b7280;
        }
        .menu-item { 
            background: white;
            border: 1px solid #e5e7eb; 
            margin: 20px 0; 
            padding: 20px; 
            border-radius: 12px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: box-shadow 0.2s;
        }
        .menu-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .item-header {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }
        .item-content {
            flex: 1;
        }
        .item-image {
            flex-shrink: 0;
            width: 120px;
            height: 120px;
            border-radius: 8px;
            overflow: hidden;
            background: #f3f4f6;
        }
        .item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .item-image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            color: #9ca3af;
            font-size: 0.8rem;
        }
        .item-name { 
            font-size: 1.4rem; 
            font-weight: 700; 
            margin-bottom: 8px; 
            color: #1f2937;
        }
        .item-original-name {
            font-size: 1rem;
            color: #6b7280;
            font-style: italic;
            margin-bottom: 8px;
        }
        .item-description { 
            color: #4b5563; 
            margin-bottom: 12px; 
            line-height: 1.5;
        }
        .item-simplified-description {
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 12px;
            padding: 8px 12px;
            background: #f9fafb;
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
        }
        .price-container {
            margin-bottom: 15px;
        }
        .original-price {
            font-weight: 700;
            color: #6b7280;
            font-size: 1rem;
            text-decoration: line-through;
            margin-bottom: 4px;
        }
        .converted-price {
            font-weight: 700;
            color: #059669;
            font-size: 1.2rem;
        }
        .item-price { 
            font-weight: 700; 
            color: #059669; 
            font-size: 1.2rem;
            margin-bottom: 15px;
        }
        .item-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .detail-section {
            background: #f9fafb;
            padding: 12px;
            border-radius: 8px;
        }
        .detail-section h4 {
            margin: 0 0 8px 0;
            font-size: 0.9rem;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .detail-section ul {
            margin: 0;
            padding-left: 16px;
        }
        .detail-section li {
            margin-bottom: 4px;
            font-size: 0.9rem;
            color: #4b5563;
        }
        .dietary-tags { 
            margin-top: 15px; 
        }
        .dietary-tag { 
            display: inline-block; 
            background: #dbeafe; 
            color: #1e40af;
            padding: 4px 10px; 
            margin: 2px; 
            border-radius: 16px; 
            font-size: 0.8rem;
            font-weight: 500;
        }
        .allergens { 
            color: #dc2626; 
            font-size: 0.9rem; 
            margin-top: 10px;
            padding: 8px 12px;
            background: #fef2f2;
            border-radius: 6px;
            border-left: 3px solid #dc2626;
        }
        .nutrition-info {
            background: #f0fdf4;
            border-left: 3px solid #22c55e;
            padding: 8px 12px;
            border-radius: 6px;
            margin-top: 10px;
        }
        .nutrition-info h4 {
            margin: 0 0 8px 0;
            color: #166534;
            font-size: 0.9rem;
        }
        .nutrition-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            font-size: 0.8rem;
        }
        .nutrition-item {
            text-align: center;
        }
        .nutrition-value {
            font-weight: 600;
            color: #166534;
        }
        .nutrition-label {
            color: #6b7280;
            font-size: 0.7rem;
        }
        .ingredient-translations {
            margin-top: 10px;
        }
        .ingredient-item {
            background: #fefce8;
            border-left: 3px solid #eab308;
            padding: 6px 10px;
            margin: 4px 0;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        .ingredient-original {
            font-weight: 600;
            color: #92400e;
        }
        .ingredient-translation {
            color: #a16207;
        }
        .ingredient-explanation {
            color: #6b7280;
            font-style: italic;
            font-size: 0.8rem;
        }
        .confidence-score {
            display: inline-block;
            background: #f3f4f6;
            color: #374151;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            margin-left: 10px;
        }
        .confidence-high { background: #dcfce7; color: #166534; }
        .confidence-medium { background: #fef3c7; color: #92400e; }
        .confidence-low { background: #fee2e2; color: #dc2626; }
        .currency-info {
            background: #f0f9ff;
            border-left: 3px solid #0ea5e9;
            padding: 8px 12px;
            border-radius: 6px;
            margin-top: 10px;
            font-size: 0.9rem;
            color: #0c4a6e;
        }
        @media (max-width: 768px) {
            .item-header {
                flex-direction: column;
            }
            .item-image {
                width: 100%;
                height: 200px;
            }
            .item-details {
                grid-template-columns: 1fr;
            }
            .nutrition-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="menu-header">
        <h1>️ Menu Export</h1>
        <p><strong>Language:</strong> ${menu.originalLanguage} → ${menu.targetLanguage}</p>
        <p><strong>Processed on:</strong> ${new Date().toLocaleDateString()}</p>
        ${settings && settings.nativeCurrency !== 'USD' ? `
            <p><strong>Currency:</strong> Prices converted to ${getCurrencySymbol(settings.nativeCurrency)} ${settings.nativeCurrency}</p>
        ` : ''}
        <div class="menu-stats">
            <span> ${menu.totalItems} items</span>
            <span>⏱️ ${Math.round(menu.processingTime / 1000)}s processing time</span>
            ${menu.ocrProvider ? `<span> ${menu.ocrProvider} OCR</span>` : ''}
        </div>
    </div>
    
    ${menu.sections.map(section => `
        <div style="margin: 30px 0;">
            <h2 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">
                ${section.name}
            </h2>
            ${section.items.map(item => `
                <div class="menu-item">
                    <div class="item-header">
                        <div class="item-content">
                            <div class="item-name">
                                ${item.name}
                                <span class="confidence-score ${item.confidence >= 80 ? 'confidence-high' : item.confidence >= 60 ? 'confidence-medium' : 'confidence-low'}">
                                    ${item.confidence}% confidence
                                </span>
                            </div>
                            ${item.originalName && item.originalName !== item.name ? `
                                <div class="item-original-name">${item.originalName}</div>
                            ` : ''}
                            <div class="item-description">${item.description}</div>
                            ${item.simplifiedDescription ? `
                                <div class="item-simplified-description">
                                    <strong>💡 Simplified:</strong> ${item.simplifiedDescription}
                                </div>
                            ` : ''}
                            <div class="item-price">${formatPrice(item)}</div>
                        </div>
                        <div class="item-image">
                            ${item.imageUrl ? `
                                <img src="${item.imageUrl}" alt="${item.name}" loading="lazy">
                            ` : `
                                <div class="item-image-placeholder">
                                    No image available
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <div class="item-details">
                        ${item.proteins.length > 0 ? `
                            <div class="detail-section">
                                <h4>🥩 Proteins</h4>
                                <ul>
                                    ${item.proteins.map(protein => `<li>${protein}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${item.cookingMethods.length > 0 ? `
                            <div class="detail-section">
                                <h4> Cooking Methods</h4>
                                <ul>
                                    ${item.cookingMethods.map(method => `<li>${method}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${item.herbsSpices.length > 0 ? `
                            <div class="detail-section">
                                <h4> Herbs & Spices</h4>
                                <ul>
                                    ${item.herbsSpices.map(herb => `<li>${herb}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${item.meatTypes.length > 0 ? `
                            <div class="detail-section">
                                <h4>🍖 Meat Types</h4>
                                <ul>
                                    ${item.meatTypes.map(meat => `<li>${meat}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${item.ingredientTranslations.length > 0 ? `
                        <div class="ingredient-translations">
                            <h4 style="margin: 15px 0 8px 0; color: #374151; font-size: 0.9rem;">🌍 Ingredient Translations</h4>
                            ${item.ingredientTranslations.map(ingredient => `
                                <div class="ingredient-item">
                                    <span class="ingredient-original">${ingredient.original}</span> 
                                    → <span class="ingredient-translation">${ingredient.translation}</span>
                                    ${ingredient.explanation ? `<br><span class="ingredient-explanation">${ingredient.explanation}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="dietary-tags">
                        ${Object.entries(item.dietaryInfo)
                          .filter(([_, value]) => value)
                          .map(([key, _]) => `<span class="dietary-tag">${key}</span>`)
                          .join('')}
                    </div>
                    
                    ${item.allergens.length > 0 ? `
                        <div class="allergens">
                            <strong>⚠️ Allergens:</strong> ${item.allergens.join(', ')}
                        </div>
                    ` : ''}
                    
                    ${item.nutritionEstimate ? `
                        <div class="nutrition-info">
                            <h4> Nutrition Estimate</h4>
                            <div class="nutrition-grid">
                                <div class="nutrition-item">
                                    <div class="nutrition-value">${item.nutritionEstimate.calories}</div>
                                    <div class="nutrition-label">Calories</div>
                                </div>
                                <div class="nutrition-item">
                                    <div class="nutrition-value">${item.nutritionEstimate.protein}g</div>
                                    <div class="nutrition-label">Protein</div>
                                </div>
                                <div class="nutrition-item">
                                    <div class="nutrition-value">${item.nutritionEstimate.carbs}g</div>
                                    <div class="nutrition-label">Carbs</div>
                                </div>
                                <div class="nutrition-item">
                                    <div class="nutrition-value">${item.nutritionEstimate.fat}g</div>
                                    <div class="nutrition-label">Fat</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>`;

    return html;
  }
}