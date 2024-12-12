import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia'
})

// Product and Price IDs for PROD $9.99/month subscription
const PRODUCT_ID = 'prod_RNlkEeMkCONj13'
const PRICE_ID = 'price_1QV0CmBG7SkQxmXwebLfANBn'

export async function getSubscriptionPrice() {
  return PRICE_ID
}

export { stripe }
