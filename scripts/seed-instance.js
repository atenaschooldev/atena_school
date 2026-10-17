#!/usr/bin/env node

/**
 * ============================================================================
 * INSTANCE DATABASE SEED & SYNC SCRIPT
 * ============================================================================
 * Этот скрипт читает конфигурацию школы из apps/landing/src/config/brand.config.ts
 * и генерирует готовый SQL-скрипт для инициализации / обновления базы данных
 * Supabase нового инстанса.
 * 
 * Использование:
 *   pnpm seed:instance           -> Генерирует supabase/instance_seed.sql и выводит сводку
 *   pnpm seed:instance --execute -> Применяет SQL напрямую в Supabase (требуется DATABASE_URL)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const magenta = '\x1b[35m';
const bold = '\x1b[1m';
const reset = '\x1b[0m';

async function main() {
  const configPath = path.resolve(__dirname, '../apps/landing/src/config/brand.config.ts');

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config file not found at: ${configPath}`);
    process.exit(1);
  }

  // Dynamic import of TypeScript file (supported natively in modern Node.js)
  let brandModule;
  try {
    brandModule = await import('file://' + configPath);
  } catch (err) {
    console.error(`❌ Failed to import brand.config.ts:`, err.message);
    process.exit(1);
  }

  const { brandConfig, generateSchoolProfileSql } = brandModule;

  if (!brandConfig || !generateSchoolProfileSql) {
    console.error(`❌ brand.config.ts must export brandConfig and generateSchoolProfileSql`);
    process.exit(1);
  }

  const sql = generateSchoolProfileSql(brandConfig);
  const outPath = path.resolve(__dirname, '../supabase/instance_seed.sql');

  fs.writeFileSync(outPath, sql, 'utf8');

  console.log(`
${cyan}╔════════════════════════════════════════════════════════════════════════════╗${reset}
${cyan}║${reset}  ${bold}🏫 WHITE-LABEL INSTANCE CONFIGURATION & DB SEED${reset}                           ${cyan}║${reset}
${cyan}╠════════════════════════════════════════════════════════════════════════════╣${reset}
${cyan}║${reset}  🏷️  ${bold}School:${reset}       ${bold}${brandConfig.school.name}${reset} (${brandConfig.school.tagline || 'No tagline'})
${cyan}║${reset}  📍 ${bold}Location:${reset}     ${brandConfig.location.city} (${brandConfig.location.province}), ${brandConfig.location.address}
${cyan}║${reset}  📞 ${bold}Contacts:${reset}     ${brandConfig.contacts.phone} | ${brandConfig.contacts.email}
${cyan}║${reset}  🎨 ${bold}Theme:${reset}        Primary: ${bold}${brandConfig.theme.primary}${reset} | Secondary: ${bold}${brandConfig.theme.secondary}${reset}
${cyan}║${reset}  ✨ ${bold}Features:${reset}     English Test: ${brandConfig.features.enableEnglishTest ? green + 'ON' : yellow + 'OFF'}${reset} | Accreditations: ${brandConfig.features.enableAccreditations ? green + 'ON' : yellow + 'OFF'}${reset}
${cyan}║${reset}  💶 ${bold}Fee:${reset}          ${brandConfig.features.registrationFeeEnabled ? `${brandConfig.features.registrationFeeEur} €` : 'Disabled'}
${cyan}╠════════════════════════════════════════════════════════════════════════════╣${reset}
${cyan}║${reset}  💾 ${bold}SQL File Generated:${reset} ${green}${path.relative(process.cwd(), outPath)}${reset}
${cyan}╚════════════════════════════════════════════════════════════════════════════╝${reset}
`);

  const shouldExecute = process.argv.includes('--execute') || process.argv.includes('-e');

  if (shouldExecute) {
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    if (!dbUrl) {
      console.warn(`⚠️  Cannot execute directly: Neither DATABASE_URL nor SUPABASE_DATABASE_URL is set in environment.`);
      console.log(`👉 Please run the SQL manually in your Supabase Dashboard: SQL Editor -> Paste -> Run.`);
      return;
    }

    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: dbUrl });
      await client.connect();
      console.log(`⚡ Connected to PostgreSQL. Executing seed...`);
      await client.query(sql);
      await client.end();
      console.log(`\n${green}✅ Successfully seeded instance profile to Supabase database!${reset}\n`);
    } catch (dbErr) {
      console.error(`\n❌ Failed to execute query in database:`, dbErr.message);
      process.exit(1);
    }
  } else {
    console.log(`
👉 ${bold}Next Steps for New School Instance:${reset}
   1. Open your new Supabase project: ${cyan}https://supabase.com/dashboard${reset}
   2. Navigate to: ${bold}SQL Editor${reset} -> ${bold}New Query${reset}
   3. Copy & paste the contents of ${green}supabase/instance_seed.sql${reset} and click ${bold}Run${reset}
   (Or run: ${yellow}pnpm seed:instance --execute${reset} with DATABASE_URL in your env)
`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
