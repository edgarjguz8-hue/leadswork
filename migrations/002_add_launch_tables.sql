CREATE TABLE IF NOT EXISTS "businessLaunch" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "businessType" text,
  "industry" text,
  "location" text,
  "completedSteps" text NOT NULL DEFAULT '[]',
  "progress" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'in_progress',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "launchStep" (
  "id" text PRIMARY KEY NOT NULL,
  "launchId" text NOT NULL,
  "stepNumber" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "isCompleted" boolean NOT NULL DEFAULT false,
  "completedAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  FOREIGN KEY ("launchId") REFERENCES "businessLaunch"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "launchSubtask" (
  "id" text PRIMARY KEY NOT NULL,
  "stepId" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "order" integer NOT NULL,
  "isCompleted" boolean NOT NULL DEFAULT false,
  "completedAt" timestamp,
  "aiAssistanceType" text,
  "resourceIds" json DEFAULT '[]',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  FOREIGN KEY ("stepId") REFERENCES "launchStep"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "launchResource" (
  "id" text PRIMARY KEY NOT NULL,
  "stepId" text NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "content" text,
  "url" text,
  "order" integer NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  FOREIGN KEY ("stepId") REFERENCES "launchStep"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "launchChat" (
  "id" text PRIMARY KEY NOT NULL,
  "launchId" text NOT NULL,
  "stepId" text NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  FOREIGN KEY ("launchId") REFERENCES "businessLaunch"("id") ON DELETE CASCADE,
  FOREIGN KEY ("stepId") REFERENCES "launchStep"("id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_businessLaunch_userId" ON "businessLaunch"("userId");
CREATE INDEX IF NOT EXISTS "idx_launchStep_launchId" ON "launchStep"("launchId");
CREATE INDEX IF NOT EXISTS "idx_launchSubtask_stepId" ON "launchSubtask"("stepId");
CREATE INDEX IF NOT EXISTS "idx_launchResource_stepId" ON "launchResource"("stepId");
CREATE INDEX IF NOT EXISTS "idx_launchChat_launchId" ON "launchChat"("launchId");
CREATE INDEX IF NOT EXISTS "idx_launchChat_stepId" ON "launchChat"("stepId");
