import { Metadata } from "next";
import { createClient } from '@/lib/supabase/server';
import Page from "./page";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const {id} = params
  
  try {
    const { data: profile } = await supabase
      .from('restaurant_profiles')
      .select('name, banner_image_url')
      .eq('user_id', id)
      .single();

    if (!profile) {
      console.log('No restaurant profile found for metadata generation');
      return {
        title: 'Menu Not Found',
        description: 'The requested menu could not be found',
      };
    }

    return {
      title: `${profile.name}'s Menu`,
      description: `View ${profile.name}'s digital menu`,
      openGraph: profile.banner_image_url ? {
        images: [{ url: profile.banner_image_url }],
      } : undefined,
    };
  } catch (error) {
    console.log('Error fetching restaurant profile for metadata:', error);
    return {
      title: 'Menu',
      description: 'View digital menu',
    };
  }
}

async function fetchMenuData(userId: string) {
  const supabase = await createClient();
  
  try {
    const [profileResponse, menusResponse] = await Promise.all([
      supabase
        .from('restaurant_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('menus')
        .select(`
          *,
          menu_categories (
            *,
            menu_items (
              *
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);

    if (profileResponse.error) {
      console.log('Error fetching restaurant profile:', profileResponse.error);
      throw profileResponse.error;
    }

    if (menusResponse.error) {
      console.log('Error fetching menu data:', menusResponse.error);
      throw menusResponse.error;
    }

    // Get the most recent menu
    const activeMenu = menusResponse.data[0];
    
    if (!activeMenu) {
      console.log('No menus found for user:', userId);
      throw new Error('No menus found');
    }

    return {
      profile: profileResponse.data,
      menu: activeMenu
    };
  } catch (error) {
    console.log('Error in fetchMenuData:', error);
    throw error;
  }
}

export default async function PageLayout({ params }: Props) {
  const {id} = params;
  const data = await fetchMenuData(id);
  
  return <Page initialData={data} />;
}