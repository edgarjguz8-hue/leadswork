import { NextRequest, NextResponse } from 'next/server'
import { runMigrations } from '@/lib/db/migrations'

/**
 * Admin API to run database migrations
 * This should only be called by trusted sources
 */
export async function GET(req: NextRequest) {
  try {
    // In production, you'd want to verify auth here
    const authHeader = req.headers.get('authorization')
    const adminToken = process.env.ADMIN_MIGRATION_TOKEN

    if (adminToken && authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await runMigrations()
    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Migration API error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
