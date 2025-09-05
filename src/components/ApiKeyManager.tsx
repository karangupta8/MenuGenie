import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { setTempApiKey, getCurrentApiKeys } from '../config/api';
import { setTempOcrConfig, getCurrentOcrKeys } from '../config/ocrConfig';

interface ApiKeyManagerProps {
  onKeysUpdated?: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeysUpdated }) => {
  const [keys, setKeys] = useState(() => ({
    ...getCurrentApiKeys(),
    ...getCurrentOcrKeys(),
  }));
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const handleKeyChange = (keyName: string, value: string) => {
    setKeys(prev => ({ ...prev, [keyName]: value }));
  };

  const toggleShowKey = (keyName: string) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const saveKeys = () => {
    // Save to session storage for temporary use
    setTempApiKey('openai_api_key', keys.openai);
    setTempApiKey('pexels_api_key', keys.pexels);
    
    // Save OCR keys
    if (keys.googleVision) {
      sessionStorage.setItem('temp_google_vision_api_key', keys.googleVision);
    }
    if (keys.ocrSpace) {
      sessionStorage.setItem('temp_ocr_space_api_key', keys.ocrSpace);
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    if (onKeysUpdated) {
      onKeysUpdated();
    }
  };

  const keyFields = [
    { key: 'googleVision', label: 'Google Vision API Key', placeholder: 'AIza...' },
    { key: 'ocrSpace', label: 'OCR.space API Key', placeholder: 'K8...' },
    { key: 'openai', label: 'OpenAI API Key', placeholder: 'sk-proj-...' },
    { key: 'pexels', label: 'Pexels API Key', placeholder: 'Your Pexels API key' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover-lift animate-scale-in">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-1 bg-orange-100 rounded-full">
          <Key className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 animate-fade-in">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Session-only storage</p>
            <p>API keys entered here are stored temporarily for this session only and will not persist after closing the browser.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {keyFields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <div className="relative">
              <input
                type={showKeys[key] ? 'text' : 'password'}
                value={keys[key as keyof typeof keys]}
                onChange={(e) => handleKeyChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => toggleShowKey(key)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-orange-600 transition-colors duration-200 focus-ring"
              >
                {showKeys[key] ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={saveKeys}
          className="flex items-center space-x-2 gradient-bg text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 hover-lift focus-ring"
        >
          <Save className="w-4 h-4" />
          <span>Save for Session</span>
        </button>
        
        {saved && (
          <span className="text-green-600 text-sm font-medium animate-fade-in">
            Keys saved successfully!
          </span>
        )}
      </div>
    </div>
  );
};