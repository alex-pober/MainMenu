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
        // Check if the image data is valid
        if (!imageFile || !imageFile.includes('base64,')) {
          throw new Error('Invalid image data');
        }

        // Get the mime type from the base64 string
        const mimeType = imageFile.split(';')[0].split(':')[1];
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(mimeType)) {
          throw new Error('Invalid image type. Only JPEG, PNG, and GIF are supported.');
        }

        // Convert base64 to blob
        const base64Data = imageFile.split('base64,')[1];
        
        // Check file size before decoding (base64 is ~4/3 the size of binary)
        const estimatedSize = (base64Data.length * 3) / 4;
        if (estimatedSize > 10 * 1024 * 1024) { // 10MB limit
          throw new Error('File size exceeds 10MB limit');
        }

        // Decode base64
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        const sliceSize = 512;
        
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
          const byteNumbers = new Array(slice.length);
          
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        // Create blob with original mime type
        const blob = new Blob(byteArrays, { type: mimeType });
        const extension = mimeType.split('/')[1];
        const fileName = `${user.id}/${uuidv4()}.${extension}`;
        const file = new File([blob], fileName, { type: mimeType });

        const { data, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: mimeType
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