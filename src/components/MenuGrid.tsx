import React from 'react';
import { MenuItem, MeatType, CookingMethod } from '../types/menu';
import { MenuCard } from './MenuCard';
import { UserSettings } from '../types/menu';

interface MenuGridProps {
  items: MenuItem[];
  settings: UserSettings;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ items, settings }) => {
  // Filter items based on active dietary filters
  let filteredItems = items;
  
  // Filter by meat types
  if (settings.activeMeatFilters && settings.activeMeatFilters.length > 0) {
    filteredItems = items.filter(item => {
      return settings.activeMeatFilters!.some(filter => {
        switch (filter) {
          case 'vegetarian':
            return item.dietaryInfo.vegetarian;
          case 'vegan':
            return item.dietaryInfo.vegan;
          case 'beef':
          case 'pork':
          case 'lamb':
          case 'poultry':
          case 'seafood':
            return item.meatTypes && item.meatTypes.includes(filter);
          default:
            return false;
        }
      });
    });
  }

  // Filter by cooking methods
  if (settings.activeCookingMethodFilters && settings.activeCookingMethodFilters.length > 0) {
    filteredItems = filteredItems.filter(item => {
      return settings.activeCookingMethodFilters!.some(method => {
        return item.cookingMethods && item.cookingMethods.includes(method);
      });
    });
  }

  const displayItems = settings.maxItemsDisplay > 0 
    ? filteredItems.slice(0, settings.maxItemsDisplay)
    : filteredItems;

  if (items.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4 animate-float">🍽️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No menu items found</h3>
        <p className="text-gray-500">Try uploading a clearer image or different menu photo.</p>
      </div>
    );
  }

  if (filteredItems.length === 0 && (
    (settings.activeMeatFilters && settings.activeMeatFilters.length > 0) ||
    (settings.activeCookingMethodFilters && settings.activeCookingMethodFilters.length > 0)
  )) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4 animate-float">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No items match your filters</h3>
        <p className="text-gray-500">Try adjusting your meat type or cooking method filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {((settings.activeMeatFilters && settings.activeMeatFilters.length > 0) ||
        (settings.activeCookingMethodFilters && settings.activeCookingMethodFilters.length > 0)) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center animate-slide-up">
          <span className="text-blue-800">
            Showing {filteredItems.length} of {items.length} items matching your filters
          </span>
        </div>
      )}
      
      {settings.maxItemsDisplay > 0 && filteredItems.length > settings.maxItemsDisplay && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center animate-slide-up">
          <span className="text-blue-800">
            Showing {settings.maxItemsDisplay} of {filteredItems.length} items
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayItems.map((item, index) => (
          <MenuCard
            key={item.id}
            item={item}
            showOriginalText={settings.showOriginalText}
            showAllergenHighlights={settings.showAllergenHighlights}
            showNutritionInfo={settings.showNutritionInfo}
            imageSize={settings.imageSize}
            nativeCurrency={settings.nativeCurrency}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
};