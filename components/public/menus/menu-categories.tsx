"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MenuCategory } from '@/lib/types';

interface MenuCategoriesProps {
  menuId: string;
  categories: MenuCategory[];
}

export function MenuCategories({ categories, menuId }: MenuCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.id.replace('category-', '');
            setActiveCategory(categoryId);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px'
      }
    );

    const sections = document.querySelectorAll('section[id^="category-"]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <nav className="sticky top-0 z-10 -mx-4 px-4 py-4 bg-background mb-8">
      <div className="space-y-2 max-w-2xl mx-auto">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            size="lg"
            className={cn(
              "w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-accent",
              activeCategory === category.id && "bg-accent"
            )}
            onClick={() => {
              const element = document.getElementById(`category-${category.id}`);
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-lg">{category.name}</span>
            <span className="text-sm text-muted-foreground">0 items</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}