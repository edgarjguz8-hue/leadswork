import { generateText } from 'ai'

interface GenerateFoundationRequest {
  idea: string
}

interface BusinessFoundation {
  businessName: string
  domain: string
  businessDescription: string
  whatYouSell: string[]
  whoYouServe: string[]
  revenueModel: string
  pricing: string
  businessPlanSummary: string
}

export async function POST(request: Request) {
  try {
    const { idea } = (await request.json()) as GenerateFoundationRequest

    if (!idea || idea.trim().length === 0) {
      return Response.json({ error: 'Business idea is required' }, { status: 400 })
    }

    const prompt = `You are a business strategist helping entrepreneurs build successful businesses. 
Based on the following business idea, generate a practical, specific business foundation.

BUSINESS IDEA: ${idea}

Generate ONLY valid JSON (no markdown, no code blocks) with these exact fields:
{
  "businessName": "A memorable, professional business name (NOT generic)",
  "domain": "A domain name suggestion (lowercase, .com, derived from the business name)",
  "businessDescription": "One sentence describing what the business does and who it serves (specific, not generic)",
  "whatYouSell": ["item1", "item2", "item3", "item4", "item5"],
  "whoYouServe": ["market1", "market2", "market3"],
  "revenueModel": "Specific revenue model based on the business type (e.g., 'Monthly subscriptions starting at $299/month with implementation fees', NOT 'service-based revenue')",
  "pricing": "Practical pricing (e.g., '$50-$150/hour for freelance work' or '$299/month for SaaS', specific to this business)",
  "businessPlanSummary": "A 3-4 sentence specific action plan for Year 1 (Month 1-3: launch and acquire first 5 customers. Month 4-6: optimize and expand. Month 7-12: scale). Include specific milestones."
}

IMPORTANT RULES:
1. Be SPECIFIC to this business idea - no generic advice
2. Include specific pricing and numbers
3. No market research language or analysis
4. No competitive analysis
5. Focus on practical, actionable information
6. Business name should be creative and memorable
7. Domain should be simple and professional
8. whatYouSell should be specific products/services this business offers
9. whoYouServe should be specific customer segments
10. businessPlanSummary should have concrete monthly milestones

Return ONLY the JSON object, no additional text or markdown.`

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      temperature: 0.7,
    })

    console.log('[v0] AI Generated Foundation:', text)

    // Parse the response
    let foundation: BusinessFoundation
    try {
      foundation = JSON.parse(text)
    } catch (parseError) {
      console.error('[v0] JSON Parse Error:', parseError)
      console.error('[v0] Raw text:', text)
      return Response.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate the foundation structure
    if (
      !foundation.businessName ||
      !foundation.domain ||
      !foundation.businessDescription ||
      !Array.isArray(foundation.whatYouSell) ||
      !Array.isArray(foundation.whoYouServe) ||
      !foundation.revenueModel ||
      !foundation.pricing ||
      !foundation.businessPlanSummary
    ) {
      console.error('[v0] Invalid foundation structure:', foundation)
      return Response.json(
        { error: 'AI response missing required fields. Please try again.' },
        { status: 500 }
      )
    }

    return Response.json(foundation)
  } catch (error) {
    console.error('[v0] Generate Foundation API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { error: `Failed to generate business foundation: ${errorMessage}` },
      { status: 500 }
    )
  }
}
