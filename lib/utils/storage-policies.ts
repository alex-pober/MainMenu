import { supabase } from '@/lib/supabase';

export async function setupStoragePolicies() {
  try {
    // First check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }

    const bucketExists = buckets?.some(b => b.name === 'menu-item-pictures');

    // If bucket doesn't exist, try to create it
    if (!bucketExists) {
      console.log('Creating menu-item-pictures bucket...');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }

      const { error: createError } = await supabase
        .storage
        .createBucket('menu-item-pictures', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
          fileSizeLimit: 5242880 // 5MB
        });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
    }

    // Verify bucket access
    const { error: testError } = await supabase
      .storage
      .from('menu-item-pictures')
      .list('');

    if (testError) {
      console.error('Error verifying bucket access:', testError);
      return;
    }

    console.log('Storage bucket setup completed successfully');
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}