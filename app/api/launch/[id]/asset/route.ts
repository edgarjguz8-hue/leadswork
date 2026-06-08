import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { launchAsset, businessLaunch } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const launchId = params.id

    // Verify launch belongs to user
    const launch = await db
      .select()
      .from(businessLaunch)
      .where(and(eq(businessLaunch.id, launchId), eq(businessLaunch.userId, session.user.id)))
      .limit(1)

    if (!launch.length) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 })
    }

    // Get all assets for this launch
    const assets = await db
      .select()
      .from(launchAsset)
      .where(eq(launchAsset.launchId, launchId))

    return NextResponse.json(assets)
  } catch (error) {
    console.error('[v0] Error fetching assets:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const launchId = params.id
    const { type, title, content, isApproved } = await req.json()

    // Verify launch belongs to user
    const launch = await db
      .select()
      .from(businessLaunch)
      .where(and(eq(businessLaunch.id, launchId), eq(businessLaunch.userId, session.user.id)))
      .limit(1)

    if (!launch.length) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 })
    }

    // Check if asset already exists for this type
    const existingAsset = await db
      .select()
      .from(launchAsset)
      .where(and(eq(launchAsset.launchId, launchId), eq(launchAsset.type, type)))
      .limit(1)

    if (existingAsset.length) {
      // Update existing asset
      const updated = await db
        .update(launchAsset)
        .set({
          title,
          content,
          isApproved: isApproved ?? existingAsset[0].isApproved,
          approvedAt: isApproved ? new Date() : existingAsset[0].approvedAt,
          lastUpdatedAt: new Date(),
        })
        .where(eq(launchAsset.id, existingAsset[0].id))
        .returning()

      return NextResponse.json(updated[0])
    } else {
      // Create new asset
      const assetId = uuidv4()
      const newAsset = {
        id: assetId,
        launchId,
        type,
        title,
        content,
        isApproved: isApproved ?? false,
        approvedAt: isApproved ? new Date() : null,
        lastUpdatedAt: new Date(),
        createdAt: new Date(),
      }

      await db.insert(launchAsset).values(newAsset)
      return NextResponse.json(newAsset)
    }
  } catch (error) {
    console.error('[v0] Error saving asset:', error)
    return NextResponse.json({ error: 'Failed to save asset' }, { status: 500 })
  }
}
