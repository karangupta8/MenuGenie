import React from 'react';
import { OcrProgress } from '../types/ocr';
import { getProviderInfo } from '../config/ocrConfig';
import { Loader, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface OcrProgressDisplayProps {
  progress: OcrProgress;
  onCancel?: () => void;
}

export const OcrProgressDisplay: React.FC<OcrProgressDisplayProps> = ({ 
  progress, 
  onCancel 
}) => {
  const providerInfo = getProviderInfo(progress.provider);

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'preprocessing':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'uploading':
        return <Loader className="w-5 h-5 text-orange-600 animate-spin" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-purple-600 animate-spin" />;
      case 'postprocessing':
        return <Zap className="w-5 h-5 text-green-600" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Loader className="w-5 h-5 animate-spin" />;
    }
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return '< 1s';
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-orange-100">
        {/* Provider Info */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">{providerInfo.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {providerInfo.name}
            </h3>
            <p className="text-sm text-gray-600">{providerInfo.description}</p>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-pulse-gentle">
            {getStageIcon(progress.stage)}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">
              {progress.message}
            </h4>
            {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>~{formatTime(progress.estimatedTimeRemaining)} remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                progress.stage === 'error' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-orange-500 to-amber-500'
              }`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{progress.stage.charAt(0).toUpperCase() + progress.stage.slice(1)}</span>
            <span>{progress.progress}%</span>
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && progress.stage !== 'complete' && progress.stage !== 'error' && (
          <div className="flex justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded-lg transition-colors duration-200 focus-ring"
            >
              Cancel Processing
            </button>
          </div>
        )}

        {/* Error State */}
        {progress.stage === 'error' && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 animate-scale-in">
            <p className="font-medium">Processing failed with {providerInfo.name}</p>
            <p className="mt-1">Please try again with a clearer image or different OCR provider.</p>
          </div>
        )}
      </div>
    </div>
  );
};