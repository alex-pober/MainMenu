import { createServerClient } from '@supabase/ssr';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, redirect to login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check if we're on a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') && 
    !request.nextUrl.pathname.startsWith('/dashboard/subscription')
  
  if (isProtectedRoute) {
    if (user) {
      // Check if user has a stripe_customer_id and active subscription
      const { data: profile } = await supabase
        .from('restaurant_profiles')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      if (!profile?.stripe_customer_id) {
        return NextResponse.redirect(new URL('/dashboard/subscription', request.url))
      }

      // Get subscription status directly from Stripe
      const { data: subscriptions } = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        limit: 1,
        status: 'all'
      })

      const subscription = subscriptions[0]
      const isSubscriptionValid = subscription && 
        (subscription.status === 'active' || subscription.status === 'trialing')

      if (!isSubscriptionValid) {
        return NextResponse.redirect(new URL('/dashboard/subscription', request.url))
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth', '/login']
}