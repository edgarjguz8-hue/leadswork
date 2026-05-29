#!/usr/bin/env node

import { config } from 'dotenv'
import { sql } from 'drizzle-orm'
import { db } from '../lib/db/index.js'
import fs from 'fs'
import path from 'path'

config()

const migrationFile = path.join(process.cwd(), 'migrations', 'create_domain_tables.sql')

async function runMigration() {
  try {
    console.log('[v0] Starting database migration...')
    
    const migrationSQL = fs.readFileSync(migrationFile, 'utf-8')
    
    // Split by semicolon and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (const statement of statements) {
      console.log('[v0] Executing:', statement.substring(0, 50) + '...')
      await db.execute(sql.raw(statement))
    }
    
    console.log('[v0] Migration completed successfully!')
    console.log('[v0] The domain table and domainVerification table are now ready.')
    process.exit(0)
  } catch (error) {
    console.error('[v0] Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
