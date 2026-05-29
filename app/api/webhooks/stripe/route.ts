import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { userDomain, domain as domainTable } from '@/lib/db/schema'
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
      const { domainId, type, userId } = paymentIntent.metadata as {
        domainId: string
        type: 'buy' | 'lease'
        userId: string
      }

      if (!domainId || !type || !userId) {
        console.error('[v0] Missing required metadata in payment intent', { domainId, type, userId })
        return NextResponse.json({ error: 'Missing required metadata' }, { status: 400 })
      }

      // Check if this payment has already been processed (idempotency)
      const existingUserDomain = await db
        .select()
        .from(userDomain)
        .where(eq(userDomain.stripeSessionId, paymentIntent.id))
        .limit(1)

      if (existingUserDomain.length > 0) {
        console.log('[v0] Payment already processed:', paymentIntent.id)
        return NextResponse.json({ success: true, message: 'Payment already processed' })
      }

      // Get the domain to verify it's available
      const domainRecord = await db
        .select()
        .from(domainTable)
        .where(eq(domainTable.id, domainId))
        .limit(1)

      if (domainRecord.length === 0) {
        console.error('[v0] Domain not found:', domainId)
        return NextResponse.json({ error: 'Domain not found' }, { status: 400 })
      }

      const domain = domainRecord[0]

      // If domain is no longer available, log but still create record
      if (domain.status !== 'available') {
        console.warn('[v0] Domain is no longer available:', domainId, 'status:', domain.status)
      }

      // Create user domain record and update domain status
      const id = randomUUID()
      
      if (type === 'buy') {
        // Update domain to sold status
        await db
          .update(domainTable)
          .set({
            status: 'sold',
            buyerId: userId,
            purchasedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(domainTable.id, domainId))

        console.log('[v0] Domain marked as sold:', domainId)
      } else {
        // Update domain to leased status
        const leaseExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        
        await db
          .update(domainTable)
          .set({
            status: 'leased',
            leaserId: userId,
            leaseStartAt: new Date(),
            leaseExpiresAt,
            updatedAt: new Date(),
          })
          .where(eq(domainTable.id, domainId))

        console.log('[v0] Domain marked as leased:', domainId)
      }

      // Create user domain record
      await db.insert(userDomain).values({
        id,
        userId,
        domainId,
        type,
        priceInCents: paymentIntent.amount,
        stripeSessionId: paymentIntent.id,
        purchasedAt: new Date(),
        expiresAt: type === 'lease' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log('[v0] User domain record created:', { id, userId, domainId, type })
      return NextResponse.json({ success: true, userDomainId: id })
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('[v0] Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

