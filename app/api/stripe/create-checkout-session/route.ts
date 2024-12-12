import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { stripe, getSubscriptionPrice } from '@/lib/stripe'

export async function POST(request: NextRequest) {
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

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        user_id: user.id
      }
    })

    // console.log('Created Stripe customer:', customer)

    // Store the customer ID in Supabase
    const { error: updateError } = await supabase
      .from('restaurant_profiles')
      .update({ 
        stripe_customer_id: customer.id 
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating restaurant profile:', updateError)
      // Try upsert if update fails
      const { error: upsertError } = await supabase
        .from('restaurant_profiles')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customer.id
        })

      if (upsertError) {
        console.error('Error upserting restaurant profile:', upsertError)
      }
    }

    const priceId = await getSubscriptionPrice()
    
    if (!priceId) {
      console.error('Failed to get or create price')
      return new NextResponse('Failed to create price', { status: 500 })
    }

    const origin = request.headers.get('origin')
    if (!origin) {
      return new NextResponse('Missing origin header', { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          user_id: user.id,
        },
      },
      metadata: {
        user_id: user.id,
      },
      allow_promotion_codes: true
    })

    // console.log('Created checkout session:', checkoutSession)

    if (!checkoutSession.url) {
      console.error('No URL in checkout session')
      return new NextResponse('Failed to create checkout session', { status: 500 })
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error?.message || error)
    return new NextResponse(
      error?.message || 'Failed to create checkout session', 
      { status: 500 }
    )
  }
}
