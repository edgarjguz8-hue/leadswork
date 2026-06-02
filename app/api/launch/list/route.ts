import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const launches = await db
      .select()
      .from(businessLaunch)
      .where(eq(businessLaunch.userId, session.user.id))

    return Response.json({ launches })
  } catch (error) {
    console.error('[v0] Error listing launches:', error)
    return Response.json({ error: 'Failed to fetch launches' }, { status: 500 })
  }
}
