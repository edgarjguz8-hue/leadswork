import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const launches = await db
      .select()
      .from(businessLaunch)
      .where(eq(businessLaunch.userId, session.user.id))

    return Response.json({ launches })
  } catch (error) {
    console.error('Failed to fetch launches:', error)
    return Response.json({ error: 'Failed to fetch launches' }, { status: 500 })
  }
}
