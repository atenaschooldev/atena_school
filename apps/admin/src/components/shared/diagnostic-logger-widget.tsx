"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bug,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Globe,
  HardDrive,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Terminal,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  diagnosticLogger,
  type LogEntry,
  type NetworkLog,
  type FreezeLog,
} from "@/utils/diagnostic-logger";
import { toast } from "sonner";

export function DiagnosticLoggerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkLogs, setNetworkLogs] = useState<NetworkLog[]>([]);
  const [freezeLogs, setFreezeLogs] = useState<FreezeLog[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const updateState = () => {
      setFps(diagnosticLogger.getFps());
      setLogs(diagnosticLogger.getLogs());
      setNetworkLogs(diagnosticLogger.getNetworkLogs());
      setFreezeLogs(diagnosticLogger.getFreezeLogs());
    };

    updateState();
    const unsubscribe = diagnosticLogger.subscribe(updateState);
    const interval = setInterval(updateState, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Alt+D or Ctrl+Shift+D
      if ((e.altKey && e.key.toLowerCase() === "d") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const errorCount = logs.filter((l) => l.type === "error").length;
  const freezeCount = freezeLogs.length;
  const slowNetworkCount = networkLogs.length;

  const hasIssues = errorCount > 0 || freezeCount > 0;
  const isCritical = errorCount > 0;

  const handleCopyReport = () => {
    const report = diagnosticLogger.generateDiagnosticReport();
    navigator.clipboard.writeText(report);
    setCopied(true);
    toast.success("Report diagnostico copiato negli appunti!", {
      description: "Puoi incollarlo direttamente nella chat per l'assistente AI.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClear = () => {
    diagnosticLogger.clearAll();
    toast.info("Log diagnostici azzerati");
  };

  const getMemoryUsage = () => {
    if (typeof performance !== "undefined" && (performance as any).memory) {
      const mem = (performance as any).memory;
      return `${Math.round(mem.usedJSHeapSize / 1024 / 1024)} MB`;
    }
    return "N/D";
  };

  return (
    <>
      {/* ── 1. FLOATING DIAGNOSTIC PILL (Always accessible) ─────────────── */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 print:hidden select-none">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Apri Monitor Diagnostico & Crash Logger (Alt + D)"
          className={cn(
            "group flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border text-xs font-mono font-medium backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
            isCritical
              ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 animate-pulse"
              : hasIssues
              ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25"
              : "bg-background/80 border-border/80 text-muted-foreground hover:bg-background hover:text-foreground shadow-sm"
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              isCritical
                ? "bg-rose-500 ring-2 ring-rose-500/30"
                : fps < 45
                ? "bg-amber-500 ring-2 ring-amber-500/30"
                : "bg-emerald-500"
            )}
          />

          <span className="font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 opacity-70" />
            <span>{fps} FPS</span>
          </span>

          {errorCount > 0 && (
            <span className="flex items-center gap-1 bg-rose-500 text-white dark:text-rose-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              <Bug className="w-2.5 h-2.5" />
              {errorCount}
            </span>
          )}

          {freezeCount > 0 && errorCount === 0 && (
            <span className="flex items-center gap-1 bg-amber-500 text-white dark:text-amber-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              <Clock className="w-2.5 h-2.5" />
              {freezeCount}
            </span>
          )}

          <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity hidden sm:inline">
            Alt+D
          </span>
        </button>
      </div>

      {/* ── 2. DIAGNOSTIC DASHBOARD MODAL ──────────────────────────────── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full sm:max-w-4xl p-0 gap-0 border border-border/80 bg-card shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[85vh] max-h-[750px]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Terminal className="h-4.5 w-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold leading-tight flex items-center gap-2">
                  <span>Monitor Diagnostico & Crash Inspector</span>
                  <Badge variant="outline" className="text-[10px] font-mono px-2 py-0">
                    Live Telemetry
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  URL: {typeof window !== "undefined" ? window.location.pathname : ""} · Mem: {getMemoryUsage()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pulisci</span>
              </Button>

              <Button
                size="sm"
                onClick={handleCopyReport}
                className="h-8 text-xs font-bold gap-1.5 cursor-pointer bg-primary text-primary-foreground shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copia Report per AI</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-muted/10 border-b border-border/50 text-xs shrink-0">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60">
              <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Frame Rate</div>
                <div className="font-bold font-mono">{fps} FPS</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60">
              <Bug className={cn("w-4 h-4 shrink-0", errorCount > 0 ? "text-rose-500" : "text-muted-foreground")} />
              <div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Errori Catturati</div>
                <div className="font-bold font-mono text-rose-500">{errorCount}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60">
              <Clock className={cn("w-4 h-4 shrink-0", freezeCount > 0 ? "text-amber-500" : "text-muted-foreground")} />
              <div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Blocchi UI (&gt;180ms)</div>
                <div className="font-bold font-mono text-amber-500">{freezeCount}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60">
              <Globe className={cn("w-4 h-4 shrink-0", slowNetworkCount > 0 ? "text-blue-500" : "text-muted-foreground")} />
              <div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase">Rete Lenta / Errori</div>
                <div className="font-bold font-mono">{slowNetworkCount}</div>
              </div>
            </div>
          </div>

          {/* Body Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 border-b border-border/60 bg-muted/5 shrink-0">
              <TabsList className="h-9 bg-transparent p-0 gap-4">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-xs font-semibold px-1 py-2"
                >
                  Panoramica
                </TabsTrigger>
                <TabsTrigger
                  value="errors"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-xs font-semibold px-1 py-2 gap-1.5"
                >
                  <span>Errori</span>
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="h-4 px-1 text-[9px]">
                      {errorCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="freezes"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-xs font-semibold px-1 py-2 gap-1.5"
                >
                  <span>Blocchi UI</span>
                  {freezeCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-amber-500/20 text-amber-600">
                      {freezeCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="network"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-xs font-semibold px-1 py-2 gap-1.5"
                >
                  <span>Rete & API</span>
                  {slowNetworkCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                      {slowNetworkCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-xs font-semibold px-1 py-2"
                >
                  Log Console
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB: OVERVIEW */}
            <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 space-y-4 m-0">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">Come usare questo strumento</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Quando noti un blocco dell'interfaccia, un caricamento infinito o un errore, clicca su{" "}
                    <strong>"Copia Report per AI"</strong> in alto a destra e incolla il testo direttamente nella chat dell'assistente.
                    Il report contiene lo stack trace completo, le richieste di rete e la durata dei blocchi.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Attività Recente
                </h4>
                {logs.length === 0 && freezeLogs.length === 0 && networkLogs.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    Nessun evento anomalo registrato. Il sistema sta funzionando regolarmente.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className={cn(
                          "p-3 rounded-xl border text-xs space-y-1",
                          log.type === "error"
                            ? "bg-rose-500/5 border-rose-500/20 text-rose-950 dark:text-rose-100"
                            : log.type === "warn"
                            ? "bg-amber-500/5 border-amber-500/20 text-amber-950 dark:text-amber-100"
                            : "bg-card border-border/60"
                        )}
                      >
                        <div className="flex items-center justify-between font-mono text-[11px] opacity-70">
                          <span className="font-bold uppercase">[{log.type}] {log.timestamp}</span>
                          <span>{log.id}</span>
                        </div>
                        <div className="font-bold">{log.title}</div>
                        <div className="text-muted-foreground font-mono text-[11px] break-all">
                          {log.message.slice(0, 300)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB: ERRORS */}
            <TabsContent value="errors" className="flex-1 overflow-y-auto p-6 space-y-3 m-0">
              {logs.filter((l) => l.type === "error").length === 0 ? (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  Nessun errore runtime o eccezione non gestita.
                </div>
              ) : (
                logs
                  .filter((l) => l.type === "error")
                  .map((err) => (
                    <div
                      key={err.id}
                      className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-rose-600 dark:text-rose-400">
                        <span className="font-bold">[{err.timestamp}] {err.title}</span>
                      </div>
                      <div className="font-semibold text-foreground break-all">{err.message}</div>
                      {err.stack && (
                        <pre className="p-3 rounded-lg bg-black/40 text-rose-300 font-mono text-[10px] overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                          {err.stack}
                        </pre>
                      )}
                    </div>
                  ))
              )}
            </TabsContent>

            {/* TAB: FREEZES */}
            <TabsContent value="freezes" className="flex-1 overflow-y-auto p-6 space-y-3 m-0">
              {freezeLogs.length === 0 ? (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  Nessun blocco del thread principale rilevato.
                </div>
              ) : (
                freezeLogs.map((frz) => (
                  <div
                    key={frz.id}
                    className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-mono text-[11px] text-amber-600 font-bold">
                        [{frz.timestamp}] Blocco Thread Principale
                      </div>
                      <div className="text-foreground">
                        Durata stallo: <strong className="font-mono text-amber-600">{frz.durationMs} ms</strong>
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">Percorso: {frz.route}</div>
                    </div>
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 font-mono">
                      Lag Spike
                    </Badge>
                  </div>
                ))
              )}
            </TabsContent>

            {/* TAB: NETWORK */}
            <TabsContent value="network" className="flex-1 overflow-y-auto p-6 space-y-3 m-0">
              {networkLogs.length === 0 ? (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  Nessuna richiesta API lenta o con errori registrata.
                </div>
              ) : (
                networkLogs.map((net) => (
                  <div
                    key={net.id}
                    className={cn(
                      "p-3 rounded-xl border text-xs flex items-center justify-between font-mono",
                      net.isError ? "border-rose-500/30 bg-rose-500/5" : "border-amber-500/30 bg-amber-500/5"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={net.isError ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {net.method}
                        </Badge>
                        <span className="font-bold text-foreground truncate max-w-md">{net.url}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Status: <span className="font-bold">{net.status || "FAIL"}</span> · Durata: {net.durationMs}ms
                        {net.errorText && <span className="text-rose-500 ml-2">({net.errorText})</span>}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground shrink-0">{net.timestamp}</div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* TAB: LOGS */}
            <TabsContent value="logs" className="flex-1 overflow-y-auto p-6 space-y-2 m-0">
              {logs.length === 0 ? (
                <div className="text-center py-16 text-xs text-muted-foreground">
                  Nessun log recente.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg border border-border/60 bg-card font-mono text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-bold uppercase">[{log.type}] {log.timestamp}</span>
                      <span>{log.title}</span>
                    </div>
                    <div className="text-foreground whitespace-pre-wrap break-all">{log.message}</div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between shrink-0 text-xs text-muted-foreground font-mono">
            <span>Scorciatoia: Alt + D per aprire/chiudere</span>
            <Button
              size="sm"
              onClick={handleCopyReport}
              className="h-8 font-bold gap-1.5 cursor-pointer bg-primary text-primary-foreground"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copia Report Completo</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
