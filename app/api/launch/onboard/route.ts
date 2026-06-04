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
    console.log('[v0] Generated launchId:', launchId)
    
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
      console.log('[v0] Business launch created in database:', launchId)
    } catch (dbError) {
      console.error('[v0] Database error creating launch:', dbError)
      return Response.json({ error: 'Failed to create launch in database', details: String(dbError) }, { status: 500 })
    }

    // Create the 2 main steps with their subtasks (removed steps 1 and 2)
    const stepDefinitions = [
      {
        number: 1,
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
        number: 2,
        title: 'Find Customers',
        description: 'Develop and execute your customer acquisition strategy.',
        subtasks: [
          { title: 'Create marketing strategy', aiType: 'strategist' },
          { title: 'Setup social media presence', aiType: 'guide' },
          { title: 'Create content plan', aiType: 'generator' },
          { title: 'Launch customer acquisition campaigns', aiType: 'strategist' },
        ],
      },
    ]

    try {
      console.log('[v0] Creating steps and subtasks for launchId:', launchId)
      for (const stepDef of stepDefinitions) {
        const stepId = nanoid()
        console.log('[v0] Creating step:', stepDef.number, stepId)

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
        console.log('[v0] Step', stepDef.number, 'created with', stepDef.subtasks.length, 'subtasks')
      }
      console.log('[v0] All 2 steps and subtasks created successfully')
    } catch (stepsError) {
      console.error('[v0] Error creating steps/subtasks:', stepsError)
      return Response.json({ error: 'Failed to create steps', details: String(stepsError) }, { status: 500 })
    }

    console.log('[v0] Onboarding completed successfully, returning launchId:', launchId)
    return Response.json({ launchId, id: launchId, success: true })
  } catch (error) {
    console.error('[v0] Onboarding API error:', error)
    return Response.json({ error: 'Failed to create launch', details: String(error) }, { status: 500 })
  }
}
