const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const envType = process.argv[2] === "dev" ? "dev" : "prod";
const isProd = envType === "prod";

// Colors
const cyan = "\x1b[36m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const magenta = "\x1b[35m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

// Switch environment files
const apps = ["backend", "landing", "app", "admin"];
apps.forEach((app) => {
  const src = path.join(__dirname, `../apps/${app}/.env.${envType}`);
  const dest = path.join(__dirname, `../apps/${app}/.env`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

const envBadge = isProd
  ? `\x1b[41m\x1b[37m\x1b[1m 🟢 PRODUCTION DATABASE (jnfbfihz) \x1b[0m`
  : `\x1b[43m\x1b[30m\x1b[1m 🟡 DEV DATABASE (hcxpfzsm) \x1b[0m`;

function printDashboard() {
  console.log(`
${cyan}╔════════════════════════════════════════════════════════════════════════════╗${reset}
${cyan}║${reset}  ${bold}🎓 ATENA SCHOOL ECOSYSTEM — LOCAL DEVELOPMENT${reset}     ${envBadge}
${cyan}╠════════════════════════════════════════════════════════════════════════════╣${reset}
${cyan}║${reset}  🌐 ${bold}Landing Page & Checkout:${reset}   ${blue}http://localhost:3000${reset}                  ${cyan}║${reset}
${cyan}║${reset}  🏢 ${bold}Admin CRM (Секретарь):${reset}     ${magenta}http://localhost:3001${reset}                  ${cyan}║${reset}
${cyan}║${reset}  🎓 ${bold}Student Portal (ЛК):${reset}       ${yellow}http://localhost:3002${reset}                  ${cyan}║${reset}
${cyan}║${reset}  ⚙️  ${bold}Backend API (NestJS):${reset}      ${green}http://localhost:4000/v1${reset}               ${cyan}║${reset}
${cyan}║${reset}  📚 ${bold}Swagger Hub (Docs):${reset}        ${blue}http://localhost:4000/docs${reset}             ${cyan}║${reset}
${cyan}║${reset}  📖 ${bold}Data Dictionary:${reset}           ${blue}http://localhost:4000/docs/dictionary${reset}  ${cyan}║${reset}
${cyan}╚════════════════════════════════════════════════════════════════════════════╝${reset}
`);
}

printDashboard();

// Start turbo dev for all 4 apps
const child = spawn(
  "npx",
  ["turbo", "dev", "--filter=backend", "--filter=admin", "--filter=landing", "--filter=app"],
  {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  }
);

// Graceful cleanup
const cleanExit = () => {
  if (child && !child.killed) {
    child.kill("SIGTERM");
  }
  process.exit(0);
};

process.on("SIGINT", cleanExit);
process.on("SIGTERM", cleanExit);
child.on("exit", (code) => {
  process.exit(code || 0);
});
