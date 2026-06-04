import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { launchId, businessData } = await req.json()

    if (!launchId || !businessData) {
      return Response.json(
        { error: 'Missing launchId or businessData' },
        { status: 400 }
      )
    }

    // Verify the launch belongs to the user
    const launch = await db.query.businessLaunch.findFirst({
      where: and(
        eq(businessLaunch.id, launchId),
        eq(businessLaunch.userId, session.user.id)
      ),
    })

    if (!launch) {
      return Response.json({ error: 'Launch not found' }, { status: 404 })
    }

    // Update the business launch with Step 1 data
    const updated = await db
      .update(businessLaunch)
      .set({
        name: businessData.businessName || launch.name,
        description: businessData.description || launch.description,
        businessType: businessData.businessType,
        industry: businessData.industry,
        updatedAt: new Date(),
      })
      .where(eq(businessLaunch.id, launchId))
      .returning()

    console.log('[v0] Updated launch with Step 1 data')

    return Response.json({
      success: true,
      launch: updated[0],
    })
  } catch (error) {
    console.error('[v0] Failed to update Step 1:', error)
    return Response.json(
      { error: 'Failed to save Step 1 data' },
      { status: 500 }
    )
  }
}
