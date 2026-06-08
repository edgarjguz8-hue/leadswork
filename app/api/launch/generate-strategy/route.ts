import { generateText } from 'ai'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { launchName, launchId } = await req.json()

    if (!launchName) {
      return Response.json(
        { error: 'Launch name is required' },
        { status: 400 }
      )
    }

    console.log('[v0] Generating launch strategy for:', launchName)

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `Based on the business "${launchName}", generate a comprehensive launch strategy.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "strategy": {
    "checklist": [
      { "task": "Task description", "status": "pending", "dueDate": "Day 1" },
      { "task": "Task description", "status": "pending", "dueDate": "Day 2" },
      { "task": "Task description", "status": "pending", "dueDate": "Day 3" },
      { "task": "Task description", "status": "pending", "dueDate": "Week 1" },
      { "task": "Task description", "status": "pending", "dueDate": "Week 2" },
      { "task": "Task description", "status": "pending", "dueDate": "Month 1" }
    ],
    "marketingPlan": "Comprehensive marketing strategy including channels, tactics, and key metrics...",
    "firstCustomerRoadmap": "Step-by-step guide to acquiring and onboarding the first customer...",
    "thirtyDayPlan": "Detailed 30-day action plan with weekly milestones and deliverables..."
  }
}

Create realistic, actionable items specific to the business type. Include 6-8 checklist items spanning from launch day through first month.`,
    })

    console.log('[v0] Strategy generation response:', text)

    const parsed = JSON.parse(text)
    
    if (!parsed.strategy) {
      throw new Error('Invalid response structure')
    }

    return Response.json(parsed, { status: 200 })
  } catch (error) {
    console.error('[v0] Error generating launch strategy:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate launch strategy',
      },
      { status: 500 }
    )
  }
}
