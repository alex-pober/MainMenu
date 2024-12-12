import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature')

    console.log('Received webhook with signature:', !!signature)

    if (!signature) {
      return new NextResponse('No signature', { status: 400 })
    }

    console.log('Constructing Stripe event...')
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log('Stripe webhook event:', {
      type: event.type,
      id: event.id,
      apiVersion: event.api_version
    })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        console.log('Raw checkout session data:', JSON.stringify(session, null, 2))
        
        // Handle the checkout completion
        if (session.mode === 'subscription' && session.customer && session.metadata?.user_id) {
          console.log('Processing subscription checkout:', {
            mode: session.mode,
            customer: session.customer,
            userId: session.metadata.user_id
          })

          // First check if we already have a profile
          const { data: existingProfile, error: profileError } = await supabase
            .from('restaurant_profiles')
            .select('id, stripe_customer_id')
            .eq('user_id', session.metadata.user_id)
            .single()

          if (profileError) {
            console.error('Error fetching restaurant profile:', profileError)
            return new NextResponse('Error fetching profile', { status: 500 })
          }

          console.log('Found existing profile:', existingProfile)

          if (!existingProfile) {
            console.error('No restaurant profile found for user:', session.metadata.user_id)
            return new NextResponse('No restaurant profile found', { status: 400 })
          }

          console.log('Updating profile with customer ID:', {
            profileId: existingProfile.id,
            customerId: session.customer
          })

          // Try direct update first
          const { error: updateError } = await supabase
            .from('restaurant_profiles')
            .update({
              stripe_customer_id: session.customer
            })
            .eq('id', existingProfile.id)

          if (updateError) {
            console.error('Error updating restaurant profile:', updateError)
            
            // Try upsert as fallback
            const { error: upsertError } = await supabase
              .from('restaurant_profiles')
              .upsert({
                id: existingProfile.id,
                user_id: session.metadata.user_id,
                stripe_customer_id: session.customer
              })

            if (upsertError) {
              console.error('Error upserting restaurant profile:', upsertError)
              return new NextResponse('Error updating profile', { status: 500 })
            }
          }

          // Verify the update
          const { data: verifyProfile } = await supabase
            .from('restaurant_profiles')
            .select('id, stripe_customer_id')
            .eq('id', existingProfile.id)
            .single()

          console.log('Verified profile after update:', verifyProfile)

          if (session.subscription) {
            console.log('Retrieving subscription details...')
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            )
            
            console.log('Subscription details:', {
              id: subscription.id,
              status: subscription.status,
              customer: subscription.customer,
              current_period_end: subscription.current_period_end,
              trial_end: subscription.trial_end,
              cancel_at_period_end: subscription.cancel_at_period_end
            })

            // Update the subscription metadata with user_id
            await stripe.subscriptions.update(subscription.id, {
              metadata: {
                user_id: session.metadata.user_id
              }
            })
            
            console.log('Subscription setup complete')
          }
        } else {
          console.log('Skipping session - missing required data:', {
            hasMode: !!session.mode,
            hasCustomer: !!session.customer,
            hasUserId: !!session.metadata?.user_id
          })
        }
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        console.log('Raw subscription data:', JSON.stringify(subscription, null, 2))
        
        console.log('Subscription event details:', {
          id: subscription.id,
          status: subscription.status,
          customer: subscription.customer,
          metadata: subscription.metadata,
          current_period_end: subscription.current_period_end,
          trial_end: subscription.trial_end,
          cancel_at_period_end: subscription.cancel_at_period_end
        })

        // Try to get user_id from subscription metadata first
        let userId = subscription.metadata?.user_id

        // If no user_id in metadata, try to find the restaurant profile by customer ID
        if (!userId && subscription.customer) {
          const { data: profile, error: profileError } = await supabase
            .from('restaurant_profiles')
            .select('user_id')
            .eq('stripe_customer_id', subscription.customer)
            .single()

          if (profileError) {
            console.error('Error fetching restaurant profile:', profileError)
            return new NextResponse('Error fetching profile', { status: 500 })
          }

          if (profile) {
            userId = profile.user_id
            // Update the subscription metadata with user_id for future events
            console.log('Updating subscription metadata...')
            await stripe.subscriptions.update(subscription.id, {
              metadata: {
                user_id: userId
              }
            })
          }
        }

        if (userId) {
          // Get the restaurant profile for this user
          const { data: profile, error: profileError } = await supabase
            .from('restaurant_profiles')
            .select('id, stripe_customer_id')
            .eq('user_id', userId)
            .single()

          if (profileError) {
            console.error('Error fetching restaurant profile:', profileError)
            return new NextResponse('Error fetching profile', { status: 500 })
          }

          console.log('Found profile for subscription update:', profile)

          if (profile) {
            const { error } = await supabase
              .from('restaurant_profiles')
              .upsert({ 
                id: profile.id,
                user_id: userId,
                stripe_customer_id: subscription.customer
              })

            if (error) {
              console.error('Error updating subscription status:', error)
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        console.log('Raw subscription data:', JSON.stringify(subscription, null, 2))
        
        console.log('Subscription deleted:', {
          id: subscription.id,
          customer: subscription.customer,
          metadata: subscription.metadata
        })

        // Try to get user_id from subscription metadata first
        let userId = subscription.metadata?.user_id

        // If no user_id in metadata, try to find the restaurant profile by customer ID
        if (!userId && subscription.customer) {
          const { data: profile, error: profileError } = await supabase
            .from('restaurant_profiles')
            .select('user_id')
            .eq('stripe_customer_id', subscription.customer)
            .single()

          if (profileError) {
            console.error('Error fetching restaurant profile:', profileError)
            return new NextResponse('Error fetching profile', { status: 500 })
          }

          if (profile) {
            userId = profile.user_id
          }
        }

        if (userId) {
          // Get the restaurant profile for this user
          const { data: profile, error: profileError } = await supabase
            .from('restaurant_profiles')
            .select('id, stripe_customer_id')
            .eq('user_id', userId)
            .single()

          if (profileError) {
            console.error('Error fetching restaurant profile:', profileError)
            return new NextResponse('Error fetching profile', { status: 500 })
          }

          console.log('Found profile for subscription deletion:', profile)

          if (profile) {
            const { error } = await supabase
              .from('restaurant_profiles')
              .update({ 
                stripe_customer_id: null
              })
              .eq('id', profile.id)

            if (error) {
              console.error('Error updating subscription status:', error)
            }
          }
        }
        break
      }
    }

    return new NextResponse('Webhook handled', { status: 200 })
  } catch (error: any) {
    console.error('Stripe webhook error:', {
      message: error.message,
      type: error.type,
      stack: error.stack
    })
    return new NextResponse(error.message, { status: 400 })
  }
}
