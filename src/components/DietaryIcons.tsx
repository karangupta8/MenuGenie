import React from 'react';
import { DietaryInfo } from '../types/menu';

interface DietaryIconsProps {
  dietaryInfo: DietaryInfo;
  showLabels?: boolean;
}

export const DietaryIcons: React.FC<DietaryIconsProps> = ({ dietaryInfo, showLabels = false }) => {
  const icons = [
    { key: 'vegetarian', emoji: '🥗', label: 'Vegetarian', active: dietaryInfo.vegetarian },
    { key: 'vegan', emoji: '🌱', label: 'Vegan', active: dietaryInfo.vegan },
    { key: 'pescatarian', emoji: '🐟', label: 'Pescatarian', active: dietaryInfo.pescatarian },
    { key: 'halal', emoji: '🕌', label: 'Halal', active: dietaryInfo.halal },
    { key: 'kosher', emoji: '✡️', label: 'Kosher', active: dietaryInfo.kosher },
    { key: 'glutenFree', emoji: '🌾', label: 'Gluten Free', active: dietaryInfo.glutenFree },
    { key: 'dairyFree', emoji: '🥛', label: 'Dairy Free', active: dietaryInfo.dairyFree },
    { key: 'nutFree', emoji: '🥜', label: 'Nut Free', active: dietaryInfo.nutFree },
  ];

  const activeIcons = icons.filter(icon => icon.active);

  if (activeIcons.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {activeIcons.map(icon => (
        <div
          key={icon.key}
          className={`inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ${
            showLabels ? '' : 'w-6 h-6 justify-center p-0'
          }`}
          title={icon.label}
        >
          <span className="text-sm">{icon.emoji}</span>
          {showLabels && <span>{icon.label}</span>}
        </div>
      ))}
    </div>
  );
};