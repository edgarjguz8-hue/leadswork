import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const launchId = resolvedParams.id
    
    console.log('[v0] Fetching launch:', launchId)
    
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      console.log('[v0] Unauthorized - no session')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const launch = await db.query.businessLaunch.findFirst({
      where: and(
        eq(businessLaunch.id, launchId),
        eq(businessLaunch.userId, session.user.id)
      ),
      with: {
        steps: {
          with: {
            subtasks: {
              orderBy: (subtasks: any, { asc }: any) => [asc(subtasks.order)],
            },
          },
          orderBy: (steps: any, { asc }: any) => [asc(steps.stepNumber)],
        },
      },
    })

    if (!launch) {
      console.log('[v0] Launch not found:', launchId)
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    console.log('[v0] Launch found with', launch.steps.length, 'steps')

    // Calculate progress
    const allSubtasks = launch.steps.flatMap((s: any) => s.subtasks)
    const completedSubtasks = allSubtasks.filter((s: any) => s.isCompleted).length
    const progress = allSubtasks.length > 0 ? Math.round((completedSubtasks / allSubtasks.length) * 100) : 0

    const response = {
      ...launch,
      progress,
      steps: launch.steps.map((step: any) => ({
        ...step,
        isCompleted: step.subtasks.every((s: any) => s.isCompleted),
        progress: step.subtasks.length > 0 ? Math.round(
          (step.subtasks.filter((s: any) => s.isCompleted).length / step.subtasks.length) * 100
        ) : 0,
      })),
    }
    
    console.log('[v0] Returning launch data')
    return Response.json(response)
  } catch (error) {
    console.error('[v0] Failed to fetch launch:', error)
    return Response.json({ error: 'Failed to fetch launch' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const launchId = resolvedParams.id

    console.log('[v0] Deleting launch:', launchId)

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      console.log('[v0] Unauthorized - no session')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the launch belongs to the user
    const launch = await db.query.businessLaunch.findFirst({
      where: and(
        eq(businessLaunch.id, launchId),
        eq(businessLaunch.userId, session.user.id)
      ),
    })

    if (!launch) {
      console.log('[v0] Launch not found:', launchId)
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete the launch (cascade will handle related records)
    await db.delete(businessLaunch).where(eq(businessLaunch.id, launchId))

    console.log('[v0] Launch deleted successfully:', launchId)
    return Response.json({ success: true, message: 'Launch deleted' })
  } catch (error) {
    console.error('[v0] Failed to delete launch:', error)
    return Response.json({ error: 'Failed to delete launch' }, { status: 500 })
  }
}
