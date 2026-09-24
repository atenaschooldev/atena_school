/**
 * Admin Diagnostic & Freeze Logger
 * 
 * Captures:
 * 1. Runtime Errors & Unhandled Promise Rejections
 * 2. Main-Thread Freezes / Long Tasks (>180ms stall)
 * 3. Slow or Failed Network Requests
 * 4. Console Errors & Warnings
 * 5. Instant 1-click Markdown Report generator for AI assistance
 */

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "error" | "warn" | "freeze" | "network" | "info";
  title: string;
  message: string;
  stack?: string;
  details?: Record<string, any>;
}

export interface NetworkLog {
  id: string;
  timestamp: string;
  url: string;
  method: string;
  status?: number;
  durationMs: number;
  isError: boolean;
  errorText?: string;
}

export interface FreezeLog {
  id: string;
  timestamp: string;
  durationMs: number;
  route: string;
}

class DiagnosticLogger {
  private logs: LogEntry[] = [];
  private networkLogs: NetworkLog[] = [];
  private freezeLogs: FreezeLog[] = [];
  private subscribers: Set<() => void> = new Set();
  private maxLogs = 50;
  private isInitialized = false;
  private currentFps = 60;
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private lastFpsCalcTime = performance.now();
  private notifyScheduled = false;
  private isLogging = false;

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;

    this.setupGlobalErrorHandlers();
    this.setupConsoleInterceptors();
    this.setupFreezeDetector();
    this.setupNetworkInterceptor();
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    if (this.notifyScheduled) return;
    this.notifyScheduled = true;
    // Asynchronously dispatch notification in macro-task to prevent React reentrancy / Maximum update depth
    setTimeout(() => {
      this.notifyScheduled = false;
      this.subscribers.forEach((cb) => {
        try {
          cb();
        } catch {
          // ignore subscriber errors
        }
      });
    }, 250);
  }

  private getTimestamp(): string {
    return new Date().toLocaleTimeString("it-IT", { hour12: false }) + "." + String(new Date().getMilliseconds()).padStart(3, "0");
  }

  public getFps(): number {
    return this.currentFps;
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getNetworkLogs(): NetworkLog[] {
    return [...this.networkLogs];
  }

  public getFreezeLogs(): FreezeLog[] {
    return [...this.freezeLogs];
  }

  public clearAll() {
    this.logs = [];
    this.networkLogs = [];
    this.freezeLogs = [];
    this.notify();
  }

  public logError(title: string, errorOrMessage: unknown, extra?: Record<string, any>) {
    if (this.isLogging) return;
    this.isLogging = true;

    try {
      let message = "";
      let stack = "";

      if (errorOrMessage instanceof Error) {
        message = errorOrMessage.message;
        stack = errorOrMessage.stack || "";
      } else if (typeof errorOrMessage === "string") {
        message = errorOrMessage;
      } else {
        try {
          message = JSON.stringify(errorOrMessage);
        } catch {
          message = String(errorOrMessage);
        }
      }

      // Ignore recursive react loop warnings caused by devtools
      if (message.includes("Maximum update depth") && this.logs.some(l => l.message.includes("Maximum update depth"))) {
        return;
      }

      const entry: LogEntry = {
        id: "err_" + Math.random().toString(36).substring(2, 9),
        timestamp: this.getTimestamp(),
        type: "error",
        title,
        message,
        stack,
        details: extra,
      };

      this.logs.unshift(entry);
      if (this.logs.length > this.maxLogs) this.logs.pop();
      this.notify();
    } finally {
      this.isLogging = false;
    }
  }

  public logWarning(title: string, message: string, extra?: Record<string, any>) {
    if (this.isLogging) return;
    this.isLogging = true;

    try {
      const entry: LogEntry = {
        id: "warn_" + Math.random().toString(36).substring(2, 9),
        timestamp: this.getTimestamp(),
        type: "warn",
        title,
        message,
        details: extra,
      };

      this.logs.unshift(entry);
      if (this.logs.length > this.maxLogs) this.logs.pop();
      this.notify();
    } finally {
      this.isLogging = false;
    }
  }

  private setupGlobalErrorHandlers() {
    window.addEventListener("error", (event) => {
      this.logError("Unhandled Window Error", event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.logError("Unhandled Promise Rejection", event.reason || "Promise rejected without reason");
    });
  }

  private setupConsoleInterceptors() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      try {
        if (!this.isLogging) {
          const firstArg = args[0];
          const title = typeof firstArg === "string" ? firstArg : "Console Error";
          const message = args.map((a) => (typeof a === "object" ? (a instanceof Error ? a.message : JSON.stringify(a)) : String(a))).join(" ");
          if (!message.includes("Maximum update depth") || !this.logs.some(l => l.message.includes("Maximum update depth"))) {
            this.logError("Console.error: " + title.slice(0, 40), message);
          }
        }
      } catch {
        // fallback
      }
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      try {
        if (!this.isLogging) {
          const firstArg = args[0];
          const title = typeof firstArg === "string" ? firstArg : "Console Warning";
          const message = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
          // Ignore noise from React DevTools or benign warnings
          if (!message.includes("Vite") && !message.includes("React DevTools")) {
            this.logWarning(title.slice(0, 40), message);
          }
        }
      } catch {
        // fallback
      }
      originalWarn.apply(console, args);
    };
  }

  private setupFreezeDetector() {
    let lastTime = performance.now();

    // 1. requestAnimationFrame Heartbeat: checks if main thread stalled > 180ms
    const checkHeartbeat = () => {
      const now = performance.now();
      const delta = now - lastTime;

      // Calculate FPS
      this.frameCount++;
      if (now - this.lastFpsCalcTime >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsCalcTime));
        this.frameCount = 0;
        this.lastFpsCalcTime = now;
      }

      // If delta is larger than 180ms (taking frame budget of ~16ms into account), a freeze occurred
      if (delta > 180) {
        const freezeDuration = Math.round(delta);
        const freezeEntry: FreezeLog = {
          id: "frz_" + Math.random().toString(36).substring(2, 9),
          timestamp: this.getTimestamp(),
          durationMs: freezeDuration,
          route: window.location.pathname + window.location.search,
        };

        this.freezeLogs.unshift(freezeEntry);
        if (this.freezeLogs.length > 20) this.freezeLogs.pop();

        this.logWarning(
          `UI Freeze Rilevato (${freezeDuration}ms)`,
          `Il thread principale del browser si è bloccato per ${freezeDuration}ms sulla pagina ${freezeEntry.route}`,
          { durationMs: freezeDuration, route: freezeEntry.route }
        );
      }

      lastTime = now;
      requestAnimationFrame(checkHeartbeat);
    };

    requestAnimationFrame(checkHeartbeat);

    // 2. PerformanceObserver for browser Long Tasks if supported
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 150) {
              const dur = Math.round(entry.duration);
              this.logWarning(
                `Long Task (${dur}ms)`,
                `Esecuzione sincrona bloccante di ${dur}ms rilevata dal browser.`,
                { duration: dur, startTime: Math.round(entry.startTime) }
              );
            }
          }
        });
        observer.observe({ entryTypes: ["longtask"] });
      } catch {
        // Not supported or permission denied in this browser
      }
    }
  }

  private setupNetworkInterceptor() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "unknown";
      const method = (args[1]?.method || "GET").toUpperCase();

      try {
        const response = await originalFetch.apply(window, args);
        const durationMs = Math.round(performance.now() - startTime);

        const isError = !response.ok;
        if (isError || durationMs > 1500) {
          const networkLog: NetworkLog = {
            id: "net_" + Math.random().toString(36).substring(2, 9),
            timestamp: this.getTimestamp(),
            url,
            method,
            status: response.status,
            durationMs,
            isError,
          };
          this.networkLogs.unshift(networkLog);
          if (this.networkLogs.length > 20) this.networkLogs.pop();

          if (isError) {
            this.logError(
              `API Error ${response.status} (${method} ${url.split("?")[0]})`,
              `Richiesta fallita con codice ${response.status} (${durationMs}ms)`,
              { url, method, status: response.status, durationMs }
            );
          } else if (durationMs > 1500) {
            this.logWarning(
              `Richiesta Lenta (${durationMs}ms)`,
              `${method} ${url} ha impiegato ${durationMs}ms`,
              { url, durationMs }
            );
          }
        }

        return response;
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - startTime);
        const networkLog: NetworkLog = {
          id: "net_" + Math.random().toString(36).substring(2, 9),
          timestamp: this.getTimestamp(),
          url,
          method,
          durationMs,
          isError: true,
          errorText: err.message || "Network request failed",
        };
        this.networkLogs.unshift(networkLog);
        if (this.networkLogs.length > 20) this.networkLogs.pop();

        this.logError(
          `Network Failure (${method} ${url})`,
          err.message || "Errore di connessione / Timeout",
          { url, method, durationMs }
        );
        throw err;
      }
    };
  }

  public generateDiagnosticReport(): string {
    const memory = (performance as any).memory;
    const memInfo = memory
      ? `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`
      : "Non disponibile (Non-Chromium)";

    let report = `# 🛠️ ATENA ADMIN DIAGNOSTIC REPORT\n\n`;
    report += `**Generato il:** ${new Date().toISOString()} (${new Date().toLocaleString("it-IT")})\n`;
    report += `**URL Corrente:** \`${window.location.href}\`\n`;
    report += `**FPS Attuali:** ${this.currentFps} FPS\n`;
    report += `**Memoria JS Heap:** ${memInfo}\n`;
    report += `**User Agent:** \`${navigator.userAgent}\`\n\n`;

    report += `## ⚠️ Errori Rilevati (${this.logs.filter((l) => l.type === "error").length})\n`;
    const errors = this.logs.filter((l) => l.type === "error");
    if (errors.length === 0) {
      report += `_Nessun errore critico catturato._\n\n`;
    } else {
      errors.forEach((err, i) => {
        report += `### ${i + 1}. [${err.timestamp}] ${err.title}\n`;
        report += `**Messaggio:** \`${err.message}\`\n`;
        if (err.stack) {
          report += `\`\`\`text\n${err.stack.slice(0, 1000)}\n\`\`\`\n`;
        }
        if (err.details) {
          report += `**Dettagli:** \`${JSON.stringify(err.details)}\`\n`;
        }
        report += `\n`;
      });
    }

    report += `## ⏱️ Blocchi UI / Freeze Thread (${this.freezeLogs.length})\n`;
    if (this.freezeLogs.length === 0) {
      report += `_Nessun blocco del thread rilevato (>180ms)._\n\n`;
    } else {
      this.freezeLogs.forEach((frz) => {
        report += `- **[${frz.timestamp}]** Blocco di **${frz.durationMs}ms** su percorso \`${frz.route}\`\n`;
      });
      report += `\n`;
    }

    report += `## 🌐 Richieste di Rete Lente o Fallite (${this.networkLogs.length})\n`;
    if (this.networkLogs.length === 0) {
      report += `_Tutte le richieste di rete sono state veloci e hanno avuto esito positivo._\n\n`;
    } else {
      this.networkLogs.forEach((net) => {
        report += `- **[${net.timestamp}]** \`${net.method}\` \`${net.url}\` → **${net.status || "FAIL"}** (${net.durationMs}ms)${
          net.errorText ? ` [${net.errorText}]` : ""
        }\n`;
      });
      report += `\n`;
    }

    report += `## 📜 Ultimi Log & Avvisi di Sistema\n`;
    const warnings = this.logs.filter((l) => l.type !== "error").slice(0, 15);
    if (warnings.length === 0) {
      report += `_Nessun avviso recente._\n\n`;
    } else {
      warnings.forEach((w) => {
        report += `- **[${w.timestamp}] [${w.type.toUpperCase()}]** ${w.title}: ${w.message.slice(0, 200)}\n`;
      });
      report += `\n`;
    }

    return report;
  }
}

export const diagnosticLogger = new DiagnosticLogger();

// Automatically initialize in browser
if (typeof window !== "undefined") {
  diagnosticLogger.init();
}
