import { generateText } from 'ai'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, launchName } = await req.json()

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt: `Generate 3 innovative business ideas for a ${category}.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "ideas": [
    {
      "name": "Business Name",
      "description": "2-3 sentence description of the business",
      "targetAudience": "Who this serves",
      "revenueModel": "How it makes money"
    },
    ...
  ]
}

Make sure each idea is unique, practical, and scalable.`,
    })

    try {
      const parsed = JSON.parse(text)
      return Response.json(parsed)
    } catch {
      console.error('[v0] Failed to parse generated ideas:', text)
      return Response.json(
        { error: 'Failed to parse generated content' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[v0] Generate ideas error:', error)
    return Response.json({ error: 'Failed to generate ideas' }, { status: 500 })
  }
}
