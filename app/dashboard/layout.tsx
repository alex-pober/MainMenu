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
  Info
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
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  // @ts-ignore
  const { client: supabase, error: supabaseError, user } = useSupabase();

  useEffect(() => {
    if (!supabase) return;

    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          router.push('/auth');
          return;
        }
        setUserId(user.id);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/auth');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUserId(null);
          router.push('/auth');
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id);
        }
      }
    );

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSignOut = async () => {
    if (!supabase) {
      console.error('Error signing out: Unable to connect to authentication service');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "border-r bg-card transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-14 border-b flex items-center justify-between px-3">
            <span className={cn(
              "font-semibold transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              MainMenu
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>

          {/* View Public Menu Button at Top */}
          <div className="p-2">
            <Button
              variant="default"
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => userId && window.open(`/menus/${userId}`, '_blank')}
              disabled={!userId}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-6">
          <h2 className="font-semibold">
            {sidebarLinks.find(link => link.href === pathname)?.title || 'Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}