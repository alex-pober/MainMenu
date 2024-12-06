import { createBrowserClient } from '@supabase/ssr';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'menu-item-pictures';

const getSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function uploadImages(imageFiles: string[]): Promise<string[]> {
  const supabase = getSupabaseClient();
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required');
    }

    const uploadPromises = imageFiles.map(async (imageFile) => {
      try {
        // Convert base64 to blob
        const base64Data = imageFile.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: 'image/jpeg' });
        const fileName = `${user.id}/${uuidv4()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        const { data, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
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

    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${user.id}/${fileName}`;

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}