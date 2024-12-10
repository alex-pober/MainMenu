"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useSupabase } from '@/hooks/use-supabase';
import { useToast } from '@/hooks/use-toast';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { client: supabase, user } = useSupabase();

  const handleSignOut = async () => {
    try {
      if (!supabase) {
        toast({
          title: "Error",
          description: "Authentication service not available",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/auth');
      router.refresh(); // Force a refresh to update the auth state
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Return null early if we're on dashboard or menu routes
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/menus')) {
    return null;
  }

  return (
    <div className="fixed w-full z-50 p-4">
      <nav className="fixed m-4 rounded-md top-0 inset-x-0 h-16 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/main-menu-logo.svg" 
                alt="Main Menu Logo" 
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 pr-4">
              {user ? (
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

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 inset-x-0 bg-background border-t md:hidden"
          >
            <div className="px-4 py-2 space-y-2">
              {user ? (
                <>
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost"
                    onClick={() => {
                      router.push('/dashboard');
                      setIsOpen(false);
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="#features" 
                    className="block px-4 py-2 text-foreground/80 hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </Link>
                  <Link 
                    href="#pricing" 
                    className="block px-4 py-2 text-foreground/80 hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="#testimonials" 
                    className="block px-4 py-2 text-foreground/80 hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Testimonials
                  </Link>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      router.push('/auth');
                      setIsOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </div>
  );
}