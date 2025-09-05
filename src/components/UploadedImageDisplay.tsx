import React from 'react';
import { Image, X } from 'lucide-react';

interface UploadedImageDisplayProps {
  imageUrl: string;
  onRemove: () => void;
}

export const UploadedImageDisplay: React.FC<UploadedImageDisplayProps> = ({ 
  imageUrl, 
  onRemove 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover-lift animate-scale-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-orange-100 rounded-full">
            <Image className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Uploaded Menu</h3>
        </div>
        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110 focus-ring"
          title="Remove image"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      </div>
      
      <div className="relative">
        <img
          src={imageUrl}
          alt="Uploaded menu"
          className="w-full max-h-screen object-contain bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-lg border border-gray-200 shadow-inner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-lg pointer-events-none" />
      </div>
      
      <p className="text-sm text-gray-600 mt-2 text-center">
        📸 Original menu image used for AI processing
      </p>
    </div>
  );
};