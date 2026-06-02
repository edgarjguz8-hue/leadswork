import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch, launchSubtask, launchStep } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this launch
    const launch = await db.query.businessLaunch.findFirst({
      where: and(
        eq(businessLaunch.id, params.id),
        eq(businessLaunch.userId, session.user.id)
      ),
    })

    if (!launch) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const { stepId, subtaskId, isCompleted } = await req.json()

    // Update subtask
    await db
      .update(launchSubtask)
      .set({
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(launchSubtask.id, subtaskId))

    // Check if all subtasks in this step are completed
    const step = await db.query.launchStep.findFirst({
      where: eq(launchStep.id, stepId),
      with: { subtasks: true },
    })

    if (step) {
      const allCompleted = step.subtasks.every(st => st.isCompleted)
      if (allCompleted) {
        await db
          .update(launchStep)
          .set({
            isCompleted: true,
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(launchStep.id, stepId))
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to update subtask:', error)
    return Response.json({ error: 'Failed to update subtask' }, { status: 500 })
  }
}
