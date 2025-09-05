import { OcrService } from './ocr/ocrService';
import { LlmService } from './llmService';
import { ApiService } from './apiService';
import { MenuItem, ProcessedMenu, ProcessingStatus, MeatType } from '../types/menu';
import { OcrProvider, OcrProgress } from '../types/ocr';

export class MenuService {
  private ocrService: OcrService;
  private llmService: LlmService;
  private apiService: ApiService;

  constructor() {
    this.ocrService = OcrService.getInstance();
    this.llmService = new LlmService();
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

      const processedMenu = await this.llmService.processMenuData(extractedText, targetLanguage);

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
          const processedItem = itemsWithImages.find(processed => processed.id === item.id);
          return processedItem || item;
        }).filter(item => filteredItems.some(filtered => filtered.id === item.id))
      })).filter(section => section.items.length > 0);

      // Final completion
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
      console.error('Error processing menu:', error);
      setProcessingStatus({
        stage: 'error',
        progress: 0,
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw new Error(`Failed to process menu: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    // Final image generation progress
    setProcessingStatus?.({
      stage: 'generating-images',
      progress: 95,
      message: `Found images for ${itemsWithImages.filter(item => item.imageUrl).length}/${items.length} items`,
    });
    
    return itemsWithImages;
  }

  exportToJson(menu: ProcessedMenu): string {
    return JSON.stringify(menu, null, 2);
  }

  exportToHtml(menu: ProcessedMenu): string {
    const allItems = menu.sections.flatMap(section => section.items);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu Export</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .menu-header { text-align: center; margin-bottom: 30px; }
        .menu-item { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 8px; }
        .item-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .item-description { color: #666; margin-bottom: 10px; }
        .item-price { font-weight: bold; color: #2563eb; }
        .dietary-tags { margin-top: 10px; }
        .dietary-tag { display: inline-block; background: #e5e7eb; padding: 2px 8px; margin: 2px; border-radius: 12px; font-size: 12px; }
        .allergens { color: #dc2626; font-size: 14px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="menu-header">
        <h1>Menu Export</h1>
        <p>Processed on ${new Date().toLocaleDateString()}</p>
    </div>
    
    ${allItems.map(item => `
        <div class="menu-item">
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description}</div>
            <div class="item-price">${item.currency}${item.price}</div>
            
            <div class="dietary-tags">
                ${Object.entries(item.dietaryInfo)
                  .filter(([_, value]) => value)
                  .map(([key, _]) => `<span class="dietary-tag">${key}</span>`)
                  .join('')}
            </div>
            
            ${item.allergens.length > 0 ? `
                <div class="allergens">
                    <strong>Allergens:</strong> ${item.allergens.join(', ')}
                </div>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`;

    return html;
  }
}