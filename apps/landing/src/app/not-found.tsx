import Link from 'next/link';
import { Compass, GraduationCap, ArrowLeft, House } from '@phosphor-icons/react/dist/ssr';
import { brandConfig } from '@/config/brand.config';

export const metadata = {
  title: `Pagina non trovata | ${brandConfig.defaultName}`,
  description: 'La pagina richiesta non è disponibile. Torna alla home o scopri i nostri corsi.',
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Decorative Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-2 shadow-inner">
          <Compass className="w-10 h-10 text-secondary" weight="duotone" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-secondary">
            Errore 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
            Pagina non trovata
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
            La pagina che stai cercando non esiste, è stata rimossa o l'indirizzo inserito non è corretto.
          </p>
        </div>

        {/* Quick Action Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href="/corsi"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/15"
          >
            <GraduationCap className="w-4 h-4 text-secondary" weight="bold" />
            <span>Scopri tutti i corsi</span>
          </Link>

          <Link
            href="/test-inglese"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-primary text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span>Fai il Test di Inglese</span>
          </Link>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Torna alla Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
