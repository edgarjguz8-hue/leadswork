import { pgTable, text, timestamp, boolean, integer, json } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const domain = pgTable('domain', {
  id: text('id').primaryKey(),
  normalizedName: text('normalizedName').notNull().unique(),
  displayName: text('displayName').notNull(),
  buyPrice: integer('buyPrice').notNull(),
  leasePrice: integer('leasePrice').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  score: integer('score').notNull(),
  status: text('status').notNull().default('available'), // available, pending, sold, leased
  buyerId: text('buyerId').references(() => user.id, { onDelete: 'set null' }),
  leaserId: text('leaserId').references(() => user.id, { onDelete: 'set null' }),
  ownerId: text('ownerId').references(() => user.id, { onDelete: 'set null' }),
  purchasedAt: timestamp('purchasedAt'),
  leaseStartAt: timestamp('leaseStartAt'),
  leaseExpiresAt: timestamp('leaseExpiresAt'),
  externallyRegistered: boolean('externallyRegistered').default(false),
  verificationStatus: text('verificationStatus').default('unverified'), // unverified, pending_verification, verified_owner, rejected
  verificationId: text('verificationId').references(() => domainVerification.id, { onDelete: 'set null' }),
  lastExternalCheck: timestamp('lastExternalCheck'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const domainVerification = pgTable('domainVerification', {
  id: text('id').primaryKey(),
  domainId: text('domainId')
    .notNull()
    .references(() => domain.id, { onDelete: 'cascade' }),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  verificationCode: text('verificationCode').notNull(),
  verificationStatus: text('verificationStatus').notNull().default('pending_verification'), // pending_verification, verified_owner, rejected
  verifiedAt: timestamp('verifiedAt'),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const domainAvailabilityCache = pgTable('domainAvailabilityCache', {
  id: text('id').primaryKey(),
  normalizedName: text('normalizedName').notNull().unique(),
  isAvailable: boolean('isAvailable').notNull(),
  externallyRegistered: boolean('externallyRegistered').notNull(),
  lastChecked: timestamp('lastChecked').notNull().defaultNow(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const userDomain = pgTable('userDomain', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  domainId: text('domainId')
    .notNull()
    .references(() => domain.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // buy or lease
  priceInCents: integer('priceInCents').notNull(),
  stripeSessionId: text('stripeSessionId').notNull().unique(),
  purchasedAt: timestamp('purchasedAt').notNull().defaultNow(),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const businessLaunch = pgTable('businessLaunch', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  businessType: text('businessType'),
  industry: text('industry'),
  location: text('location'),
  completedSteps: text('completedSteps').notNull().default('[]'), // JSON array of completed step IDs
  progress: integer('progress').notNull().default(0), // 0-100
  status: text('status').notNull().default('in_progress'), // in_progress, launched, paused
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// --- Business Launch System Tables -------------------------------------------

export const launchStep = pgTable('launchStep', {
  id: text('id').primaryKey(),
  launchId: text('launchId')
    .notNull()
    .references(() => businessLaunch.id, { onDelete: 'cascade' }),
  stepNumber: integer('stepNumber').notNull(), // 1-5
  title: text('title').notNull(),
  description: text('description'),
  isCompleted: boolean('isCompleted').notNull().default(false),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const launchSubtask = pgTable('launchSubtask', {
  id: text('id').primaryKey(),
  stepId: text('stepId')
    .notNull()
    .references(() => launchStep.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  isCompleted: boolean('isCompleted').notNull().default(false),
  completedAt: timestamp('completedAt'),
  aiAssistanceType: text('aiAssistanceType'), // 'analyzer', 'guide', 'generator', 'researcher', 'strategist'
  resourceIds: json('resourceIds').$type<string[]>().default([]), // References to resources
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const launchResource = pgTable('launchResource', {
  id: text('id').primaryKey(),
  stepId: text('stepId')
    .notNull()
    .references(() => launchStep.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'template', 'guide', 'tool', 'calculator', 'generator'
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'), // HTML or JSON content
  url: text('url'), // External URL if applicable
  order: integer('order').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const launchChat = pgTable('launchChat', {
  id: text('id').primaryKey(),
  launchId: text('launchId')
    .notNull()
    .references(() => businessLaunch.id, { onDelete: 'cascade' }),
  stepId: text('stepId')
    .notNull()
    .references(() => launchStep.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user', 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
