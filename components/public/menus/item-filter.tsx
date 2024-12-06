"use client";

import { useState } from 'react';
import { cn } from "@/lib/utils";

interface ItemFilterProps {
  onFilterChange: (filters: string[]) => void;
  availableLabels: string[];
}

const LABEL_CONFIG = {
  limited: { 
    emoji: '⏳', 
    text: 'Limited Time',
    baseClass: 'border border-input bg-background text-black hover:bg-yellow-50 focus:bg-background',
    activeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  },
  special: { 
    emoji: '⭐', 
    text: 'Special',
    baseClass: 'border border-input bg-background text-black hover:bg-green-50 focus:bg-background',
    activeClass: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  popular: { 
    emoji: '🔥', 
    text: 'Most Popular',
    baseClass: 'border border-input bg-background text-black hover:bg-purple-50 focus:bg-background',
    activeClass: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100',
  },
  spicy: { 
    emoji: '🌶️', 
    text: 'Spicy',
    baseClass: 'border border-input bg-background text-black hover:bg-red-50 focus:bg-background',
    activeClass: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  },
  new: { 
    emoji: '✨', 
    text: 'New',
    baseClass: 'border border-input bg-background text-black hover:bg-blue-50 focus:bg-background',
    activeClass: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  },
  vegan: {
    emoji: '🌱',
    text: 'Vegan',
    baseClass: 'border border-input bg-background text-black hover:bg-emerald-50 focus:bg-background',
    activeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  },
  vegetarian: {
    emoji: '🥚',
    text: 'Vegetarian',
    baseClass: 'border border-input bg-background text-black hover:bg-lime-50 focus:bg-background',
    activeClass: 'bg-lime-100 text-lime-800 border-lime-200 hover:bg-lime-100',
  },
};

export function ItemFilter({ onFilterChange, availableLabels }: ItemFilterProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleFilterToggle = (filter: string) => {
    const updated = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    
    setActiveFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-0 relative">
      {/* Gradient overlay to indicate scrollability */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      
      {/* Scroll container with subtle animation */}
      <div 
        className={cn(
          "overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent",
          !hasScrolled && "animate-[scroll-hint_1.5s_ease-in-out_0.5s]"
        )}
        onScroll={() => setHasScrolled(true)}
      >
        <div className="flex gap-1.5 pb-2">
          {availableLabels.map(label => {
            const config = LABEL_CONFIG[label as keyof typeof LABEL_CONFIG];
            if (!config) return null;
            
            const isActive = activeFilters.includes(label);
            
            return (
              <button
                key={label}
                onClick={() => handleFilterToggle(label)}
                className={cn(
                  "shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  isActive ? config.activeClass : config.baseClass
                )}
              >
                <span className="mr-1">{config.emoji}</span>
                {config.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
