import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // no-op, just ensure client boundary
  }, []);
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
