# Subscription Flow Documentation

## User Journey

### 1. Starting a Subscription

1. User clicks "Subscribe" button
2. System creates a new Stripe customer
3. Customer ID is stored in restaurant_profiles
4. User is redirected to Stripe Checkout
5. After successful payment:
   - Webhook receives checkout.session.completed
   - Subscription is created with 30-day trial
   - Subscription metadata is updated with user_id

### 2. During Trial Period

Status returned:
```json
{
  "status": "trialing",
  "isActive": true,
  "isTrial": true,
  "endDate": "2024-01-10T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "currentPeriodEnd": "2024-01-10T00:00:00Z",
  "trialEnd": "2024-01-10T00:00:00Z"
}
```

### 3. Active Subscription

Status returned:
```json
{
  "status": "active",
  "isActive": true,
  "isTrial": false,
  "endDate": "2024-02-10T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "currentPeriodEnd": "2024-02-10T00:00:00Z",
  "trialEnd": null
}
```

### 4. Canceled Subscription

When user cancels but subscription is still active:
```json
{
  "status": "canceled",
  "isActive": true,
  "isTrial": false,
  "endDate": "2024-02-10T00:00:00Z",
  "cancelAtPeriodEnd": true,
  "currentPeriodEnd": "2024-02-10T00:00:00Z",
  "trialEnd": null
}
```

### 5. Inactive Subscription

After cancellation takes effect:
```json
{
  "status": "inactive",
  "isActive": false,
  "isTrial": false,
  "endDate": null,
  "cancelAtPeriodEnd": false,
  "currentPeriodEnd": null,
  "trialEnd": null
}
```

## Webhook Events Flow

1. **Checkout Completed**
   ```typescript
   case 'checkout.session.completed': {
     // Store customer ID
     // Update subscription metadata
   }
   ```

2. **Subscription Created/Updated**
   ```typescript
   case 'customer.subscription.created':
   case 'customer.subscription.updated': {
     // Update subscription status
     // Sync metadata
   }
   ```

3. **Subscription Deleted**
   ```typescript
   case 'customer.subscription.deleted': {
     // Remove customer ID
     // Mark subscription as inactive
   }
   ```

## Managing Subscriptions

Users can manage their subscription through the Stripe Customer Portal:
1. Update payment method
2. Cancel subscription
3. View billing history
4. Update billing information

## Error Handling

Common error scenarios and responses:

1. **No Customer Found**
```json
{
  "error": "No Stripe customer found",
  "status": 400
}
```

2. **Webhook Verification Failed**
```json
{
  "error": "No signature found",
  "status": 400
}
```

3. **Database Update Failed**
```json
{
  "error": "Error updating profile",
  "status": 500
}
```

## Testing Webhooks Locally

1. Start webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

2. Trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## Frontend Components

### Subscription Status Display
```typescript
switch (subscriptionStatus.status) {
  case 'active':
    // Show active subscription UI
    break;
  case 'trialing':
    // Show trial subscription UI
    break;
  case 'canceled':
    // Show canceled but still active UI
    break;
  case 'inactive':
    // Show subscription ended/inactive UI
    break;
}
```

### Managing Access
Use the subscription status to control feature access:
```typescript
if (subscriptionStatus.isActive) {
  // Show premium features
} else {
  // Show upgrade prompt
}
```
