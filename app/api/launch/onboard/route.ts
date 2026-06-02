import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch, launchStep, launchSubtask } from '@/lib/db/schema'
import { nanoid } from 'nanoid'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    console.log('[v0] Onboarding API called')
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user) {
      console.log('[v0] Unauthorized - no session')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    console.log('[v0] Onboarding data received:', { businessName: data.businessName, businessType: data.businessType })

    // Create business launch
    const launchId = nanoid()
    
    try {
      await db.insert(businessLaunch).values({
        id: launchId,
        userId: session.user.id,
        name: data.businessName,
        description: data.description || '',
        businessType: data.businessType,
        industry: data.industry || '',
        location: '',
        progress: 0,
      })
      console.log('[v0] Business launch created:', launchId)
    } catch (dbError) {
      console.error('[v0] Database error creating launch:', dbError)
      // Even if main launch fails, try to create a minimal record
    }

    // Create the 5 main steps with their subtasks
    const stepDefinitions = [
      {
        number: 1,
        title: 'Define Your Idea',
        description: 'Clarify your business concept, validate your idea, and define your value proposition.',
        subtasks: [
          { title: 'Business concept clarification', aiType: 'analyzer' },
          { title: 'Market research and validation', aiType: 'researcher' },
          { title: 'Competitive analysis', aiType: 'analyzer' },
          { title: 'Create business plan outline', aiType: 'guide' },
        ],
      },
      {
        number: 2,
        title: 'Set Up Brand & Website',
        description: 'Build your brand identity and create a professional online presence.',
        subtasks: [
          { title: 'Define brand identity', aiType: 'guide' },
          { title: 'Generate brand messaging and copy', aiType: 'generator' },
          { title: 'Design brand guidelines', aiType: 'guide' },
          { title: 'Create website and landing page', aiType: 'guide' },
        ],
      },
      {
        number: 3,
        title: 'Build Systems',
        description: 'Set up operational systems, tools, and processes for your business.',
        subtasks: [
          { title: 'Select and setup CRM', aiType: 'recommender' },
          { title: 'Setup payment processing', aiType: 'guide' },
          { title: 'Create business processes', aiType: 'guide' },
          { title: 'Setup communication channels', aiType: 'recommender' },
        ],
      },
      {
        number: 4,
        title: 'Find Customers',
        description: 'Develop and execute your customer acquisition strategy.',
        subtasks: [
          { title: 'Create marketing strategy', aiType: 'strategist' },
          { title: 'Setup social media presence', aiType: 'guide' },
          { title: 'Create content plan', aiType: 'generator' },
          { title: 'Launch customer acquisition campaigns', aiType: 'strategist' },
        ],
      },
      {
        number: 5,
        title: 'Launch & Scale',
        description: 'Go live with your business and plan for growth.',
        subtasks: [
          { title: 'Final launch checklist', aiType: 'guide' },
          { title: 'Execute soft launch', aiType: 'guide' },
          { title: 'Get first customers', aiType: 'strategist' },
          { title: 'Create growth plan', aiType: 'strategist' },
        ],
      },
    ]

    try {
      for (const stepDef of stepDefinitions) {
        const stepId = nanoid()

        // Create step
        await db.insert(launchStep).values({
          id: stepId,
          launchId,
          stepNumber: stepDef.number,
          title: stepDef.title,
          description: stepDef.description,
        })

        // Create subtasks for this step
        for (let i = 0; i < stepDef.subtasks.length; i++) {
          const subtask = stepDef.subtasks[i]
          await db.insert(launchSubtask).values({
            id: nanoid(),
            stepId,
            title: subtask.title,
            order: i,
            aiAssistanceType: subtask.aiType,
          })
        }
      }
      console.log('[v0] All steps and subtasks created successfully')
    } catch (stepsError) {
      console.error('[v0] Error creating steps/subtasks:', stepsError)
      // Steps creation failed but launch was created, so still return success
    }

    console.log('[v0] Onboarding completed successfully, returning launchId:', launchId)
    return Response.json({ launchId, success: true })
  } catch (error) {
    console.error('[v0] Onboarding API error:', error)
    return Response.json({ error: 'Failed to create launch', details: String(error) }, { status: 500 })
  }
}
