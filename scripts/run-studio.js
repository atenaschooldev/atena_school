const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetEnv = process.argv[2] === 'dev' ? 'dev' : 'prod';
const envFile = path.join(__dirname, `../apps/backend/.env.${targetEnv}`);
const destFile = path.join(__dirname, '../apps/backend/.env');

if (fs.existsSync(envFile)) {
  fs.copyFileSync(envFile, destFile);
  console.log(`\x1b[32m✔ Loaded ${targetEnv.toUpperCase()} database credentials into apps/backend/.env\x1b[0m`);
}

console.log(`\x1b[36m🚀 Launching Prisma Studio on http://localhost:5555 (${targetEnv.toUpperCase()})...\x1b[0m\n`);

const child = spawn('npx', ['prisma', 'studio', '--port', '5555'], {
  cwd: path.join(__dirname, '../apps/backend'),
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
