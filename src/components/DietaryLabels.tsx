import React from 'react';
import { DietaryInfo } from '../types/menu';

interface DietaryLabelsProps {
  dietaryInfo: DietaryInfo;
  className?: string;
}

export const DietaryLabels: React.FC<DietaryLabelsProps> = ({ dietaryInfo, className = '' }) => {
  const labels = [
    { key: 'vegetarian', label: 'Vegetarian', active: dietaryInfo.vegetarian, color: 'bg-green-100 text-green-800' },
    { key: 'vegan', label: 'Vegan', active: dietaryInfo.vegan, color: 'bg-emerald-100 text-emerald-800' },
    { key: 'pescatarian', label: 'Pescatarian', active: dietaryInfo.pescatarian, color: 'bg-blue-100 text-blue-800' },
    { key: 'halal', label: 'Halal', active: dietaryInfo.halal, color: 'bg-purple-100 text-purple-800' },
    { key: 'kosher', label: 'Kosher', active: dietaryInfo.kosher, color: 'bg-indigo-100 text-indigo-800' },
  ];

  const activeLabels = labels.filter(label => label.active);

  if (activeLabels.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {activeLabels.map(label => (
        <span
          key={label.key}
          className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-transform duration-200 hover:scale-105 ${label.color}`}
        >
          {label.label}
        </span>
      ))}
    </div>
  );
};