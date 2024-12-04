"use client";

import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();

    const menuItems = document.querySelectorAll('[data-menu-item]');
    menuItems.forEach((itemElement) => {
      const itemName = itemElement.getAttribute('data-item-name')?.toLowerCase() || '';
      const itemDescription = itemElement.getAttribute('data-item-description')?.toLowerCase() || '';
      
      if (searchValue === '' || 
          itemName.includes(searchValue) || 
          itemDescription.includes(searchValue)) {
        (itemElement as HTMLElement).style.display = '';
      } else {
        (itemElement as HTMLElement).style.display = 'none';
      }
    });

    // Hide category headers if all items in that category are hidden
    const categories = document.querySelectorAll('section[id^="category-"]');
    categories.forEach((category) => {
      const visibleItems = category.querySelectorAll('[data-menu-item]:not([style*="display: none"])');
      if (visibleItems.length === 0) {
        (category as HTMLElement).style.display = 'none';
      } else {
        (category as HTMLElement).style.display = '';
      }
    });
  };

  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => handleSearch(e)}
          className="pl-9 w-full"
        />
      </div>
    </div>
  );
}