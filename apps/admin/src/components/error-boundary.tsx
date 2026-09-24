import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { diagnosticLogger } from "@/utils/diagnostic-logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    diagnosticLogger.logError("React ErrorBoundary Exception", error, {
      componentStack: errorInfo.componentStack,
    });
    console.error("[ErrorBoundary] Uncaught Exception:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  private handleCopyError = () => {
    const errorDetails = `Error: ${this.state.error?.message || "Unknown error"}\nStack: ${
      this.state.error?.stack || ""
    }\nComponent Stack: ${this.state.errorInfo?.componentStack || ""}`;
    navigator.clipboard.writeText(errorDetails);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background text-foreground">
          <div className="max-w-lg w-full p-6 sm:p-8 border rounded-2xl shadow-xl bg-card text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Si è verificato un errore imprevisto
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                L'applicazione ha riscontrato un problema durante il rendering di questa sezione.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Dettagli Errore</span>
                  <button
                    type="button"
                    onClick={this.handleCopyError}
                    className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500">Copiato</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copia Errore</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-rose-500/5 text-rose-600 dark:text-rose-400 p-3 rounded-xl max-h-40 overflow-y-auto border border-rose-500/20 whitespace-pre-wrap break-all select-all">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full cursor-pointer gap-2 text-xs font-bold"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              <Button
                onClick={this.handleReload}
                className="w-full cursor-pointer gap-2 text-xs font-bold bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ricarica</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
