import React from 'react';
import { Filter, Eye, DollarSign, Languages, Shield, Zap, Utensils } from 'lucide-react';
import { UserSettings, MeatType, CookingMethod } from '../types/menu';
import { SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES } from '../config/api';

interface FilterPanelProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  settings, 
  onSettingsChange
}) => {
  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleMeatFilterChange = (meatType: MeatType, value: boolean) => {
    const currentFilters = settings.activeMeatFilters || [];
    let newFilters;
    
    if (value) {
      newFilters = [...currentFilters, meatType];
    } else {
      newFilters = currentFilters.filter(f => f !== meatType);
    }
    
    onSettingsChange({
      ...settings,
      activeMeatFilters: newFilters
    });
  };

  const handleCookingMethodFilterChange = (method: CookingMethod, value: boolean) => {
    const currentFilters = settings.activeCookingMethodFilters || [];
    let newFilters;
    
    if (value) {
      newFilters = [...currentFilters, method];
    } else {
      newFilters = currentFilters.filter(f => f !== method);
    }
    
    onSettingsChange({
      ...settings,
      activeCookingMethodFilters: newFilters
    });
  };

  const meatTypes: { key: MeatType; label: string; color: string }[] = [
    { key: 'beef', label: 'Beef', color: 'bg-red-100 text-red-800' },
    { key: 'pork', label: 'Pork', color: 'bg-pink-100 text-pink-800' },
    { key: 'lamb', label: 'Lamb', color: 'bg-orange-100 text-orange-800' },
    { key: 'poultry', label: 'Poultry', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'seafood', label: 'Seafood', color: 'bg-blue-100 text-blue-800' },
    { key: 'vegetarian', label: 'Vegetarian', color: 'bg-green-100 text-green-800' },
    { key: 'vegan', label: 'Vegan', color: 'bg-emerald-100 text-emerald-800' },
  ];

  const cookingMethods: { key: CookingMethod; label: string }[] = [
    { key: 'grilled', label: 'Grilled' },
    { key: 'fried', label: 'Fried' },
    { key: 'steamed', label: 'Steamed' },
    { key: 'baked', label: 'Baked' },
    { key: 'raw', label: 'Raw' },
    { key: 'sautéed', label: 'Sautéed' },
    { key: 'roasted', label: 'Roasted' },
    { key: 'braised', label: 'Braised' },
    { key: 'boiled', label: 'Boiled' },
    { key: 'smoked', label: 'Smoked' },
    { key: 'barbecued', label: 'Barbecued' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Language Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover-lift">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Languages className="w-5 h-5 mr-2 text-orange-600" />
          Language & Display
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={settings.targetLanguage}
              onChange={(e) => handleSettingChange('targetLanguage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Show Original Text</span>
              </div>
              <button
                onClick={() => handleSettingChange('showOriginalText', !settings.showOriginalText)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.showOriginalText ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.showOriginalText ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Show Allergen Highlights</span>
              </div>
              <button
                onClick={() => handleSettingChange('showAllergenHighlights', !settings.showAllergenHighlights)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.showAllergenHighlights ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.showAllergenHighlights ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Show Nutrition Info</span>
              </div>
              <button
                onClick={() => handleSettingChange('showNutritionInfo', !settings.showNutritionInfo)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.showNutritionInfo ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.showNutritionInfo ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover-lift">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Currency Conversion
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Native Currency
          </label>
          <select
            value={settings.nativeCurrency}
            onChange={(e) => handleSettingChange('nativeCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Prices will be converted to your native currency for easier comparison
          </p>
        </div>
      </div>

      {/* Meat Type Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover-lift">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-red-600" />
          Meat Type Filters
        </h3>
        <p className="text-sm text-gray-600 mb-3">Filter dishes by protein type</p>
        <div className="grid grid-cols-4 gap-2">
          {meatTypes.map(({ key, label, color }) => {
            const isActive = settings.activeMeatFilters?.includes(key) || false;
            return (
              <button
                key={key}
                onClick={() => handleMeatFilterChange(key, !isActive)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                  isActive 
                    ? 'border-orange-500 bg-orange-50 shadow-md' 
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
                }`}
                title={label}
              >
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${color}`}>
                  {key.charAt(0).toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cooking Method Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover-lift">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-purple-600" />
          Cooking Method Filters
        </h3>
        <p className="text-sm text-gray-600 mb-3">Filter by cooking preparation method</p>
        <div className="grid grid-cols-3 gap-2">
          {cookingMethods.map(({ key, label }) => {
            const isActive = settings.activeCookingMethodFilters?.includes(key) || false;
            return (
              <button
                key={key}
                onClick={() => handleCookingMethodFilterChange(key, !isActive)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};