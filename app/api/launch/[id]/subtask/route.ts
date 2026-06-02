import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch } from '@/lib/db/schema'
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

    const { stepId, subtaskId, isCompleted } = await req.json()

    // Parse current steps
    let steps = []
    try {
      steps = launch.completedSteps ? JSON.parse(launch.completedSteps) : []
    } catch (e) {
      console.error('[v0] Error parsing steps:', e)
      steps = []
    }

    // Find and update the subtask
    let found = false
    for (const step of steps) {
      if (step.id === stepId) {
        for (const subtask of step.subtasks || []) {
          if (subtask.id === subtaskId) {
            subtask.isCompleted = isCompleted
            subtask.completedAt = isCompleted ? new Date().toISOString() : null
            found = true
            break
          }
        }
        // Check if all subtasks in this step are completed
        if (step.subtasks) {
          step.isCompleted = step.subtasks.every((s: any) => s.isCompleted)
          if (step.isCompleted) {
            step.completedAt = new Date().toISOString()
          }
        }
        break
      }
    }

    if (!found) {
      return Response.json({ error: 'Subtask not found' }, { status: 404 })
    }

    // Calculate overall progress
    const allSubtasks = steps.flatMap((s: any) => s.subtasks || [])
    const completedSubtasks = allSubtasks.filter((s: any) => s.isCompleted).length
    const progress = allSubtasks.length > 0 ? Math.round((completedSubtasks / allSubtasks.length) * 100) : 0

    // Update launch record
    await db
      .update(businessLaunch)
      .set({
        completedSteps: JSON.stringify(steps),
        progress,
        updatedAt: new Date(),
      })
      .where(eq(businessLaunch.id, launchId))

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Failed to update subtask:', error)
    return Response.json({ error: 'Failed to update subtask' }, { status: 500 })
  }
}
