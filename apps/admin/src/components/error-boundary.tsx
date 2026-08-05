import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error Boundary Exception:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md w-full p-6 border rounded-xl shadow-lg bg-card text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Si è verificato un errore di sistema</h2>
              <p className="text-xs text-muted-foreground">
                Impossibile aggiornare l&apos;interfaccia (spesso causato da estensioni di traduzione automatica).
              </p>
            </div>
            {this.state.error && (
              <pre className="text-[11px] font-mono bg-muted p-2 rounded max-h-24 overflow-y-auto text-rose-600 text-left border">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReload} className="w-full cursor-pointer gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Ricarica Pagina</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
