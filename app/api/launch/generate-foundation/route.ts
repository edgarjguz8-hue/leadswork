import { generateText } from 'ai'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ideaDescription, launchId } = await req.json()

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `Based on this business idea: "${ideaDescription}"

Generate a comprehensive business foundation document.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "foundation": {
    "businessName": "Suggested business name",
    "recommendedDomain": "suggested-domain.com",
    "description": "1-2 sentence business description",
    "industry": "The industry category (e.g., SaaS, Consulting, Ecommerce)",
    "location": "Suggested location or 'Remote' if location-independent",
    "whatYouSell": "Products/services description",
    "whoYouServe": "Target customer description",
    "problemSolved": "The specific problem this business solves",
    "revenueModel": "How the business generates revenue",
    "simplePricing": "Simple pricing structure (e.g., $29/month starter plan)",
    "businessPlanSummary": "2-3 sentence executive summary"
  }
}

Make the suggestions practical, actionable, and ready to implement.`,
    })

    try {
      const parsed = JSON.parse(text)
      
      // Update the launch in database with foundation data
      if (launchId) {
        await db
          .update(businessLaunch)
          .set({
            name: parsed.foundation.businessName,
            description: parsed.foundation.description,
          })
          .where(eq(businessLaunch.id, launchId))
      }

      return Response.json(parsed)
    } catch (parseError) {
      console.error('[v0] Failed to parse generated foundation:', text)
      return Response.json(
        { error: 'Failed to parse generated content' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[v0] Generate foundation error:', error)
    return Response.json({ error: 'Failed to generate foundation' }, { status: 500 })
  }
}
