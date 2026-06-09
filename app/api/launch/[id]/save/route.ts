import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch, launchStep, launchSubtask } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const launchId = resolvedParams.id

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this launch
    const launch = await db.query.businessLaunch.findFirst({
      where: and(
        eq(businessLaunch.id, launchId),
        eq(businessLaunch.userId, session.user.id)
      ),
    })

    if (!launch) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const { action, status, data } = await req.json()

    if (action === 'save') {
      // Update last saved timestamp
      await db
        .update(businessLaunch)
        .set({
          lastSavedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(businessLaunch.id, launchId))

      return Response.json({ success: true, message: 'Progress saved' })
    }

    if (action === 'approve') {
      // Mark launch as approved
      await db
        .update(businessLaunch)
        .set({
          isApproved: true,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(businessLaunch.id, launchId))

      return Response.json({ success: true, message: 'Launch approved' })
    }

    if (action === 'complete') {
      // Mark all steps as completed and set status to launched
      const allSteps = await db.query.launchStep.findMany({
        where: eq(launchStep.launchId, launchId),
      })

      // Mark all steps as completed
      for (const step of allSteps) {
        await db
          .update(launchStep)
          .set({
            isCompleted: true,
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(launchStep.id, step.id))
      }

      // Mark launch as launched
      await db
        .update(businessLaunch)
        .set({
          status: 'launched',
          progress: 100,
          isApproved: true,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(businessLaunch.id, launchId))

      return Response.json({ success: true, message: 'Launch marked as complete and launched' })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Failed to save launch:', error)
    return Response.json({ error: 'Failed to save launch' }, { status: 500 })
  }
}
