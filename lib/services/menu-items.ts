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
  newImageFiles: string[],
  existingImageUrls: string[]
): Promise<MenuItem> {
  console.log('[MenuItems Service] Starting updateMenuItem:', {
    itemId,
    updateFields: Object.keys(updates),
    newImagesCount: newImageFiles.length,
    existingImagesCount: existingImageUrls.length
  });

  const supabase = getSupabaseClient();
  try {
    // Handle image changes
    const imagesToDelete = existingImageUrls.filter(url => !newImageFiles.includes(url));
    const newImages = newImageFiles.filter(file => !existingImageUrls.includes(file));
    
    console.log('[MenuItems Service] Image changes:', {
      toDelete: imagesToDelete,
      toUpload: newImages.length,
      finalImageCount: existingImageUrls.length - imagesToDelete.length + newImages.length
    });

    // Delete removed images
    if (imagesToDelete.length > 0) {
      try {
        console.log('[MenuItems Service] Deleting old images:', imagesToDelete);
        await Promise.all(imagesToDelete.map(url => deleteImage(url)));
        console.log('[MenuItems Service] Successfully deleted old images');
      } catch (error) {
        console.error('[MenuItems Service] Failed to delete images:', {
          error,
          images: imagesToDelete,
          errorMessage: error.message
        });
        throw new Error('Failed to delete old images');
      }
    }

    // Upload new images
    let uploadedUrls: string[] = [];
    if (newImages.length > 0) {
      try {
        console.log('[MenuItems Service] Uploading new images...');
        uploadedUrls = await uploadImages(newImages);
        console.log('[MenuItems Service] Successfully uploaded new images:', uploadedUrls);
      } catch (error) {
        console.error('[MenuItems Service] Failed to upload images:', {
          error,
          images: newImages,
          errorMessage: error.message
        });
        throw new Error('Failed to upload new images');
      }
    }

    // Combine existing and new image URLs
    const finalImageUrls = [
      ...existingImageUrls.filter(url => !imagesToDelete.includes(url)),
      ...uploadedUrls
    ];

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
      console.error('[MenuItems Service] Database update failed:', {
        error,
        errorMessage: error.message,
        details: error.details
      });
      throw error;
    }

    if (!data) {
      console.error('[MenuItems Service] No data returned from update');
      throw new Error('No data returned from database update');
    }

    console.log('[MenuItems Service] Successfully updated menu item:', {
      id: data.id,
      name: data.name,
      imageCount: data.image_urls?.length || 0
    });
    
    return {
      ...data,
      image_urls: data.image_urls || []
    };
  } catch (error) {
    console.error('[MenuItems Service] Error in updateMenuItem:', {
      error,
      errorMessage: error.message,
      stack: error.stack
    });
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