'use client'

import { useSupabase } from '@/hooks/use-supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SubscriptionStatus {
  isActive: boolean
  isTrial: boolean
  endDate: string | null
  cancelAtPeriodEnd: boolean
}

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useSupabase()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) return
      try {
        const response = await fetch('/api/stripe/subscription-status')
        if (!response.ok) throw new Error('Failed to fetch subscription status')
        const data = await response.json()
        console.log('Subscription status:', data)
        setSubscription(data)
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    // Check if we just completed checkout
    const success = searchParams.get('success')
    const sessionId = searchParams.get('session_id')
    if (success === 'true' && sessionId) {
      console.log('Checkout completed successfully, session ID:', sessionId)
    }

    fetchSubscriptionStatus()
  }, [user, searchParams])

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to create checkout session')
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to create portal session')
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (isLoading || isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription</h1>
      
      {subscription?.isActive ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Subscription</CardTitle>
            <CardDescription>
              {subscription.isTrial 
                ? 'You are currently on a free trial' 
                : 'You have an active subscription'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  {subscription.isTrial ? 'Trial' : 'Active'}
                  {subscription.cancelAtPeriodEnd && ' (Cancels at period end)'}
                </p>
              </div>
              {subscription.endDate && (
                <div>
                  <p className="text-sm text-gray-500">
                    {subscription.cancelAtPeriodEnd ? 'Ends on' : 'Next billing date'}
                  </p>
                  <p className="font-medium">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleManageSubscription}
              className="w-full"
            >
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Plan</CardTitle>
              <CardDescription>After your trial ends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Full access to all features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubscribe}
                className="w-full"
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
