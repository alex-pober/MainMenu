# Stripe Integration Documentation

## Overview
This document outlines the Stripe subscription integration in our application. The integration handles subscription creation, management, and status tracking for restaurant profiles.

## Environment Setup

Required environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000 # or your production URL
```

## Database Schema

In Supabase, the `restaurant_profiles` table needs the following columns:
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `stripe_customer_id` (text, nullable)

## API Endpoints

### 1. Create Checkout Session (`/api/stripe/create-checkout-session`)
Creates a Stripe checkout session for subscription initiation.

Features:
- Creates a new Stripe customer
- Stores the customer ID in Supabase
- Initiates a checkout session with trial period
- Includes user metadata for webhook processing

### 2. Subscription Status (`/api/stripe/subscription-status`)
Retrieves the current subscription status for a user.

Returns:
```typescript
{
  status: 'active' | 'trialing' | 'canceled' | 'inactive',
  isActive: boolean,
  isTrial: boolean,
  endDate: string | null,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: string,
  trialEnd: string | null
}
```

Status definitions:
- `active`: Subscription is active and will renew
- `trialing`: In trial period
- `canceled`: Subscription is active but will end at period end
- `inactive`: Subscription is ended or invalid

### 3. Create Portal Session (`/api/stripe/create-portal-session`)
Creates a Stripe billing portal session for subscription management.

Features:
- Retrieves customer ID from restaurant profile
- Creates a portal session for subscription management
- Handles return URL configuration

### 4. Webhook Handler (`/api/stripe/webhook`)
Handles Stripe webhook events for subscription lifecycle management.

Handled events:
- `checkout.session.completed`: Updates customer ID after successful checkout
- `customer.subscription.created`: Updates subscription metadata
- `customer.subscription.updated`: Updates subscription status
- `customer.subscription.deleted`: Removes customer ID when subscription is fully canceled

## Local Development Setup

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

2. Login to Stripe CLI:
```bash
stripe login
```

3. Forward webhooks to local environment:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Testing

Test the following flows:
1. New subscription creation
   - Start checkout
   - Complete payment
   - Verify customer ID storage
   - Check subscription status

2. Subscription management
   - Access billing portal
   - Update payment method
   - Cancel subscription
   - Verify status changes

3. Webhook handling
   - Monitor webhook events in Stripe CLI
   - Verify database updates
   - Check subscription status updates

## Error Handling

The integration includes error handling for:
- Missing or invalid customer IDs
- Failed database updates
- Invalid subscription states
- Webhook verification failures

## Security Considerations

1. Environment Variables
   - Keep all keys secure
   - Use different keys for development and production

2. Webhook Verification
   - Always verify webhook signatures
   - Use environment-specific webhook secrets

3. Database Access
   - Use service role key for webhook handlers
   - Verify user authentication for all endpoints

## Frontend Integration

The subscription system is integrated into the dashboard with components for:
- Subscription status display
- Checkout initiation
- Portal access
- Trial status indication

## Deployment Checklist

1. Environment Variables
   - Set all required environment variables
   - Update webhook endpoints in Stripe dashboard

2. Database
   - Verify table schema
   - Set appropriate permissions

3. Webhooks
   - Configure production webhook endpoints
   - Update webhook secrets

4. Testing
   - Test all subscription flows in production
   - Verify webhook handling
   - Check error handling
