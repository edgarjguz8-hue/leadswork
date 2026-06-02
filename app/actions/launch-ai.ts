'use server'

import { generateText, tool } from 'ai'
import { z } from 'zod'

// Step 1: Business Idea Analyzer
export async function analyzeBusinessIdea(input: {
  businessName: string
  description: string
  targetMarket: string
  problemSolved: string
}) {
  const result = await generateText({
    model: 'openai/gpt-5-mini',
    system: `You are a business consultant specializing in startup analysis. 
Analyze the user's business idea and provide:
1. Market viability assessment
2. Unique value proposition strength
3. Target market analysis
4. Potential challenges and risks
5. Recommendations for business model
Provide a structured, actionable analysis.`,
    prompt: `Business Name: ${input.businessName}
Description: ${input.description}
Target Market: ${input.targetMarket}
Problem Solved: ${input.problemSolved}

Please analyze this business idea comprehensively.`,
  })

  return result.text
}

// Step 2: Brand & Copy AI Assistant
export async function generateBrandCopy(input: {
  businessName: string
  industry: string
  targetAudience: string
  uniqueValue: string
  tone: string
}) {
  const result = await generateText({
    model: 'openai/gpt-5-mini',
    system: `You are a professional copywriter and brand strategist.
Create compelling brand messaging including:
1. Brand tagline (short, memorable)
2. Elevator pitch (30 seconds)
3. Website hero headline
4. Value proposition statement
5. About us section
Maintain the specified tone and appeal to the target audience.`,
    prompt: `Business: ${input.businessName}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Unique Value: ${input.uniqueValue}
Brand Tone: ${input.tone}

Generate professional brand copy for this business.`,
  })

  return result.text
}

// Step 3: Systems & Tools Recommender
export async function recommendSystemsAndTools(input: {
  businessType: string
  businessSize: string
  revenue: string
  teamSize: string
  priorities: string[]
}) {
  const result = await generateText({
    model: 'openai/gpt-5-mini',
    system: `You are a business operations expert.
Recommend specific tools and systems for:
1. Customer Relationship Management (CRM)
2. Payment processing
3. Communication tools
4. Project management
5. Financial management
6. Automation tools

For each, provide tool name, reason why, and setup steps.`,
    prompt: `Business Type: ${input.businessType}
Business Size: ${input.businessSize}
Revenue: ${input.revenue}
Team Size: ${input.teamSize}
Priorities: ${input.priorities.join(', ')}

Recommend the best systems and tools for this business.`,
  })

  return result.text
}

// Step 4: Marketing Strategy Generator
export async function generateMarketingStrategy(input: {
  businessName: string
  industry: string
  targetAudience: string
  budget: string
  goals: string[]
}) {
  const result = await generateText({
    model: 'openai/gpt-5-mini',
    system: `You are a digital marketing strategist.
Create a comprehensive marketing strategy including:
1. Customer acquisition channels (prioritized)
2. Content marketing plan
3. Social media strategy
4. Email marketing approach
5. Partnership opportunities
6. Budget allocation recommendations
Make it actionable and specific to the business.`,
    prompt: `Business: ${input.businessName}
Industry: ${input.industry}
Target Audience: ${input.targetAudience}
Marketing Budget: ${input.budget}
Goals: ${input.goals.join(', ')}

Create a detailed marketing strategy for this business.`,
  })

  return result.text
}

// Step 5: Launch & Growth Advisor
export async function generateLaunchStrategy(input: {
  businessName: string
  industry: string
  launchDate: string
  currentProgress: string
  challenges: string[]
}) {
  const result = await generateText({
    model: 'openai/gpt-5-mini',
    system: `You are a startup launch and growth specialist.
Create a launch and growth strategy including:
1. Pre-launch checklist (critical items)
2. Launch day activities
3. Post-launch metrics to track
4. First 30 days growth plan
5. Common pitfalls to avoid
6. Scaling strategy for months 2-6
Provide specific, measurable recommendations.`,
    prompt: `Business: ${input.businessName}
Industry: ${input.industry}
Planned Launch: ${input.launchDate}
Current Progress: ${input.currentProgress}
Known Challenges: ${input.challenges.join(', ')}

Create a comprehensive launch and growth strategy.`,
  })

  return result.text
}
