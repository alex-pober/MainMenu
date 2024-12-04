"use client";

import { MenuProvider } from '@/lib/context/menu-context';

export default function MenusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MenuProvider>{children}</MenuProvider>;
}