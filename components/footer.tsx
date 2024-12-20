"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  // Hide footer on menu routes
  if (pathname.startsWith('/menus')) {
    return null;
  }

  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">MainMenu.io</h3>
            <p className="text-sm text-muted-foreground">
              Transform your restaurant menu into a digital experience.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-foreground/60 hover:text-foreground">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {/* <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground">
                  Help Center
                </Link>
              </li> */}
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground">
                  Contact
                </Link>
              </li>
              {/* <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground">
                  Privacy Policy
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            {new Date().getFullYear()} MainMenu.io. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}