import { streamText } from 'ai'
import { aiToolsConfig } from '@/lib/ai-tools-config'

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ section: string; toolId: string }>
  }
) {
  try {
    const { section, toolId } = await params
    const { businessContext } = await req.json()

    // Validate section and tool
    const sectionTools = aiToolsConfig[section as keyof typeof aiToolsConfig]
    if (!sectionTools) {
      return new Response('Invalid section', { status: 400 })
    }

    const tool = sectionTools.find((t: any) => t.id === toolId)
    if (!tool) {
      return new Response('Invalid tool', { status: 400 })
    }

    const systemPrompt = `You are an expert business consultant. ${tool.prompt}

Business Context: ${businessContext || 'General business startup'}

Provide comprehensive, specific, and actionable guidance. Format your response clearly with sections and bullet points where appropriate.`

    const result = await streamText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: `Please generate content for: ${tool.name}`,
      temperature: 0.7,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[v0] AI tool error:', error)
    return Response.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
