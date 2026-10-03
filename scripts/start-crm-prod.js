const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const envType = process.argv[2] === "dev" ? "dev" : "prod";
const isProd = envType === "prod";

// Colors
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const magenta = "\x1b[35m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

// Ensure .env files exist
const apps = ["backend", "admin"];
apps.forEach((app) => {
  const envSrc = path.join(rootDir, `apps/${app}/.env.${envType}`);
  const envDest = path.join(rootDir, `apps/${app}/.env`);
  if (!fs.existsSync(envDest) && fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envDest);
  }
});

const envBadge = isProd
  ? `\x1b[41m\x1b[37m\x1b[1m 🟢 PRODUCTION (jnfbfihz) \x1b[0m`
  : `\x1b[43m\x1b[30m\x1b[1m 🟡 DEV (hcxpfzsm) \x1b[0m`;

console.log(`
${cyan}╔════════════════════════════════════════════════════════════════════════════╗${reset}
${cyan}║${reset}  ${bold}🎓 ATENA SCHOOL CRM — PRODUCTION STANDALONE RUNNER${reset}        ${envBadge}
${cyan}╠════════════════════════════════════════════════════════════════════════════╣${reset}
${cyan}║${reset}  🏢 ${bold}Admin CRM (Browser):${reset}       ${magenta}http://localhost:3001${reset}                  ${cyan}║${reset}
${cyan}║${reset}  ⚙️  ${bold}Backend API (NestJS):${reset}      ${green}http://localhost:4000/v1${reset}               ${cyan}║${reset}
${cyan}║${reset}  📚 ${bold}Swagger Documentation:${reset}    ${yellow}http://localhost:4000/docs${reset}             ${cyan}║${reset}
${cyan}╚════════════════════════════════════════════════════════════════════════════╝${reset}
`);

// 1. Check if dist folders exist, if not alert user to run build
const backendDist = path.join(rootDir, "apps/backend/dist/main.js");
const adminDist = path.join(rootDir, "apps/admin/dist/index.html");

if (!fs.existsSync(backendDist) || !fs.existsSync(adminDist)) {
  console.log(`${yellow}⚠️  Скомпилированные файлы не найдены. Выполняется автоматическая сборка 'pnpm build'...${reset}\n`);
  try {
    require("child_process").execSync("pnpm build", { cwd: rootDir, stdio: "inherit" });
  } catch (err) {
    console.error("Ошибка при сборке проекта. Пожалуйста, выполните 'pnpm build' вручную.");
    process.exit(1);
  }
}

// 2. Start Backend process
const isWin = process.platform === "win32";
const backendProcess = spawn("node", ["dist/main.js"], {
  cwd: path.join(rootDir, "apps/backend"),
  stdio: "inherit",
  shell: isWin,
  env: { ...process.env, NODE_ENV: "production", FORCE_COLOR: "1" },
});

// 3. Start Admin production preview server
const npxCmd = isWin ? "npx.cmd" : "npx";
const adminProcess = spawn(npxCmd, ["vite", "preview", "--port", "3001", "--host"], {
  cwd: path.join(rootDir, "apps/admin"),
  stdio: "inherit",
  shell: isWin,
  env: { ...process.env, FORCE_COLOR: "1" },
});

const cleanup = () => {
  console.log("\nОстановка процессов CRM...");
  try { backendProcess.kill(); } catch {}
  try { adminProcess.kill(); } catch {}
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
