import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookies = new Map(request.headers.get('cookie')?.split(';').map(c => {
              const [key, ...value] = c.trim().split('=');
              return [key, value.join('=')];
            }));
            return cookies.get(name);
          },
          set(name: string, value: string, options: any) {
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: any) {
            response.cookies.set(name, '', options);
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete user's restaurant profile
    const { error: profileError } = await supabase
      .from('restaurant_profiles')
      .delete()
      .eq('user_id', user.id);

    if (profileError) {
      throw profileError;
    }

    // Delete user's menus
    const { error: menuError } = await supabase
      .from('menus')
      .delete()
      .eq('user_id', user.id);

    if (menuError) {
      throw menuError;
    }

    // Delete the user's auth data
    const { error: authDeleteError } = await supabase.auth.signOut();
    if (authDeleteError) {
      throw authDeleteError;
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
