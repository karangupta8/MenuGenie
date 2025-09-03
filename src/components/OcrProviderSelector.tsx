import React from 'react';
import { OcrProvider } from '../types/ocr';
import { getProviderInfo, validateOcrConfig } from '../config/ocrConfig';
import { CheckCircle, XCircle, Settings } from 'lucide-react';

interface OcrProviderSelectorProps {
  selectedProvider: OcrProvider;
  onProviderChange: (provider: OcrProvider) => void;
  className?: string;
}

export const OcrProviderSelector: React.FC<OcrProviderSelectorProps> = ({
  selectedProvider,
  onProviderChange,
  className = ''
}) => {
  const validation = validateOcrConfig();
  const providers: OcrProvider[] = ['tesseract', 'google-vision', 'ocr-space'];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover-lift ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-orange-600" />
        OCR Provider
      </h3>
      
      <div className="space-y-3">
        {providers.map((provider) => {
          const info = getProviderInfo(provider);
          const isConfigured = validation.availableProviders.includes(provider);
          const isSelected = selectedProvider === provider;
          
          return (
            <button
              key={provider}
              onClick={() => onProviderChange(provider)}
              disabled={!isConfigured && provider !== 'tesseract'}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : isConfigured
                  ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{info.name}</div>
                    <div className="text-sm text-gray-600">{info.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isConfigured ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : provider === 'tesseract' ? (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  {isSelected && (
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse-gentle" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Tesseract.js works offline and requires no API key. 
          Google Vision and OCR.space provide higher accuracy but require API keys.
        </p>
      </div>
    </div>
  );
};