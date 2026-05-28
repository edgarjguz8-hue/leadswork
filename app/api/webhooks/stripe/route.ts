import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { userDomain } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('[v0] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[v0] STRIPE_SECRET_KEY not configured')
    return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('[v0] Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      
      console.log('[v0] Payment intent succeeded:', paymentIntent.id)

      // Get the metadata that we included when creating the PaymentIntent
      const { domainName, type } = paymentIntent.metadata as {
        domainName: string
        type: 'buy' | 'lease'
      }

      if (!domainName || !type) {
        console.error('[v0] Missing domain metadata in payment intent')
        return NextResponse.json({ error: 'Missing domain metadata' }, { status: 400 })
      }

      // Get the user ID from the PaymentIntent's customer metadata or from the order data
      // For now, we'll store it based on intent metadata
      // In a real app, you'd track the user with the PaymentIntent when creating it
      const userId = paymentIntent.metadata.userId

      if (!userId) {
        console.error('[v0] Missing user ID in payment intent metadata')
        return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
      }

      // Check if domain already exists
      const existing = await db
        .select()
        .from(userDomain)
        .where(eq(userDomain.domainName, domainName))

      if (existing.length > 0) {
        console.log('[v0] Domain already purchased:', domainName)
        return NextResponse.json({ success: true, message: 'Domain already exists' })
      }

      // Save the domain to user account
      const id = randomUUID()
      await db.insert(userDomain).values({
        id,
        userId,
        domainName,
        type,
        priceInCents: paymentIntent.amount,
        stripeSessionId: paymentIntent.id,
        purchasedAt: new Date(),
        expiresAt: type === 'lease' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log('[v0] Domain saved to user account:', domainName)
      return NextResponse.json({ success: true, domainId: id })
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('[v0] Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

