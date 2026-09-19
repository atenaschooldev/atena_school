"use client";

import React, { useState } from "react";
import { X, Envelope, Lock, SignIn, Sparkle, ArrowRight, Spinner, CheckCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  courseId: string;
}

export function CheckoutAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: CheckoutAuthModalProps) {
  const [tab, setTab] = useState<"magic" | "password">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  if (!isOpen) return null;

  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Inserisci email e password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        toast.error(error.message || "Credenziali non valide");
        return;
      }

      if (data.user) {
        toast.success("Accesso effettuato con successo!");
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore durante l'accesso";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Inserisci un'email valida");
      return;
    }

    setLoading(true);
    try {
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${currentOrigin}/autenticazione/callback`,
        },
      });

      if (error) {
        toast.error(error.message || "Impossibile inviare il Magic Link");
        return;
      }

      setMagicLinkSent(true);
      toast.success("Ti abbiamo inviato un link di accesso via email!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore durante l'invio";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#043569] p-5 text-white flex items-center justify-between relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkle className="w-4 h-4 text-[#F8861D]" weight="fill" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">
                Atena School
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight">Accesso Studente / Genitore</h3>
            <p className="text-xs text-white/70 font-medium">
              Accedi per compilare automaticamente tutti i tuoi dati
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTab("password");
              setMagicLinkSent(false);
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              tab === "password"
                ? "bg-white text-[#043569] shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Email e Password
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("magic");
              setMagicLinkSent(false);
            }}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              tab === "magic"
                ? "bg-white text-[#043569] shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Magic Link Rapido
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {tab === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Indirizzo Email
                </label>
                <div className="relative">
                  <Envelope className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mariorossi@example.it"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#043569] focus:ring-2 focus:ring-[#043569]/10 outline-none transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#043569] focus:ring-2 focus:ring-[#043569]/10 outline-none transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#043569] hover:bg-[#032850] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  <>
                    <SignIn className="w-4 h-4" />
                    Accedi e Compila Dati
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {magicLinkSent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" weight="fill" />
                  <h4 className="text-xs font-black text-emerald-900">Email inviata!</h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Controlla la tua casella <strong>{email}</strong> e clicca sul link di accesso per entrare senza password.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Indirizzo Email Registrato
                    </label>
                    <div className="relative">
                      <Envelope className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mariorossi@example.it"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#043569] focus:ring-2 focus:ring-[#043569]/10 outline-none transition-all font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight">
                    Ti invieremo un link magico via email per accedere istantaneamente con un solo clic senza bisogno di password.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-[#F8861D] hover:bg-[#e07516] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Spinner className="w-4 h-4 animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        Invia Link di Accesso
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
