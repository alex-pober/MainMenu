"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MenuCategory } from '@/lib/types';

interface MenuCategoriesProps {
  categories: MenuCategory[];
}

export function MenuCategories({ categories }: MenuCategoriesProps) {
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
    <nav className="sticky top-0 z-10 -mx-4 px-4 py-4 bg-background border-b mb-8">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            size="sm"
            className={cn(
              "whitespace-nowrap transition-colors",
              activeCategory === category.id && "bg-primary text-primary-foreground"
            )}
            onClick={() => {
              const element = document.getElementById(`category-${category.id}`);
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </nav>
  );
}