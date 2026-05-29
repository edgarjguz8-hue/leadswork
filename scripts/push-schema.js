import 'dotenv/config';
import { execSync } from 'child_process';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('[v0] ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('[v0] DATABASE_URL found, running drizzle-kit push...');
console.log('[v0] Connecting to Neon database...');

try {
  execSync('drizzle-kit push', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
  console.log('[v0] SUCCESS: Database schema pushed to Neon!');
  console.log('[v0] The domain table and all related tables have been created.');
} catch (error) {
  console.error('[v0] ERROR: Failed to push schema to database');
  console.error(error);
  process.exit(1);
}
