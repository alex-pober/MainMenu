"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Info,
  X,
  Loader2,
  User,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/use-supabase';
import { useToast } from '@/hooks/use-toast';

const sidebarLinks = [
  {
    title: 'Menus',
    href: '/dashboard/menus',
    icon: Menu
  },
  {
    title: 'Restaurant Info',
    href: '/dashboard/restaurant-info',
    icon: Info
  },
  {
    title: 'QR Code',
    href: '/dashboard/qr-code',
    icon: QrCode
  },
  {
    title: 'Account',
    href: '/dashboard/account',
    icon: User
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { client: supabase, user, isLoading } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('No user found in dashboard, redirecting to auth');
        router.replace('/auth');
      } else {
        console.log('User authenticated in dashboard:', user.id);
      }
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background shadow-sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#f5f5f5] transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[240px]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          <div className={cn(
            "transition-all duration-300",
            collapsed ? "w-0" : "w-full"
          )}>
            <img 
              src="/images/main-menu-logo.svg" 
              alt="Main Menu Logo" 
              className={cn(
                "h-8 w-auto transition-all duration-300",
                collapsed ? "opacity-0" : "opacity-100"
              )}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
          {/* Show close button on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </Button>
        </div>

        {/* View Public Menu Button */}
        <div className="p-2">
          <Button
            variant="default"
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => window.open(`/menus/${user.id}`, '_blank')}
          >
            <ExternalLink size={20} />
            <span className={cn(
              "transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              View Public Menu
            </span>
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu when clicking a link
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                (pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href)))
                  ? "bg-white shadow-sm text-secondary-foreground hover:bg-white/90"
                  : "hover:bg-secondary/50 hover:text-secondary-foreground text-muted-foreground"
              )}
            >
              <link.icon size={20} />
              <span className={cn(
                "transition-all duration-300",
                collapsed ? "opacity-0 w-0" : "opacity-100"
              )}>
                {link.title}
              </span>
            </Link>
          ))}
        </nav>

        {/* Sign Out Button */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-accent-foreground"
            onClick={handleSignOut}
          >
            <LogOut size={20} />
            <span className={cn(
              "transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              Sign Out
            </span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden bg-[#f5f5f5] w-full",
        collapsed ? "lg:ml-[60px]" : "lg:ml-[240px]" // Add margin-left equal to sidebar width
      )}>
        <main className="flex-1 overflow-auto p-4 pt-16 lg:pt-4"> {/* Added padding-top for mobile menu button */}
          <div className="bg-background rounded-lg p-4">
            <div className="flex-1 space-y-4 p-0 pt-6 h-full overflow-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}