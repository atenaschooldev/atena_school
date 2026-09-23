import * as React from "react";
import { useTranslation } from "@/i18n/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Globe, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function LanguageSwitcher() {
  const { locale, setLocale, languages } = useTranslation();

  const currentLang = languages.find((l) => l.code === locale) || languages[0] || {
    code: "en",
    label: "English",
    flag: "🇬🇧",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2.5 gap-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-border/50 hover:bg-accent"
        >
          <span className="text-sm">{currentLang.flag}</span>
          <span className="uppercase font-bold tracking-wider">{currentLang.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className="flex items-center justify-between cursor-pointer text-xs font-medium py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.isCustom && (
                <span className="text-[10px] bg-primary/10 text-primary px-1 rounded font-semibold">
                  AI
                </span>
              )}
            </div>
            {locale === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/settings/localization"
            className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground py-2 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Gestisci lingue & AI...</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
