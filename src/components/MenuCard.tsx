import React, { useState } from 'react';
import { MenuItem } from '../types/menu';
import { DietaryLabels } from './DietaryLabels';
import { IngredientTranslations } from './IngredientTranslations';
import { convertCurrency, getCurrencySymbol } from '../config/api';
import { Eye, EyeOff, AlertTriangle, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  showOriginalText: boolean;
  showAllergenHighlights: boolean;
  showNutritionInfo: boolean;
  imageSize: 'small' | 'medium' | 'large';
  nativeCurrency: string;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  showOriginalText,
  showAllergenHighlights,
  showNutritionInfo,
  imageSize,
  nativeCurrency
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullCard, setShowFullCard] = useState(false);

  const getImageSizeClass = () => {
    switch (imageSize) {
      case 'small':
        return 'h-32';
      case 'large':
        return 'h-64';
      default:
        return 'h-48';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMeatTypeColor = (meatType: string) => {
    const colors: Record<string, string> = {
      beef: 'bg-red-100 text-red-800',
      pork: 'bg-pink-100 text-pink-800',
      lamb: 'bg-orange-100 text-orange-800',
      poultry: 'bg-yellow-100 text-yellow-800',
      seafood: 'bg-blue-100 text-blue-800',
      vegetarian: 'bg-green-100 text-green-800',
      vegan: 'bg-emerald-100 text-emerald-800',
    };
    return colors[meatType] || 'bg-gray-100 text-gray-800';
  };

  const getCookingMethodColor = (method: string) => {
    return 'bg-purple-100 text-purple-800';
  };

  // Check if description is long (more than 3 lines approximately)
  const isLongDescription = (text: string) => {
    return text.length > 150 || text.split('\n').length > 3;
  };

  // Check if the entire card content is too long
  const isLongCard = () => {
    const hasLongIngredients = item.ingredientTranslations.length > 3;
    const hasLongProteins = item.proteins.length > 3;
    const hasLongAllergens = item.allergens.length > 3;
    const hasLongHerbsSpices = item.herbsSpices.length > 3;
    
    return hasLongIngredients || hasLongProteins || hasLongAllergens || hasLongHerbsSpices;
  };

  const currentDescription = showOriginalText && showOriginal ? item.originalDescription : item.simplifiedDescription;
  const shouldTruncate = isLongDescription(currentDescription) && !showFullDescription;
  const displayDescription = shouldTruncate ? currentDescription.substring(0, 150) + '...' : currentDescription;

  // Currency conversion
  const originalPrice = parseFloat(item.price) || 0;
  const convertedPrice = convertCurrency(originalPrice, 'USD', nativeCurrency);
  const nativeCurrencySymbol = getCurrencySymbol(nativeCurrency);
  const showConvertedPrice = nativeCurrency !== 'USD' && originalPrice > 0;

  const shouldTruncateCard = isLongCard() && !showFullCard;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift animate-scale-in">
      {/* Image Section */}
      <div className={`relative ${getImageSizeClass()} overflow-hidden`}>
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2 animate-pulse-gentle">🍽️</div>
              <div className="text-sm">Image not available</div>
            </div>
          </div>
        )}
        
        {/* Confidence Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getConfidenceColor(item.confidence)}`}>
          <Star className="w-3 h-3 inline mr-1" />
          {item.confidence}%
        </div>

        {/* Section Badge */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-80 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
          {item.section}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
              {showOriginalText && showOriginal ? item.originalName : item.name}
            </h3>
            {showOriginalText && (
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="text-orange-600 text-xs hover:text-orange-800 flex items-center mt-1 transition-colors duration-200 focus-ring"
              >
                {showOriginal ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                {showOriginal ? 'Show Translation' : 'Show Original'}
              </button>
            )}
          </div>
          <div className="text-xl font-bold text-green-600 ml-2">
            <div className="text-right">
              <div>{item.currency}{item.price}</div>
              {showConvertedPrice && (
                <div className="text-sm text-gray-500 font-normal">
                  ≈ {nativeCurrencySymbol}{convertedPrice.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <p className="text-gray-700 text-sm">
            {displayDescription}
          </p>
          {isLongDescription(currentDescription) && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-orange-600 text-xs hover:text-orange-800 flex items-center mt-1 transition-colors duration-200 focus-ring"
            >
              {showFullDescription ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show more
                </>
              )}
            </button>
          )}
        </div>

        {/* Dietary Icons */}
        <div className="mb-3 animate-fade-in">
          <DietaryLabels dietaryInfo={item.dietaryInfo} />
        </div>

        {/* Ingredient Translations */}
        {item.ingredientTranslations.length > 0 && (!shouldTruncateCard || showFullCard) && (
          <div className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-lg border border-orange-100">
            <IngredientTranslations translations={item.ingredientTranslations} />
          </div>
        )}

        {/* Meat Types */}
        {item.meatTypes && item.meatTypes.length > 0 && (!shouldTruncateCard || showFullCard) && (
          <div className="mb-3 animate-fade-in">
            <div className="flex flex-wrap gap-1">
              {item.meatTypes.map((meatType, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getMeatTypeColor(meatType)}`}
                >
                  {meatType}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cooking Methods */}
        {item.cookingMethods && item.cookingMethods.length > 0 && (!shouldTruncateCard || showFullCard) && (
          <div className="mb-3 animate-fade-in">
            <div className="flex flex-wrap gap-1">
              {item.cookingMethods.map((method, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getCookingMethodColor(method)}`}
                >
                  🔥 {method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Proteins and Allergens */}
        {(!shouldTruncateCard || showFullCard) && (
          <div className="space-y-2 text-xs">
          {/* Meat Proteins */}
          {item.meatProteins.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Meat: </span>
              <span className="text-gray-600">{item.meatProteins.join(', ')}</span>
            </div>
          )}

          {/* Proteins */}
          {item.proteins.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Proteins: </span>
              <span className="text-gray-600">{item.proteins.join(', ')}</span>
            </div>
          )}

          {/* Allergens */}
          {showAllergenHighlights && item.allergens.length > 0 && (
            <div className="flex items-start space-x-1">
              <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-red-700">Allergens: </span>
                <span className="text-red-600">{item.allergens.join(', ')}</span>
              </div>
            </div>
          )}

          {/* Herbs & Spices */}
          {item.herbsSpices.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Herbs & Spices: </span>
              <span className="text-gray-600">{item.herbsSpices.join(', ')}</span>
            </div>
          )}
          </div>
        )}

        {/* Show More/Less Button for Card Content */}
        {isLongCard() && (
          <div className="mt-3 pt-3 border-t border-gray-200 animate-fade-in">
            <button
              onClick={() => setShowFullCard(!showFullCard)}
              className="w-full text-orange-600 text-sm hover:text-orange-800 flex items-center justify-center space-x-1 transition-colors duration-200 focus-ring rounded-md py-1"
            >
              {showFullCard ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Show less details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show more details</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Nutrition Info */}
        {showNutritionInfo && item.nutritionEstimate && (!shouldTruncateCard || showFullCard) && (
          <div className="mt-3 pt-3 border-t border-gray-200 animate-fade-in">
            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              <div>
                <div className="font-semibold text-orange-600">{item.nutritionEstimate.calories}</div>
                <div className="text-gray-500">Cal</div>
              </div>
              <div>
                <div className="font-semibold text-blue-600">{item.nutritionEstimate.protein}g</div>
                <div className="text-gray-500">Protein</div>
              </div>
              <div>
                <div className="font-semibold text-green-600">{item.nutritionEstimate.carbs}g</div>
                <div className="text-gray-500">Carbs</div>
              </div>
              <div>
                <div className="font-semibold text-purple-600">{item.nutritionEstimate.fat}g</div>
                <div className="text-gray-500">Fat</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};