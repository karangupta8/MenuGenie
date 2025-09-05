import { useState, useCallback } from 'react';
import { ProcessedMenu, ProcessingStatus, UserSettings } from '../types/menu';
import { OcrProvider, OcrProgress } from '../types/ocr';
import { MenuService } from '../services/menuService';
import { getOcrConfig } from '../config/ocrConfig';

const defaultSettings: UserSettings = {
  targetLanguage: 'en',
  nativeCurrency: 'USD',
  showOriginalText: true,
  showAllergenHighlights: true,
  showNutritionInfo: true,
  maxItemsDisplay: 0,
  imageSize: 'medium',
  parseOnlyMode: false,
  activeMeatFilters: [],
  activeCookingMethodFilters: [],
};

export const useMenu = () => {
  const [menu, setMenu] = useState<ProcessedMenu | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedOcrProvider, setSelectedOcrProvider] = useState<OcrProvider>(() => {
    const config = getOcrConfig();
    return config.provider;
  });

  const menuService = new MenuService();

  const processFile = useCallback(async (file: File) => {
    // Store uploaded image for display
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    setIsProcessing(true);
    setMenu(null);
    setProcessingStatus(null); // Clear previous status
    
    try {
      // Pass the current target language from settings
      const processedMenu = await menuService.processMenu(
        file, 
        setProcessingStatus, 
        settings.targetLanguage, 
        settings.activeMeatFilters,
        selectedOcrProvider
      );
      setMenu(processedMenu);
    } catch (error) {
      console.error("Error during menu processing:", error);
      setProcessingStatus({
        stage: 'error',
        progress: 0,
        message: `Processing failed: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [settings.targetLanguage, settings.activeMeatFilters, selectedOcrProvider]);

  const exportJson = useCallback(() => {
    if (menu) {
      const jsonData = menuService.exportToJson(menu);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [menu, menuService]);

  const exportHtml = useCallback(() => {
    if (menu) {
      const htmlData = menuService.exportToHtml(menu);
      const blob = new Blob([htmlData], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [menu, menuService]);

  const resetMenu = useCallback(() => {
    setMenu(null);
    setProcessingStatus(null);
    setIsProcessing(false);
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
  }, [uploadedImage]);

  return {
    menu,
    processingStatus,
    settings,
    isProcessing,
    uploadedImage,
    processFile,
    setSettings,
    exportJson,
    exportHtml,
    resetMenu,
    selectedOcrProvider,
    setSelectedOcrProvider,
  };
};