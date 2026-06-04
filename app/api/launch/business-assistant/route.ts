import { NextRequest, NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { launchId, message, businessFoundation, conversationHistory } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Build context from business foundation
    let context = ''
    if (businessFoundation) {
      context = `
The user's business foundation:
- Business Name: ${businessFoundation.businessName}
- Description: ${businessFoundation.description}
- What They Sell: ${businessFoundation.whatYouSell}
- Target Audience: ${businessFoundation.whoYouServe}
- Revenue Model: ${businessFoundation.revenueModel}
- Pricing: ${businessFoundation.simplePricing}
- Plan Summary: ${businessFoundation.businessPlanSummary}
      `.trim()
    }

    // Prepare messages for OpenAI
    const systemMessage = `You are a helpful Business Assistant. You help entrepreneurs think through their business ideas, answer questions about business building, and provide guidance on next steps for launching their business.

${context ? `User's Business Context:\n${context}` : 'The user is still building their business foundation.'}

Be concise, practical, and encouraging. Provide actionable advice when possible.`

    const conversationMessages: Message[] = (conversationHistory || [])
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }))

    // Add the current message
    conversationMessages.push({
      role: 'user',
      content: message,
    })

    console.log('[v0] Calling OpenAI for business assistant with', conversationMessages.length, 'messages')

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        ...conversationMessages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const assistantMessage = response.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    console.log('[v0] Generated assistant response')

    return NextResponse.json({
      response: assistantMessage,
    })
  } catch (error) {
    console.error('[v0] Business assistant error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
