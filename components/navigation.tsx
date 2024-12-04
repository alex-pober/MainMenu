"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  // Hide navigation on dashboard and menu routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/menus')) {
    return null;
  }

  return (
    <div className="fixed w-full z-50 p-4">
      <nav className="mx-auto max-w-7xl">
        <div className="rounded-full bg-background/80 backdrop-blur-sm border shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold">
                  MainMenu.io
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-8 pr-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <Button onClick={() => router.push('/dashboard')}>Dashboard</Button>
                    <Button variant="ghost" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link href="#features" className="text-foreground/80 hover:text-foreground">
                      Features
                    </Link>
                    <Link href="#pricing" className="text-foreground/80 hover:text-foreground">
                      Pricing
                    </Link>
                    <Link href="#testimonials" className="text-foreground/80 hover:text-foreground">
                      Testimonials
                    </Link>
                    <Button onClick={() => router.push('/auth')}>Get Started</Button>
                  </>
                )}
              </div>

              <div className="md:hidden flex items-center pr-4">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-foreground p-2"
                  aria-label="Toggle menu"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <motion.div
            initial={false}
            animate={isOpen ? "open" : "closed"}
            variants={{
              open: { opacity: 1, height: "auto" },
              closed: { opacity: 0, height: 0 }
            }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-2">
              {isAuthenticated ? (
                <div>
                  <div className="px-3 py-2">
                    <Button className="w-full" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                  </div>
                  <div className="px-3 py-2">
                    <Button className="w-full" variant="ghost" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="#features"
                    className="block px-3 py-2 text-foreground/80 hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#pricing"
                    className="block px-3 py-2 text-foreground/80 hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="#testimonials"
                    className="block px-3 py-2 text-foreground/80 hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Testimonials
                  </Link>
                  <div className="px-3 py-2">
                    <Button className="w-full" onClick={() => router.push('/auth')}>Get Started</Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </nav>
    </div>
  );
}