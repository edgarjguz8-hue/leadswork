const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('🔄 Connecting to Neon database...');
    const client = await pool.connect();
    
    try {
      const migrationFile = path.join(__dirname, '../migrations/safe_domain_tables.sql');
      const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');
      
      console.log('📝 Applying migration: safe_domain_tables.sql');
      
      // Split by semicolon and filter empty statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        console.log('⚙️  Executing SQL statement...');
        await client.query(statement);
      }
      
      console.log('✅ Migration applied successfully!');
      console.log('🎉 Database schema updated with domain tables');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
