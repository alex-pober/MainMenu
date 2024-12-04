import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { MenuTabs } from '@/components/public/menus/menu-tabs';

interface MenuPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  { params }: MenuPageProps
): Promise<Metadata> {
  const cookieStore = cookies();
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: menus } = await supabase
    .from('menus')
    .select('name')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
 
  if (!menus) {
    return {
      title: 'Menus Not Found',
      description: 'The requested menus could not be found.'
    };
  }

  return {
    title: `${menus.name}'s Menus`,
    description: `View all menus from ${menus.name}`
  };
}

export default async function MenuPage({ params }: MenuPageProps) {
  const cookieStore = cookies();
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: menus } = await supabase
    .from('menus')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  if (!menus || menus.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Our Menus</h1>
          <p className="mt-2 text-muted-foreground">Browse our selection of menus</p>
        </header>

        <div className="space-y-6">
          <MenuTabs userId={id} />
        </div>
      </div>
    </div>
  );
}
