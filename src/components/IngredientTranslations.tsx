import React from 'react';
import { IngredientTranslation } from '../types/menu';
import { Info } from 'lucide-react';

interface IngredientTranslationsProps {
  translations: IngredientTranslation[];
  className?: string;
}

export const IngredientTranslations: React.FC<IngredientTranslationsProps> = ({ 
  translations, 
  className = '' 
}) => {
  if (translations.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-1 text-sm font-medium text-gray-700">
        <Info className="w-4 h-4" />
        <span>Ingredient Guide</span>
      </div>
      <div className="space-y-1">
        {translations.map((translation, index) => (
          <div key={index} className="text-sm">
            <span className="font-medium text-gray-800">
              {translation.original}
            </span>
            {translation.translation !== translation.original && (
              <span className="text-gray-600 ml-1">
                ({translation.translation})
              </span>
            )}
            {translation.explanation && (
              <span className="text-gray-500 ml-1">
                - {translation.explanation}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};