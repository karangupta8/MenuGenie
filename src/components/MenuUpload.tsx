import React, { useCallback, useState } from 'react';
import { OcrProvider } from '../types/ocr';
import { getProviderInfo } from '../config/ocrConfig';
import { Upload, Camera, FileText, AlertCircle } from 'lucide-react';

interface MenuUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  selectedOcrProvider: OcrProvider;
}

export const MenuUpload: React.FC<MenuUploadProps> = ({ 
  onFileUpload, 
  isProcessing,
  selectedOcrProvider
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      if (imageFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      onFileUpload(imageFile);
    } else {
      setError('Please upload an image file');
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const providerInfo = getProviderInfo(selectedOcrProvider);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
          dragOver
            ? 'border-orange-500 bg-orange-50 scale-105'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/30'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <Camera className="w-6 h-6 text-orange-600" />
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800">
            Upload Menu Image
          </h3>

          <p className="text-gray-600 max-w-md leading-relaxed">
            Drag and drop your menu photo here, or click to select a file.
            <span className="block mt-1 text-sm text-gray-500">
              Supports JPG, PNG, WebP, GIF, BMP, and TIFF formats up to 10MB
            </span>
            <span className="block mt-2 text-sm font-medium text-orange-600">
              Using {providerInfo.name} {providerInfo.icon}
            </span>
          </p>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
            <div className="gradient-bg hover:shadow-lg text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover-lift focus-ring">
              Choose File
            </div>
          </label>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200 animate-scale-in">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 leading-relaxed">
          <span className="font-medium">💡 Pro tip:</span> MenuGenie works best with clear, well-lit photos of menus.
          <span className="block mt-1">Multiple languages and formats are supported.</span>
        </p>
      </div>
    </div>
  );
};