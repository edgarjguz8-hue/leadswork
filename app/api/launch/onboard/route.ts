import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { businessLaunch, launchStep, launchSubtask } from '@/lib/db/schema'
import { nanoid } from 'nanoid'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  try {
    console.log('[v0] Onboarding API called')
    
    // Ensure all tables exist before proceeding
    try {
      const initResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/init`)
      if (initResponse.ok) {
        console.log('[v0] Migrations completed')
      }
    } catch (initError) {
      console.log('[v0] Init call failed (might be startup timing):', initError)
      // Continue anyway - migrations might already be done
    }
    
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
        businessType: data.businessType || '',
        industry: data.industry || '',
        location: data.location || '',
        completedSteps: '[]', // JSON array of completed step IDs
        progress: 0, // 0-100
        status: 'draft', // in_progress, launched, paused
        isApproved: false,
        approvedAt: null,
        lastSavedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('[v0] Business launch created in database:', launchId)
    } catch (dbError) {
      console.error('[v0] Database error creating launch:', dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)
      console.error('[v0] Detailed error:', errorMessage)
      
      // Provide helpful error messages
      let userFriendlyMessage = 'Failed to create launch'
      if (errorMessage.includes('businessLaunch')) {
        userFriendlyMessage = 'Database table not initialized. Please try again.'
      } else if (errorMessage.includes('relation does not exist')) {
        userFriendlyMessage = 'Database tables not found. Initializing...'
      }
      
      return Response.json({ 
        error: userFriendlyMessage,
        details: errorMessage 
      }, { status: 500 })
    }

    // Create the 5 main steps with their subtasks
    const stepDefinitions = [
      {
        number: 1,
        title: 'Create Your Business',
        description: 'LeadsWork helps you create and define your business idea. We build the foundation of the business for you.',
        subtasks: [
          { title: 'Define business name and domain', aiType: 'guide' },
          { title: 'Create business description and value proposition', aiType: 'generator' },
          { title: 'Identify target market and customer segments', aiType: 'analyzer' },
          { title: 'Develop revenue and pricing strategy', aiType: 'strategist' },
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
      console.log('[v0] All 5 steps and subtasks created successfully')
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
