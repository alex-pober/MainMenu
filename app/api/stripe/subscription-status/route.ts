import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {

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
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('Checking subscription for user:', user.id)

    // Get the restaurant profile with stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('restaurant_profiles')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    console.log('Restaurant profile lookup result:', { profile, error: profileError })

    if (!profile?.stripe_customer_id) {
      console.log('No stripe_customer_id found for user')
      return NextResponse.json({
        status: 'inactive',
        isActive: false,
        isTrial: false,
        endDate: null,
        cancelAtPeriodEnd: false,
      })
    }

    console.log('Found stripe_customer_id:', profile.stripe_customer_id)

    // Get all customer's subscriptions
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      limit: 1,
      expand: ['data.default_payment_method'],
    })

    console.log('Stripe subscriptions result:', {
      count: subscriptions.length,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        current_period_end: sub.current_period_end,
        trial_end: sub.trial_end,
        cancel_at_period_end: sub.cancel_at_period_end
      }))
    })

    if (!subscriptions.length) {
      return NextResponse.json({
        status: 'inactive',
        isActive: false,
        isTrial: false,
        endDate: null,
        cancelAtPeriodEnd: false,
      })
    }

    const subscription = subscriptions[0]
    const now = Math.floor(Date.now() / 1000)
    const isTrialActive = subscription.trial_end ? subscription.trial_end > now : false

    // Determine subscription status
    let status: 'active' | 'trialing' | 'canceled' | 'inactive' = 'inactive'
    let isActive = false

    switch (subscription.status) {
      case 'trialing':
        status = 'trialing'
        isActive = true
        break
      case 'active':
        if (subscription.cancel_at_period_end) {
          status = 'canceled'
          isActive = true // Still active until the end of the period
        } else {
          status = 'active'
          isActive = true
        }
        break
      case 'canceled':
      case 'incomplete':
      case 'incomplete_expired':
      case 'past_due':
      case 'unpaid':
        status = 'inactive'
        isActive = false
        break
    }

    const response = {
      status,
      isActive,
      isTrial: isTrialActive,
      endDate: new Date((subscription.trial_end || subscription.current_period_end) * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      trialEnd: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
    }

    console.log('Returning subscription status:', response)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching subscription status:', error)
    return new NextResponse(
      error?.message || 'Failed to fetch subscription status',
      { status: 500 }
    )
  }
}
