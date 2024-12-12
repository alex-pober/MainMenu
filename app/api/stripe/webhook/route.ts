import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.created',
])

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      console.error('Missing webhook requirements:', {
        hasSignature: !!sig,
        hasSecret: !!webhookSecret
      })
      return new NextResponse('Webhook Error: Missing stripe-signature or webhook secret', { status: 400 })
    }
    
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', {
      error: err.message,
      signature: sig?.slice(0, 20) + '...',  // Only log part of the signature
      bodyPreview: body.slice(0, 50) + '...'  // Only log start of body
    })
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (relevantEvents.has(event.type)) {
    try {
      // Simple server client for database updates
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get() { return '' },
            set() {},
            remove() {},
          },
        }
      )

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          await supabase
            .from('restaurant_profiles')
            .update({
              subscription_status: subscription.status,
              subscription_id: subscription.id,
              subscription_price_id: subscription.items.data[0].price.id,
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              subscription_cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_customer_id', subscription.customer as string)
          break
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          await supabase
            .from('restaurant_profiles')
            .update({
              subscription_status: 'canceled',
              subscription_cancel_at_period_end: false,
              subscription_current_period_end: null,
            })
            .eq('stripe_customer_id', subscription.customer as string)
          break
        }

        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          if (session.customer && session.metadata?.user_id) {
            await supabase
              .from('restaurant_profiles')
              .update({
                stripe_customer_id: session.customer as string,
              })
              .eq('user_id', session.metadata.user_id)
          }
          break
        }
      }
    } catch (error) {
      return new NextResponse('Webhook handler failed', { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}
