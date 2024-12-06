"use client";

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DietaryFilterProps {
  availableOptions: string[];
  onFilterChange: (filters: string[]) => void;
}

const DIETARY_ICONS: Record<string, string> = {
  'vegetarian': '🥬',
  'vegan': '🌱',
  'gluten-free': '🌾',
  'dairy-free': '🥛',
  'halal': '☪️',
  'kosher': '✡️',
  'spicy': '🌶️',
  'organic': '🌿',
  'pescatarian': '🐟',
  'keto': '🥑',
  'low-carb': '🥩',
  'nut-free': '🥜',
};

export function DietaryFilter({ availableOptions, onFilterChange }: DietaryFilterProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = useCallback((filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(id => id !== filterId)
      : [...activeFilters, filterId];
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  }, [activeFilters, onFilterChange]);

  if (availableOptions.length === 0) return null;

  return (
    <div className="w-full py-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 px-4">
          {availableOptions.map(option => (
            <Button
              key={option}
              variant="outline"
              size="sm"
              onClick={() => toggleFilter(option)}
              className={cn(
                "transition-colors",
                activeFilters.includes(option) && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {DIETARY_ICONS[option] || '•'} {option.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
