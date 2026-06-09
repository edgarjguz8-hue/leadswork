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
      return Response.json({ error: 'Launch name is required' }, { status: 400 })
    }

    console.log('[v0] Generating website for:', launchName)

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `Based on the business "${launchName}", generate a comprehensive landing page structure.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "website": {
    "headline": "Compelling headline for the business",
    "subheadline": "Supporting subheadline or tagline",
    "aboutTitle": "About section title",
    "aboutContent": "2-3 sentences about the business and its mission",
    "servicesTitle": "Services section title",
    "servicesIntro": "Brief introduction to the services offered",
    "contactTitle": "Get in Touch or Contact Us",
    "contactEmail": "contact@example.com",
    "contactPhone": "+1 (555) 000-0000",
    "ctaHeadline": "Ready to get started?",
    "ctaText": "Join us today and transform your business",
    "ctaButtonText": "Get Started Now"
  }
}

Make the content professional, compelling, and aligned with the business name. Focus on clarity and persuasion.`,
    })

    console.log('[v0] Website generation response:', text)

    const parsed = JSON.parse(text)
    
    if (!parsed.website) {
      throw new Error('Invalid response structure')
    }

    return Response.json(parsed, { status: 200 })
  } catch (error) {
    console.error('[v0] Error generating website:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate website',
      },
      { status: 500 }
    )
  }
}
