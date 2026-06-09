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

    console.log('[v0] Generating brand foundation for:', launchName)

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `Based on this business "${launchName}", generate a comprehensive brand foundation.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "foundation": {
    "missionStatement": "What is your core purpose? (1-2 sentences)",
    "visionStatement": "What is your inspiring future vision? (1-2 sentences)",
    "tagline": "A memorable short slogan or tagline",
    "brandPersonality": "Describe your brand personality in 3-5 words with brief explanation (e.g., Innovative, Bold, Trustworthy, Friendly, Professional)",
    "brandPositioning": "How will you position your brand in the market? (2-3 sentences)"
  }
}

Make the content authentic, memorable, and aligned with the business name. Focus on clarity and differentiation.`,
    })

    console.log('[v0] Brand generation response:', text)

    // Parse the response
    const parsed = JSON.parse(text)
    
    if (!parsed.foundation) {
      throw new Error('Invalid response structure')
    }

    return Response.json(parsed, { status: 200 })
  } catch (error) {
    console.error('[v0] Error generating brand foundation:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate brand foundation',
      },
      { status: 500 }
    )
  }
}
