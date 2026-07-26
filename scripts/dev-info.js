const { spawn } = require("child_process");

function printBanner() {
  console.log(`
================================================================
  🎓 ATENA SCHOOL ECOSYSTEM - LOCAL ENVIRONMENT READY
================================================================
  🌐 Лендинг (Landing):        http://localhost:3000
  🏢 CRM Панель (Admin):       http://localhost:3001
  👤 Личный Кабинет (App):    http://localhost:3002
  ⚙️  REST API (Backend):      http://localhost:4000
  📚 Swagger документация:    http://localhost:4000/docs
================================================================
`);
}

// Print initial banner
printBanner();

// Launch Turbo Dev
const turboProcess = spawn(
  "npx",
  ["turbo", "dev", "--filter=landing", "--filter=admin", "--filter=app", "--filter=backend"],
  { stdio: "inherit", shell: true }
);

// Re-print banner after initial compilation finishes (5s & 10s)
setTimeout(printBanner, 5000);
setTimeout(printBanner, 10000);

process.on("SIGINT", () => {
  turboProcess.kill("SIGINT");
  process.exit(0);
});
