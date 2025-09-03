import React from 'react';
import { ProcessingStatus as ProcessingStatusType } from '../types/menu';
import { Loader, CheckCircle, XCircle, Eye, Languages, Utensils, Image } from 'lucide-react';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status }) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'ocr':
        return <Eye className="w-5 h-5" />;
      case 'parsing':
        return <Utensils className="w-5 h-5" />;
      case 'translating':
        return <Languages className="w-5 h-5" />;
      case 'generating-images':
        return <Image className="w-5 h-5" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Loader className="w-5 h-5 animate-spin" />;
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'uploading':
        return 'Uploading image...';
      case 'ocr':
        return 'Reading menu text...';
      case 'parsing':
        return 'Parsing menu items...';
      case 'translating':
        return 'Translating content...';
      case 'analyzing':
        return 'Analyzing ingredients...';
      case 'generating-images':
        return 'Generating food images...';
      case 'complete':
        return 'Processing complete!';
      case 'error':
        return 'Processing error occurred';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-orange-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-pulse-gentle">
            {getStageIcon(status.stage)}
          </div>
          <h3 className="text-lg font-semibold">
            {getStageLabel(status.stage)}
          </h3>
        </div>

        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                status.stage === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-orange-500 to-amber-500'
              }`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{status.message}</span>
            <span>{status.progress}%</span>
          </div>
        </div>

        {status.stage === 'error' && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 animate-scale-in">
            Please try again with a clearer image or different menu photo.
          </div>
        )}
      </div>
    </div>
  );
};