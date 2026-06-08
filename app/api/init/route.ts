import { runMigrations } from '@/lib/db/migrations'

export async function GET() {
  try {
    const result = await runMigrations()
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Init error:', error)
    return Response.json({ error: 'Init failed' }, { status: 500 })
  }
}
