import React, { useState } from 'react';
import { validateApiKeys } from './config/api';
import { validateOcrConfig } from './config/ocrConfig';
import { MenuUpload } from './components/MenuUpload';
import { OcrProgressDisplay } from './components/OcrProgressDisplay';
import { MenuGrid } from './components/MenuGrid';
import { ApiKeyManager } from './components/ApiKeyManager';
import { UploadedImageDisplay } from './components/UploadedImageDisplay';
import { FilterPanel } from './components/FilterPanel';
import { HeroSection } from './components/HeroSection';
import { ProcessingStatus } from './components/ProcessingStatus';
import { useMenu } from './hooks/useMenu';
import { OcrProgress } from './types/ocr';
import { ChefHat, Sparkles, RotateCcw, AlertCircle, X, Download, FileText } from 'lucide-react';

function App() {
  const {
    menu,
    processingStatus,
    settings,
    isProcessing,
    uploadedImage,
    selectedOcrProvider,
    processFile,
    setSettings,
    setSelectedOcrProvider,
    exportJson,
    exportHtml,
    resetMenu,
  } = useMenu();

  const [showApiWarning, setShowApiWarning] = useState(false);
  const [showApiManager, setShowApiManager] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);

  // Check API configuration on component mount
  React.useEffect(() => {
    const apiValidation = validateApiKeys();
    const ocrValidation = validateOcrConfig();
    
    // Show warning if no API keys are configured (OCR has Tesseract fallback)
    setShowApiWarning(!apiValidation.isValid);
  }, []);

  const allMenuItems = menu?.sections.flatMap(section => section.items) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="glass-effect shadow-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="gradient-bg p-2 rounded-xl animate-float">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-fade-in">
                  MenuGenie
                </h1>
                <p className="text-sm text-gray-600">AI-Powered Menu Translation & Analysis</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* OCR Progress Display */}
              {ocrProgress && ocrProgress.stage !== 'complete' && (
                <div className="mr-4">
                  <OcrProgressDisplay 
                    progress={ocrProgress}
                    onCancel={() => {
                      // Cancel OCR operation
                      setOcrProgress(null);
                      setIsProcessing(false);
                    }}
                  />
                </div>
              )}

              {menu && (
                <button
                  onClick={resetMenu}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift focus-ring"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New Menu</span>
                </button>
              )}
              
              {menu && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportJson}
                    className="flex items-center space-x-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift focus-ring"
                  >
                    <Download className="w-4 h-4" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={exportHtml}
                    className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift focus-ring"
                  >
                    <FileText className="w-4 h-4" />
                    <span>HTML</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* API Configuration Warning */}
      {showApiWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>API Configuration Required:</strong> To use real menu processing, translation, and image search, 
                  please configure your API keys below. Currently using mock data for demonstration.
                </p>
                <button
                  onClick={() => setShowApiManager(!showApiManager)}
                  className="ml-4 text-yellow-700 underline hover:text-yellow-800 transition-colors duration-200 focus-ring"
                >
                  Configure APIs
                </button>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowApiWarning(false)}
                    className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-400 hover:bg-yellow-100 transition-colors duration-200 focus-ring"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* API Key Manager */}
        {showApiWarning && showApiManager && (
          <div className="mb-6 animate-scale-in">
            <ApiKeyManager onKeysUpdated={() => setShowApiWarning(false)} />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 animate-fade-in">
              <FilterPanel 
                settings={settings} 
                onSettingsChange={setSettings}
                selectedOcrProvider={selectedOcrProvider}
                onOcrProviderChange={setSelectedOcrProvider}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Uploaded Image Display */}
            {uploadedImage && (
              <div className="mb-6 animate-scale-in">
                <UploadedImageDisplay 
                  imageUrl={uploadedImage} 
                  onRemove={resetMenu}
                />
              </div>
            )}

            {!menu && !processingStatus && (
              <HeroSection 
                onFileUpload={processFile} 
                isProcessing={isProcessing}
                selectedOcrProvider={selectedOcrProvider}
              />
            )}

            {(processingStatus || ocrProgress) && (
              <div className="flex justify-center animate-scale-in">
                {ocrProgress && ocrProgress.stage !== 'complete' ? (
                  <OcrProgressDisplay 
                    progress={ocrProgress}
                    onCancel={() => {
                      setOcrProgress(null);
                      setIsProcessing(false);
                    }}
                  />
                ) : processingStatus ? (
                  <ProcessingStatus status={processingStatus} />
                ) : null}
              </div>
            )}

            {menu && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-lg shadow-sm p-6 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Processed Menu Results
                      </h2>
                      <p className="text-gray-600">
                        Found {menu.totalItems} items • Processed in {(menu.processingTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>From {menu.originalLanguage.toUpperCase()}</span>
                      <span>→</span>
                      <span>To {menu.targetLanguage.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <MenuGrid items={allMenuItems} settings={settings} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;