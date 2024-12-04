// @ts-nocheck
import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/lib/types';
import { uploadImages, deleteImage } from '@/lib/utils/upload';

export async function updateMenuItem(
  itemId: string,
  updates: Partial<MenuItem>,
  newImageFiles: string[],
  existingImageUrls: string[]
): Promise<MenuItem> {
  try {
    console.log('Starting item update with:', {
      itemId,
      updates,
      newImageCount: newImageFiles.length,
      existingImageCount: existingImageUrls.length
    });

    // Handle image changes
    const imagesToDelete = existingImageUrls.filter(url => !newImageFiles.includes(url));
    const newImages = newImageFiles.filter(file => !existingImageUrls.includes(file));
    
    console.log('Processing image updates:', {
      toDelete: imagesToDelete.length,
      toUpload: newImages.length
    });

    // Delete removed images
    if (imagesToDelete.length > 0) {
      try {
        await Promise.all(imagesToDelete.map(url => deleteImage(url)));
        console.log('Successfully deleted old images:', imagesToDelete);
      } catch (error) {
        console.error('Failed to delete old images:', error);
        throw new Error('Failed to delete old images');
      }
    }

    // Upload new images
    let uploadedUrls: string[] = [];
    if (newImages.length > 0) {
      try {
        uploadedUrls = await uploadImages(newImages);
        console.log('Successfully uploaded new images:', uploadedUrls);
      } catch (error) {
        console.error('Failed to upload new images:', error);
        throw new Error('Failed to upload new images');
      }
    }

    // Combine existing and new image URLs
    const finalImageUrls = [
      ...existingImageUrls.filter(url => !imagesToDelete.includes(url)),
      ...uploadedUrls
    ];

    console.log('Updating database with final image URLs:', finalImageUrls);

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
      console.error('Database update error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from database update');
    }

    console.log('Successfully updated menu item:', data);
    return {
      ...data,
      image_urls: data.image_urls || []
    };
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    throw error;
  }
}

export async function getMenuItem(itemId: string): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching menu item:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Menu item not found');
  }

  return {
    ...data,
    image_urls: data.image_urls || []
  };
}