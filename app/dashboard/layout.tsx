"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Menu, 
  Settings, 
  BarChart2, 
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  Info,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/use-supabase';

const sidebarLinks = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard
  },
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
    title: 'Orders',
    href: '/dashboard/orders',
    icon: BarChart2
  },
  {
    title: 'Reservations',
    href: '/dashboard/reservations',
    icon: Clock
  },
  {
    title: 'Staff',
    href: '/dashboard/staff',
    icon: Users
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
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

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No user found, redirecting to auth');
      router.push('/auth');
    }
  }, [isLoading, user, router]);

  // Show loading state
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

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/auth');
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
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-background border-r transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[240px]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={cn(
            "font-bold transition-all duration-300",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            MainMenu
          </h1>
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
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
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
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f5] w-full">
        <main className="flex-1 overflow-auto p-4 pt-16 lg:pt-4"> {/* Added padding-top for mobile menu button */}
          <div className="bg-background rounded-lg p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}