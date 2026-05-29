const { Client } = require('pg');

async function verifySchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Check for domain table
    const domainTable = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'domain'
      );
    `);
    
    if (domainTable.rows[0].exists) {
      console.log('✅ domain table exists');
      
      // Get columns
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'domain'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Domain table columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ domain table does NOT exist');
    }

    // Check for domainVerification table
    const verificationTable = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'domainVerification'
      );
    `);
    
    if (verificationTable.rows[0].exists) {
      console.log('\n✅ domainVerification table exists');
    } else {
      console.log('\n❌ domainVerification table does NOT exist');
    }

    // Check for domainAvailabilityCache table
    const cacheTable = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'domainAvailabilityCache'
      );
    `);
    
    if (cacheTable.rows[0].exists) {
      console.log('✅ domainAvailabilityCache table exists');
    } else {
      console.log('❌ domainAvailabilityCache table does NOT exist');
    }

    console.log('\n✅ Schema verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySchema();
