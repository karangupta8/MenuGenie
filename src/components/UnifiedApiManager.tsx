import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle, ChevronDown, ChevronUp, Settings, Brain, Camera } from 'lucide-react';
import { setTempApiKey, getCurrentApiKeys, isKeyFromEnv } from '../config/api';
import { setTempOcrConfig, getCurrentOcrKeys } from '../config/ocrConfig';
import { setTempLlmConfig, getCurrentLlmKeys, validateLlmConfig, getLlmProviderInfo } from '../config/llmConfig';
import { validateOcrConfig, getProviderInfo } from '../config/ocrConfig';
import { LlmProvider } from '../types/llm';
import { OcrProvider } from '../types/ocr';

interface UnifiedApiManagerProps {
  onKeysUpdated?: () => void;
  defaultExpanded?: boolean;
}

export const UnifiedApiManager: React.FC<UnifiedApiManagerProps> = ({ 
  onKeysUpdated, 
  defaultExpanded = false 
}) => {
  const [keys, setKeys] = useState(() => ({
    ...getCurrentApiKeys(),
    ...getCurrentOcrKeys(),
    ...getCurrentLlmKeys(),
  }));
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  // Initialize selected providers from session storage or defaults
  const [selectedLlmProvider, setSelectedLlmProvider] = useState<LlmProvider>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem('llm_default_provider');
      return (stored as LlmProvider) || 'openai';
    }
    return 'openai';
  });
  
  const [selectedOcrProvider, setSelectedOcrProvider] = useState<OcrProvider>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem('ocr_default_provider');
      return (stored as OcrProvider) || 'tesseract';
    }
    return 'tesseract';
  });

  // Check if we should auto-expand
  useEffect(() => {
    const llmValidation = validateLlmConfig();
    const ocrValidation = validateOcrConfig();
    
    // Auto-expand if no API keys are configured
    if (!llmValidation.isValid || ocrValidation.missingKeys.length > 0) {
      setExpanded(true);
    }
  }, []);

  const handleKeyChange = (keyName: string, value: string) => {
    setKeys(prev => ({ ...prev, [keyName]: value }));
  };

  const toggleShowKey = (keyName: string) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const saveKeys = () => {
    // Save LLM keys
    setTempLlmConfig(selectedLlmProvider, keys[selectedLlmProvider as keyof typeof keys] as string);
    
    // Save OCR keys
    setTempOcrConfig(selectedOcrProvider, keys[selectedOcrProvider === 'google-vision' ? 'googleVision' : 'ocrSpace'] as string);
    
    // Save other keys
    setTempApiKey('openai_api_key', keys.openai);
    setTempApiKey('pexels_api_key', keys.pexels);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    if (onKeysUpdated) {
      onKeysUpdated();
    }
  };

  const llmKeyFields = [
    { key: 'openai', label: 'OpenAI API Key', placeholder: 'sk-proj-...', provider: 'openai' as LlmProvider },
    { key: 'google', label: 'Google LLM API Key', placeholder: 'AIza...', provider: 'google' as LlmProvider },
    { key: 'groq', label: 'Groq API Key', placeholder: 'gsk_...', provider: 'groq' as LlmProvider },
    { key: 'anthropic', label: 'Anthropic API Key', placeholder: 'sk-ant-...', provider: 'anthropic' as LlmProvider },
  ];

  const ocrKeyFields = [
    { key: 'googleVision', label: 'Google Vision API Key', placeholder: 'AIza...', provider: 'google-vision' as OcrProvider },
    { key: 'ocrSpace', label: 'OCR.space API Key', placeholder: 'K8...', provider: 'ocr-space' as OcrProvider },
  ];

  const otherKeyFields = [
    { key: 'pexels', label: 'Pexels API Key', placeholder: 'Your Pexels API key' },
  ];

  // Check if a key is configured via .env
  const isKeyConfiguredViaEnv = (keyName: string): boolean => {
    const envKeyMap: Record<string, string> = {
      'openai': 'OPENAI_API_KEY',
      'google': 'GOOGLE_LLM_API_KEY',
      'groq': 'GROQ_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'googleVision': 'GOOGLE_VISION_API_KEY',
      'ocrSpace': 'OCR_SPACE_API_KEY',
      'pexels': 'PEXELS_API_KEY',
    };
    
    return isKeyFromEnv(envKeyMap[keyName] || keyName);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover-lift animate-scale-in">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-orange-100 rounded-full">
            <Settings className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">LLM + OCR</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 animate-fade-in">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Session-only storage</p>
                <p>API keys entered here are stored temporarily for this session only and will not persist after closing the browser.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* LLM Configuration */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-gray-900">LLM Providers</h4>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default LLM Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['openai', 'google', 'groq', 'anthropic'] as LlmProvider[]).map((provider) => {
                    const info = getLlmProviderInfo(provider);
                    return (
                      <button
                        key={provider}
                        onClick={() => setSelectedLlmProvider(provider)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          selectedLlmProvider === provider
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{info.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{info.name}</div>
                            <div className="text-xs text-gray-500">{info.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {llmKeyFields.map(({ key, label, placeholder, provider }) => {
                  const isFromEnv = isKeyConfiguredViaEnv(key);
                  const displayValue = isFromEnv ? '' : keys[key as keyof typeof keys];
                  
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {isFromEnv && (
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Configured via .env
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys[key] ? 'text' : 'password'}
                          value={displayValue}
                          onChange={(e) => handleKeyChange(key, e.target.value)}
                          placeholder={isFromEnv ? 'Already configured via .env' : placeholder}
                          disabled={isFromEnv}
                          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            isFromEnv ? 'bg-gray-50 text-gray-500' : ''
                          }`}
                        />
                        {!isFromEnv && (
                          <button
                            type="button"
                            onClick={() => toggleShowKey(key)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors duration-200 focus-ring"
                          >
                            {showKeys[key] ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OCR Configuration */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Camera className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-gray-900">OCR Providers</h4>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default OCR Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['tesseract', 'google-vision', 'ocr-space'] as OcrProvider[]).map((provider) => {
                    const info = getProviderInfo(provider);
                    return (
                      <button
                        key={provider}
                        onClick={() => setSelectedOcrProvider(provider)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          selectedOcrProvider === provider
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{info.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{info.name}</div>
                            <div className="text-xs text-gray-500">{info.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {ocrKeyFields.map(({ key, label, placeholder, provider }) => {
                  const isFromEnv = isKeyConfiguredViaEnv(key);
                  const displayValue = isFromEnv ? '' : keys[key as keyof typeof keys];
                  
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {isFromEnv && (
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Configured via .env
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys[key] ? 'text' : 'password'}
                          value={displayValue}
                          onChange={(e) => handleKeyChange(key, e.target.value)}
                          placeholder={isFromEnv ? 'Already configured via .env' : placeholder}
                          disabled={isFromEnv}
                          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            isFromEnv ? 'bg-gray-50 text-gray-500' : ''
                          }`}
                        />
                        {!isFromEnv && (
                          <button
                            type="button"
                            onClick={() => toggleShowKey(key)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors duration-200 focus-ring"
                          >
                            {showKeys[key] ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Keys */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Key className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-gray-900">Other Keys</h4>
              </div>
              
              <div className="space-y-3">
                {otherKeyFields.map(({ key, label, placeholder }) => {
                  const isFromEnv = isKeyConfiguredViaEnv(key);
                  const displayValue = isFromEnv ? '' : keys[key as keyof typeof keys];
                  
                  return (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {isFromEnv && (
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Configured via .env
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys[key] ? 'text' : 'password'}
                          value={displayValue}
                          onChange={(e) => handleKeyChange(key, e.target.value)}
                          placeholder={isFromEnv ? 'Already configured via .env' : placeholder}
                          disabled={isFromEnv}
                          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            isFromEnv ? 'bg-gray-50 text-gray-500' : ''
                          }`}
                        />
                        {!isFromEnv && (
                          <button
                            type="button"
                            onClick={() => toggleShowKey(key)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-600 transition-colors duration-200 focus-ring"
                          >
                            {showKeys[key] ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveKeys}
                className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
