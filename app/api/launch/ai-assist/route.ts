import { streamText } from 'ai'
import { headers } from 'next/headers'

const aiAssistants = {
  analyzer: 'Business Analyst',
  generator: 'Content Creator',
  guide: 'Business Coach',
  researcher: 'Market Researcher',
  strategist: 'Growth Strategist',
  recommender: 'Business Systems Expert',
}

export async function POST(req: Request) {
  try {
    const { subtaskTitle, stepTitle, assistanceType, businessContext } = await req.json()

    const systemPrompts = {
      analyzer: `You are a business analyst specializing in startup analysis. 
Provide insights, analysis, and recommendations to help the user progress on their task.
Keep responses concise, actionable, and specific to their business context.`,
      
      generator: `You are a professional business content creator.
Generate high-quality, compelling business content like copy, plans, and strategies.
Tailor everything to the user's specific business type and target market.`,
      
      guide: `You are an experienced business coach and mentor.
Provide step-by-step guidance, best practices, and actionable advice.
Make complex business concepts simple and practical.`,
      
      researcher: `You are a market research specialist.
Help the user understand their market, identify opportunities, and validate ideas.
Provide frameworks and methodologies for gathering market insights.`,
      
      strategist: `You are a growth and marketing strategist.
Develop specific, actionable strategies for acquiring customers and scaling the business.
Consider budget constraints and typical business growth patterns.`,
      
      recommender: `You are a business systems and tools expert.
Recommend specific tools, platforms, and systems that fit their needs and budget.
Explain why each recommendation is appropriate for their situation.`,
    }

    const result = await streamText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompts[assistanceType as keyof typeof systemPrompts] || systemPrompts.guide,
      prompt: `Task: ${subtaskTitle}
Step: ${stepTitle}
Business Context: ${businessContext || 'General business'}

Provide assistance for completing this task. Be specific, actionable, and helpful.`,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[v0] AI assistance error:', error)
    return Response.json({ error: 'Failed to generate assistance' }, { status: 500 })
  }
}
