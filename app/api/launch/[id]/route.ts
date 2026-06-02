import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch, launchStep, launchSubtask } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const launch = await db.query.businessLaunch.findFirst({
      where: and(
        eq(businessLaunch.id, params.id),
        eq(businessLaunch.userId, session.user.id)
      ),
    })

    if (!launch) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    // Fetch all steps with subtasks
    const steps = await db.query.launchStep.findMany({
      where: eq(launchStep.launchId, params.id),
      with: {
        subtasks: {
          orderBy: (subtasks, { asc }) => [asc(subtasks.order)],
        },
      },
    })

    // Calculate progress
    const allSubtasks = steps.flatMap(s => s.subtasks)
    const completedSubtasks = allSubtasks.filter(s => s.isCompleted).length
    const progress = allSubtasks.length > 0 ? Math.round((completedSubtasks / allSubtasks.length) * 100) : 0

    return Response.json({
      ...launch,
      progress,
      steps: steps.map(step => ({
        ...step,
        progress: step.subtasks.length > 0 ? Math.round(
          (step.subtasks.filter(s => s.isCompleted).length / step.subtasks.length) * 100
        ) : 0,
      })),
    })
  } catch (error) {
    console.error('[v0] Failed to fetch launch:', error)
    return Response.json({ error: 'Failed to fetch launch' }, { status: 500 })
  }
}
