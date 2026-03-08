import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { reservedWordCategories } from '../data/reservedWords';

interface ReservedWordPanelProps {
  onWordClick: (word: string) => void;
}

export const ReservedWordPanel: React.FC<ReservedWordPanelProps> = ({ onWordClick }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(reservedWordCategories.map(cat => cat.name))
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName.split('-').map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) :
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') as keyof typeof Icons];

    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Reserved Words
        </h2>

        {reservedWordCategories.map(category => {
          const isExpanded = expandedCategories.has(category.name);

          return (
            <div key={category.name} className="mb-3">
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                {getIcon(category.icon)}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-6 space-y-1">
                  {category.words.map(word => (
                    <button
                      key={word}
                      onClick={() => onWordClick(word)}
                      className="block w-full text-left px-3 py-2 text-sm font-mono rounded-md bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
