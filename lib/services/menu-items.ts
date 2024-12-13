// @ts-nocheck
import { createBrowserClient } from '@supabase/ssr';
import { MenuItem } from '@/lib/types';
import { uploadImages, deleteImage } from '@/lib/utils/upload';

const getSupabaseClient = () => {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Log authentication state
  client.auth.getSession().then(({ data: { session }}) => {
    if (session?.user) {
      console.log('[MenuItems Service] Authenticated user:', session.user.id);
    } else {
      console.warn('[MenuItems Service] No authenticated user found');
    }
  });
  
  return client;
};

export async function updateMenuItem(
  itemId: string,
  updates: Partial<MenuItem>,
  newImageFiles: File[] | null = null,
  existingImageUrls: string[] = []
): Promise<MenuItem> {
  console.log('[MenuItems Service] Starting updateMenuItem:', {
    itemId,
    updateFields: Object.keys(updates),
    newImagesCount: newImageFiles?.length || 0,
    existingImagesCount: existingImageUrls.length
  });

  const supabase = getSupabaseClient();
  try {
    // Get current item to find removed images
    const { data: currentItem } = await supabase
      .from('menu_items')
      .select('image_urls')
      .eq('id', itemId)
      .single();

    // Find removed images and delete them from storage
    const removedUrls = currentItem.image_urls?.filter(url => !existingImageUrls.includes(url)) || [];
    if (removedUrls.length > 0) {
      console.log('[MenuItems Service] Deleting removed images:', removedUrls);
      await Promise.all(removedUrls.map(url => deleteImage(url)));
    }

    // Upload new images if provided
    let finalImageUrls = [...existingImageUrls];
    
    if (newImageFiles && newImageFiles.length > 0) {
      try {
        console.log('[MenuItems Service] Uploading new images...');
        const uploadedUrls = await uploadImages(newImageFiles);
        console.log('[MenuItems Service] Successfully uploaded new images:', uploadedUrls);
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      } catch (error) {
        console.error('[MenuItems Service] Failed to upload images:', {
          error,
          errorMessage: error.message
        });
        throw new Error('Failed to upload new images');
      }
    }

    console.log('[MenuItems Service] Updating database with:', {
      itemId,
      imageCount: finalImageUrls.length,
      updateFields: { ...updates, image_urls: finalImageUrls }
    });

    // Update the menu item in the database
    const { data, error } = await supabase
      .from('menu_items')
      .update({ 
        ...updates, 
        image_urls: finalImageUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('[MenuItems Service] Database update failed:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    console.log('[MenuItems Service] Successfully updated menu item:', data);
    return data;
  } catch (error) {
    console.error('[MenuItems Service] Error in updateMenuItem:', error);
    throw error;
  }
}

export async function getMenuItem(itemId: string): Promise<MenuItem> {
  console.log('[MenuItems Service] Fetching menu item:', itemId);
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('[MenuItems Service] Failed to fetch menu item:', {
      error,
      errorMessage: error.message,
      itemId
    });
    throw error;
  }

  console.log('[MenuItems Service] Successfully fetched menu item:', {
    id: data.id,
    name: data.name,
    imageCount: data.image_urls?.length || 0
  });

  return {
    ...data,
    image_urls: data.image_urls || []
  };
}