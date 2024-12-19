import { createBrowserClient } from '@supabase/ssr';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'menu-item-pictures';

const getSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function uploadImages(imageFiles: File[]): Promise<string[]> {
  const supabase = getSupabaseClient();
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    const uploadPromises = imageFiles.map(async (file) => {
      try {
        // Validate file type with explicit WebP support
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          console.error('Invalid file type:', file.type);
          throw new Error(`Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`);
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File size exceeds 10MB limit');
        }

        const extension = file.type.split('/')[1];
        const fileName = `${user.id}/${uuidv4()}.${extension}`;

        const { data, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        if (!data?.path) {
          throw new Error('Upload successful but path is missing');
        }

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.path);

        return publicUrl;
      } catch (error) {
        console.error('Error uploading single image:', error);
        throw error;
      }
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error in uploadImages:', error);
    throw error;
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts[pathParts.length - 1];

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`${user.id}/${filePath}`]);

    if (deleteError) {
      throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}