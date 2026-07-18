"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, X, ArrowRight, ArrowLeft, ArrowClockwise, Sparkle, Trophy } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import confetti from "canvas-confetti";

interface Question {
  id: number;
  level: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    level: "A1",
    question: "She _____ a doctor at the local hospital.",
    options: ["are", "is", "am"],
    correctAnswer: "is"
  },
  {
    id: 2,
    level: "A2",
    question: "Yesterday, we _____ to the cinema to watch the new movie.",
    options: ["go", "have gone", "went"],
    correctAnswer: "went"
  },
  {
    id: 3,
    level: "A2",
    question: "I don't have _____ money left in my wallet.",
    options: ["some", "any", "no"],
    correctAnswer: "any"
  },
  {
    id: 4,
    level: "B1",
    question: "I _____ London three times this year.",
    options: ["visited", "have visited", "was visiting"],
    correctAnswer: "have visited"
  },
  {
    id: 5,
    level: "B1",
    question: "While I _____ my dinner, the power went out.",
    options: ["ate", "was eating", "have eaten"],
    correctAnswer: "was eating"
  },
  {
    id: 6,
    level: "B2",
    question: "If I _____ you, I would accept their offer immediately.",
    options: ["was", "am", "were"],
    correctAnswer: "were"
  },
  {
    id: 7,
    level: "B2",
    question: "She suggested _____ to the beach this weekend.",
    options: ["to go", "going", "go"],
    correctAnswer: "going"
  },
  {
    id: 8,
    level: "C1",
    question: "Hardly _____ entered the room when the alarm started ringing.",
    options: ["he had", "did he", "had he"],
    correctAnswer: "had he"
  },
  {
    id: 9,
    level: "C1",
    question: "I would rather you _____ tell anyone about our conversation.",
    options: ["don't", "didn't", "haven't"],
    correctAnswer: "didn't"
  },
  {
    id: 10,
    level: "C2",
    question: "We need to _____ the problem in the bud before it escalates.",
    options: ["cut", "stop", "nip"],
    correctAnswer: "nip"
  }
];

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "Ottimo tentativo! Con il giusto supporto, potrai presto iniziare a sostenere le tue prime conversazioni in inglese.",
  A2: "Hai una base elementare. Riesci a capire frasi ed espressioni di uso frequente. Lavoriamo insieme per renderle più fluide!",
  B1: "Sei a livello intermedio! Comprendi i punti chiave di argomenti familiari. Ti aiuteremo a fare il salto verso una maggiore scioltezza.",
  B2: "Ottimo livello intermedio-alto! Ti esprimi con discreta spontaneità. Perfetto per approfondire sfumature linguistiche complesse.",
  C1: "Livello avanzato! Comprendi testi complessi e ti esprimi in modo flessibile ed efficace. Possiamo aiutarti a perfezionare i dettagli da madrelingua!",
  C2: "Padronanza completa! Ti esprimi con naturalezza e precisione assoluta. Il nostro supporto può aiutarti a mantenere l'eccellenza o preparare certificazioni specifiche."
};

interface EnglishTestQuizProps {
  onRestart: () => void;
}

export default function EnglishTestQuiz({ onRestart }: EnglishTestQuizProps) {
  const t = useTranslations("englishTest");
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [completed, setCompleted] = useState(false);

  // Shuffle on initial mount inside client-only scope
  useEffect(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(null));
  }, []);

  // Trigger confetti on completion
  useEffect(() => {
    if (completed) {
      // Primary blast
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Side bursts
      const duration = 0.8 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.8 }
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.8 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [completed]);

  const handleOptionSelect = (option: string) => {
    const currentAnswer = answers[currentIndex];
    if (currentAnswer !== null) return; // Answer already locked

    const newAnswers = [...answers];
    newAnswers[currentIndex] = option;
    setAnswers(newAnswers);
  };

  // Helper to transition state using View Transitions API if supported
  const transitionToQuestion = (newIndex: number) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setCurrentIndex(newIndex);
      });
    } else {
      setCurrentIndex(newIndex);
    }
  };

  // Auto-advance logic
  useEffect(() => {
    if (shuffledQuestions.length === 0) return;
    const currentAnswer = answers[currentIndex];
    
    if (currentAnswer !== null) {
      const timer = setTimeout(() => {
        if (currentIndex < shuffledQuestions.length - 1) {
          transitionToQuestion(currentIndex + 1);
        } else {
          // Wrap screen completion in view transition too
          if (document.startViewTransition) {
            document.startViewTransition(() => {
              setCompleted(true);
            });
          } else {
            setCompleted(true);
          }
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [answers, currentIndex, shuffledQuestions.length]);

  const handleBack = () => {
    if (currentIndex > 0) {
      transitionToQuestion(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      transitionToQuestion(currentIndex + 1);
    } else if (answers.every((a) => a !== null)) {
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          setCompleted(true);
        });
      } else {
        setCompleted(true);
      }
    }
  };

  const correctAnswersCount = shuffledQuestions.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.correctAnswer ? 1 : 0),
    0
  );

  const getResultLevel = () => {
    if (correctAnswersCount <= 2) return t("level_A1");
    if (correctAnswersCount <= 4) return t("level_A2");
    if (correctAnswersCount <= 6) return t("level_B1");
    if (correctAnswersCount <= 8) return t("level_B2");
    if (correctAnswersCount === 9) return t("level_C1");
    return t("level_C2");
  };

  const getLevelCode = () => {
    if (correctAnswersCount <= 2) return "A1";
    if (correctAnswersCount <= 4) return "A2";
    if (correctAnswersCount <= 6) return "B1";
    if (correctAnswersCount <= 8) return "B2";
    if (correctAnswersCount === 9) return "C1";
    return "C2";
  };

  const getPercentage = () => {
    return Math.round((correctAnswersCount / (shuffledQuestions.length || 10)) * 100);
  };

  const formatQuestionText = (question: Question, selectedAns: string | null) => {
    const parts = question.question.split("_____");
    if (parts.length === 2) {
      return (
        <span className="leading-relaxed">
          {parts[0]}
          {selectedAns ? (
            <span
              className={`inline-block px-3 py-1 mx-1 rounded-xl border text-sm sm:text-base font-bold transition-all duration-300 transform scale-105 shadow-sm ${
                selectedAns === question.correctAnswer
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600"
                  : "bg-rose-500/10 border-rose-500 text-rose-600 line-through"
              }`}
            >
              {selectedAns}
            </span>
          ) : (
            <span className="inline-block w-16 border-b-2 border-dashed border-[#F8861D] mx-1 transform translate-y-0.5"></span>
          )}
          {parts[1]}
        </span>
      );
    }
    return question.question;
  };

  // Render a loading state until questions are shuffled client-side
  if (shuffledQuestions.length === 0 || answers.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl border border-slate-100/50 shadow-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-[#F8861D] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider animate-pulse">
          Caricamento del test...
        </p>
      </div>
    );
  }

  // Result screen
  if (completed) {
    const levelLabel = getResultLevel();
    const levelCode = getLevelCode();
    const pct = getPercentage();
    const customDesc = LEVEL_DESCRIPTIONS[levelCode] || "";

    return (
      <div className="w-full max-w-2xl mx-auto relative">
        {/* Ambient background glow for high-end feel */}
        <div className="glow-orb bg-[#043569] w-72 h-72 -top-12 -left-12 opacity-10 blur-3xl pointer-events-none absolute" />
        <div className="glow-orb bg-[#F8861D] w-72 h-72 -bottom-12 -right-12 opacity-10 blur-3xl pointer-events-none absolute" />

        <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100/50 shadow-[0_20px_50px_rgba(4,53,105,0.04)] p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500 relative z-10">
          
          <div className="mb-8">
            <span className="inline-block px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#F8861D] bg-orange-50 border border-orange-100 rounded-full mb-5 select-none">
              Test Completato
            </span>
            <span className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 select-none">
              {t("resultTitle")}
            </span>
            <div className="text-7xl sm:text-8xl font-serif font-black text-[#043569] leading-none mb-3 tracking-tight">
              {levelCode}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
              {levelLabel}
            </h2>
          </div>

          {/* Detailed metrics box */}
          <div className="max-w-md mx-auto grid grid-cols-2 gap-4 bg-slate-50/60 border border-slate-100/70 rounded-2xl p-4 sm:p-5 mb-8 select-none">
            <div className="text-center border-r border-slate-200/60">
              <span className="block text-[9px] uppercase font-black tracking-widest text-slate-400">
                Risposte Corrette
              </span>
              <span className="block text-xl sm:text-2xl font-black text-[#043569] mt-1.5">
                {correctAnswersCount} <span className="text-slate-400 text-sm font-medium">/ {shuffledQuestions.length}</span>
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[9px] uppercase font-black tracking-widest text-slate-400">
                Precisione
              </span>
              <span className="block text-xl sm:text-2xl font-black text-[#043569] mt-1.5">
                {pct}%
              </span>
            </div>
          </div>

          {/* Custom description with high-end typography */}
          <div className="max-w-md mx-auto mb-10">
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              {customDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/#contact"
              className="group inline-flex items-center justify-center gap-2 bg-[#F8861D] hover:bg-[#e0730d] text-white px-8 py-4 rounded-full font-black text-sm transition-all duration-300 shadow-md shadow-orange-500/10 hover:shadow-orange-500/25 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer w-full sm:w-auto"
            >
              {t("btnContact")}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" weight="bold" />
            </Link>
            <button
              onClick={onRestart}
              className="inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-6 py-4 rounded-full font-black text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer w-full sm:w-auto"
            >
              <ArrowClockwise size={16} weight="bold" />
              {t("btnRestart")}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-8 leading-normal max-w-md mx-auto select-none">
            {t("disclaimer")}
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isCurrentQuestionAnswered = currentAnswer !== null;
  const OPTION_LETTERS = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Background glow orbs for high-end look */}
      <div className="glow-orb bg-[#043569] w-72 h-72 -top-12 -left-12 opacity-8 blur-3xl pointer-events-none absolute" />
      <div className="glow-orb bg-[#F8861D] w-72 h-72 -bottom-12 -right-12 opacity-8 blur-3xl pointer-events-none absolute" />

      <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100/50 shadow-[0_20px_50px_rgba(4,53,105,0.05)] p-6 sm:p-10 relative z-10">
        
        {/* Premium Compact Header */}
        <div className="flex items-center gap-3 sm:gap-4 w-full mb-6 select-none">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={16} weight="bold" />
          </button>
          
          <div className="flex-grow flex gap-1.5 sm:gap-2 items-center">
            {shuffledQuestions.map((q, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const qAnswer = answers[idx];
              const isCorrect = qAnswer === q.correctAnswer;
              
              let barColor = "bg-slate-100 border-slate-200/50";
              if (isPast) {
                barColor = isCorrect 
                  ? "bg-emerald-50 border-emerald-500" 
                  : "bg-rose-500 border-rose-500";
              } else if (isCurrent) {
                barColor = "bg-[#F8861D] border-[#F8861D] scale-y-125 shadow-[0_0_8px_rgba(248,134,29,0.3)]";
              }
              
              // Only allow clicking to answered questions, or the active one
              const firstUnanswered = answers.findIndex((a) => a === null);
              const isClickable = idx <= firstUnanswered || firstUnanswered === -1;
              
              return (
                <button
                  key={idx}
                  disabled={!isClickable}
                  onClick={() => transitionToQuestion(idx)}
                  className={`h-1.5 flex-1 rounded-full border transition-all duration-300 ${barColor} ${
                    isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default"
                  }`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>
          
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 select-none">
            {currentIndex + 1} / {shuffledQuestions.length}
          </span>
        </div>

        {/* Content Question Card */}
        <div className="mb-6 sm:mb-8 text-left animate-in fade-in duration-300">
          <span className="inline-block px-2.5 py-1 text-[9px] font-black tracking-wider uppercase text-[#043569] bg-[#043569]/5 rounded-md border border-[#043569]/10 mb-3 select-none">
            {t("questionOf", { current: currentIndex + 1, total: shuffledQuestions.length })}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#043569] leading-snug my-2 min-h-[64px] flex items-center">
            {formatQuestionText(currentQuestion, currentAnswer)}
          </h2>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option, idx) => {
            const letter = OPTION_LETTERS[idx] || "";
            const isSelected = option === currentAnswer;
            const isCorrectAnswer = option === currentQuestion.correctAnswer;
            
            let optionStyles = "border-slate-200 hover:border-orange-300 hover:bg-orange-50/5 text-slate-700 bg-white";
            let letterBadgeStyles = "bg-slate-50 text-slate-600 border-slate-200";
            let icon: React.ReactNode = null;

            if (isCurrentQuestionAnswered) {
              if (isCorrectAnswer) {
                optionStyles = "border-emerald-500 bg-emerald-50/20 text-emerald-900 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.06)]";
                letterBadgeStyles = "bg-emerald-500 text-white border-emerald-500 shadow-sm";
                icon = <Check size={18} className="text-emerald-600 shrink-0 animate-in zoom-in-50 duration-300" weight="bold" />;
              } else if (isSelected) {
                optionStyles = "border-rose-500 bg-rose-50/20 text-rose-900 font-semibold shadow-[0_0_12px_rgba(244,63,94,0.06)]";
                letterBadgeStyles = "bg-rose-500 text-white border-rose-500 shadow-sm";
                icon = <X size={18} className="text-rose-600 shrink-0 animate-in zoom-in-50 duration-300" weight="bold" />;
              } else {
                optionStyles = "border-slate-100 opacity-40 text-slate-400 cursor-not-allowed bg-slate-50/30";
                letterBadgeStyles = "bg-slate-50 text-slate-300 border-slate-150";
              }
            }

            return (
              <button
                key={idx}
                disabled={isCurrentQuestionAnswered}
                onClick={() => handleOptionSelect(option)}
                className={`w-full flex items-center justify-between gap-4 border-2 rounded-2xl px-5 py-4 text-left text-sm sm:text-base transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 select-none ${optionStyles}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black transition-colors ${letterBadgeStyles}`}>
                    {letter}
                  </span>
                  <span className="font-semibold">{option}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Footer Navigation (Fixed Height to prevent layout shifts) */}
        <div className="mt-8 flex justify-between items-center h-14 border-t border-slate-100/60 pt-4">
          <div className="text-xs font-black uppercase tracking-wider select-none h-6 flex items-center">
            {isCurrentQuestionAnswered && (
              <p
                className={`animate-in fade-in duration-300 ${
                  currentAnswer === currentQuestion.correctAnswer ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {currentAnswer === currentQuestion.correctAnswer ? t("correct") : t("incorrect")}
              </p>
            )}
          </div>

          {isCurrentQuestionAnswered && (
            <button
              onClick={handleNext}
              className="group inline-flex items-center gap-2 bg-[#043569] hover:bg-[#032b55] text-white px-6 py-3 rounded-full font-black text-xs sm:text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer shadow-lg shadow-[#043569]/10"
            >
              {currentIndex === shuffledQuestions.length - 1 ? (
                <>
                  <span>Visualizza Risultato</span>
                  <Sparkle size={14} weight="fill" className="animate-pulse text-orange-400" />
                </>
              ) : (
                <>
                  <span>Avanti</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" weight="bold" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
