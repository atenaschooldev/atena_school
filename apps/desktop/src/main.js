const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow = null;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Atena School CRM",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allows local assets in development
    },
  });

  const devUrl = process.env.ELECTRON_START_URL || "http://localhost:3001";
  const distPath = path.join(__dirname, "../../admin/dist/index.html");

  if (isDev && !process.env.TEST_PROD) {
    mainWindow.loadURL(devUrl).catch(() => {
      console.log(`[Electron] Dev server at ${devUrl} not ready. Retrying...`);
      setTimeout(() => {
        if (mainWindow) mainWindow.loadURL(devUrl);
      }, 2000);
    });
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL(devUrl);
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Custom Native Application Menu
function createMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about", label: "Informazioni su Atena School CRM" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide", label: "Nascondi Atena CRM" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit", label: "Esci" },
            ],
          },
        ]
      : []),
    {
      label: "Modifica",
      submenu: [
        { role: "undo", label: "Annulla" },
        { role: "redo", label: "Ripristina" },
        { type: "separator" },
        { role: "cut", label: "Taglia" },
        { role: "copy", label: "Copia" },
        { role: "paste", label: "Incolla" },
        { role: "selectAll", label: "Seleziona tutto" },
      ],
    },
    {
      label: "Visualizza",
      submenu: [
        { role: "reload", label: "Ricarica" },
        { role: "forceReload", label: "Ricarica forzata" },
        { role: "toggleDevTools", label: "Strumenti per sviluppatori" },
        { type: "separator" },
        { role: "resetZoom", label: "Reimposta zoom" },
        { role: "zoomIn", label: "Ingrandisci" },
        { role: "zoomOut", label: "Riduci" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Schermo intero" },
      ],
    },
    {
      label: "Finestra",
      submenu: [
        { role: "minimize", label: "Riduci a icona" },
        { role: "zoom", label: "Ridimensiona" },
        ...(isMac
          ? [{ type: "separator" }, { role: "front", label: "Porta tutto in primo piano" }]
          : [{ role: "close", label: "Chiudi" }]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
