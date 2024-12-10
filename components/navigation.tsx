"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/hooks/use-toast'; // Fixing the toast import to use the correct path

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Added user state
  const router = useRouter();
  const pathname = usePathname();
  let supabase; // Declare supabase variable
  const { toast } = useToast(); // Using the correct toast import

  useEffect(() => {
    const checkAuth = async () => {
      supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUser(session?.user); // Set user state
    };
    
    checkAuth();

    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user); // Update user state
    });

    return () => supabase.auth.onAuthStateChange((_, __) => {}); // Clean up subscription
  }, []);

  const handleSignOut = async () => {
    try {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any session-related state
      setUser(null);
      
      // Redirect to auth page
      router.push('/auth');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Hide navigation on dashboard and menu routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/menus')) {
    return null;
  }

  return (
    <div className="fixed w-full z-50 p-4">
      <nav className={`fixed m-4 rounded-md top-0 inset-x-0 h-16 bg-background/80 backdrop-blur-sm z-50 ${isOpen ? 'bg-opacity-100' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/main-menu-logo.svg" 
                alt="Main Menu Logo" 
                className="h-8 w-auto"
              />
            </Link>

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
      </nav>
    </div>
  );
}