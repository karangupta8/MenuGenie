import React from 'react';
import { MenuUpload } from './MenuUpload';
import { OcrProviderSelector } from './OcrProviderSelector';
import { OcrProvider } from '../types/ocr';
import { Sparkles, Camera, Languages, Utensils, Shield, Zap, Globe } from 'lucide-react';

interface HeroSectionProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  selectedOcrProvider: OcrProvider;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onFileUpload, 
  isProcessing,
  selectedOcrProvider
}) => {
  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative text-center space-y-8 py-12">
        {/* Hero Content */}
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <Sparkles className="w-20 h-20 text-orange-500 animate-float" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full animate-pulse-gentle" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Transform Any Menu
              <span className="block bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                with AI Magic
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Upload a photo of any restaurant menu and get instant translations, 
              ingredient analysis, dietary information, and beautiful food images.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Smart Recognition</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Advanced AI reads any menu format, from handwritten specials to elegant typography
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Global Translation</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Translate to 15+ languages with cultural context and local food knowledge
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Dietary Intelligence</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Identify allergens, dietary restrictions, and get detailed ingredient breakdowns
            </p>
          </div>
        </div>

        {/* Additional Features Row */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-lg p-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Cooking Methods</h4>
              <p className="text-sm text-gray-600">Grilled, fried, steamed & more</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-lg p-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Instant Results</h4>
              <p className="text-sm text-gray-600">Process menus in seconds</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-lg p-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Smart Analysis</h4>
              <p className="text-sm text-gray-600">Nutrition & ingredient insights</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
          <MenuUpload 
            onFileUpload={onFileUpload} 
            isProcessing={isProcessing}
            selectedOcrProvider={selectedOcrProvider}
          />
        </div>
      </div>
    </div>
  );
};