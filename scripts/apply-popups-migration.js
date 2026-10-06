const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const devConn = 'postgresql://postgres.hcxpfzsmzusolvhtuhhm:3sgJS8DxNkvZNlXB@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';
const prodConn = 'postgresql://postgres.jnfbfihzpplyersbhkch:Ej%40%40mCp29T5nUA-@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

const migration1 = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/20261006180000_create_marketing_popups.sql'),
  'utf8'
);

const migration2 = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/20261006190000_extend_marketing_popups_flexibility.sql'),
  'utf8'
);

const migration3 = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/20261006200000_add_image_fit_to_marketing_popups.sql'),
  'utf8'
);

async function runOnDb(name, connStr) {
  console.log(`\n⏳ Applying migrations to ${name}...`);
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(migration1);
    await client.query(migration2);
    await client.query(migration3);
    console.log(`✅ [${name}] All migrations applied successfully!`);
  } catch (err) {
    console.error(`❌ [${name}] Error:`, err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  await runOnDb('DEV (hcxpfzsmzusolvhtuhhm)', devConn);
  await runOnDb('PROD (jnfbfihzpplyersbhkch)', prodConn);
}

main();
