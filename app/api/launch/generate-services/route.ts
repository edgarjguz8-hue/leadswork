import { generateText } from 'ai'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { launchName } = await req.json()

    if (!launchName) {
      return Response.json(
        { error: 'Launch name is required' },
        { status: 400 }
      )
    }

    console.log('[v0] Generating services for:', launchName)

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `Based on the business "${launchName}", generate a comprehensive service offerings structure.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "services": {
    "valueProposition": "A clear statement of what unique value your services provide to customers",
    "customerBenefits": "Key benefits customers will experience from using your services (2-3 main benefits)",
    "packages": [
      {
        "id": "basic",
        "name": "Basic Package Name",
        "price": "$99/month or one-time price",
        "description": "Brief description of what's included",
        "features": ["Feature 1", "Feature 2", "Feature 3"]
      },
      {
        "id": "professional",
        "name": "Professional Package Name",
        "price": "$299/month or one-time price",
        "description": "Brief description of what's included",
        "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"]
      },
      {
        "id": "enterprise",
        "name": "Enterprise Package Name",
        "price": "Custom pricing",
        "description": "Brief description of what's included",
        "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"]
      }
    ]
  }
}

Create 3 tiered packages (Basic, Professional, Enterprise) that are realistic for this business type.
Make the value proposition compelling and benefits clear.`,
    })

    console.log('[v0] Services generation response:', text)

    // Parse the response
    const parsed = JSON.parse(text)
    
    if (!parsed.services) {
      throw new Error('Invalid response structure')
    }

    return Response.json(parsed, { status: 200 })
  } catch (error) {
    console.error('[v0] Error generating services:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate services',
      },
      { status: 500 }
    )
  }
}
