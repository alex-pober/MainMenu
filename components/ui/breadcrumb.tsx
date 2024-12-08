"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbsProps extends React.ComponentPropsWithoutRef<"nav"> {
  segments: {
    title: string;
    href?: string;
  }[];
  separator?: React.ComponentType<{ className?: string }>;
}

export function Breadcrumbs({
  segments,
  separator: Separator = ChevronRight,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="breadcrumbs"
      className={cn(
        "flex items-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      <ol className="flex items-center gap-2">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <li
              key={segment.title}
              className="flex items-center gap-2"
            >
              {segment.href ? (
                <a
                  href={segment.href}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  {segment.title}
                </a>
              ) : (
                <span className={cn("cursor-default select-none", isLast && "text-foreground font-medium")}>
                  {segment.title}
                </span>
              )}
              {!isLast && (
                <Separator className="h-4 w-4" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}