"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, X, ArrowRight, ArrowClockwise } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";

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

interface EnglishTestQuizProps {
  onRestart: () => void;
}

export default function EnglishTestQuiz({ onRestart }: EnglishTestQuizProps) {
  const t = useTranslations("englishTest");
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Shuffle on initial mount inside client-only scope
  useEffect(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQuestion = shuffledQuestions[currentIndex];
    if (option === currentQuestion.correctAnswer) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  // Auto-advance with transition delay
  useEffect(() => {
    if (isAnswered && shuffledQuestions.length > 0) {
      const timer = setTimeout(() => {
        if (currentIndex < shuffledQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOption(null);
          setIsAnswered(false);
        } else {
          setCompleted(true);
        }
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [isAnswered, currentIndex, shuffledQuestions.length]);

  const getResultLevel = () => {
    if (correctAnswersCount <= 2) {
      return t("level_A1");
    } else if (correctAnswersCount <= 4) {
      return t("level_A2");
    } else if (correctAnswersCount <= 6) {
      return t("level_B1");
    } else if (correctAnswersCount <= 8) {
      return t("level_B2");
    } else if (correctAnswersCount === 9) {
      return t("level_C1");
    } else {
      return t("level_C2");
    }
  };

  const getPercentage = () => {
    return Math.round((correctAnswersCount / (shuffledQuestions.length || 10)) * 100);
  };

  // Render a loading state until questions are shuffled client-side
  if (shuffledQuestions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-xl p-8 sm:p-12 text-center">
        <div className="w-8 h-8 border-4 border-[#F8861D] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Result screen
  if (completed) {
    const levelLabel = getResultLevel();
    const pct = getPercentage();

    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-xl p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
          <Check size={32} weight="bold" />
        </div>
        <p className="text-xs font-black text-[#F8861D] uppercase tracking-widest mb-2">
          {t("resultTitle")}
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#043569] leading-tight mb-3">
          {levelLabel}
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm mb-8">
          {t("levelDescription", { correctCount: correctAnswersCount, total: shuffledQuestions.length })} ({pct}%)
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/#contact"
            className="group inline-flex items-center justify-center gap-2 bg-[#043569] hover:bg-[#032b55] text-white px-6 py-3.5 rounded-full font-black text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
          >
            {t("btnContact")}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" weight="bold" />
          </Link>
          <button
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 px-6 py-3.5 rounded-full font-black text-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
          >
            <ArrowClockwise size={16} weight="bold" />
            {t("btnRestart")}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentIndex];
  const progressPercent = ((currentIndex + 1) / shuffledQuestions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-gray-150 shadow-xl p-6 sm:p-10 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {t("questionOf", { current: currentIndex + 1, total: shuffledQuestions.length })}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#F8861D] transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug mb-6">
        {currentQuestion.question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option, idx) => {
          let optionStyles = "border-gray-200 hover:border-[#F8861D]/50 hover:bg-[#F8861D]/5 text-gray-700";
          let icon = null;

          if (isAnswered) {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isSelected = option === selectedOption;

            if (isCorrect) {
              optionStyles = "border-emerald-500 bg-emerald-500/10 text-emerald-800";
              icon = <Check size={16} className="text-emerald-600 shrink-0" weight="bold" />;
            } else if (isSelected) {
              optionStyles = "border-rose-500 bg-rose-500/10 text-rose-800";
              icon = <X size={16} className="text-rose-600 shrink-0" weight="bold" />;
            } else {
              optionStyles = "border-gray-100 opacity-60 text-gray-400 cursor-not-allowed";
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleOptionSelect(option)}
              className={`w-full flex items-center justify-between gap-4 border-2 rounded-2xl px-5 py-4 text-left font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${optionStyles}`}
            >
              <span>{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Instant Feedback Text */}
      <div className="h-6 mt-6 text-center">
        {isAnswered && (
          <p
            className={`text-xs font-black uppercase tracking-wider animate-in fade-in duration-300 ${
              selectedOption === currentQuestion.correctAnswer ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {selectedOption === currentQuestion.correctAnswer
              ? t("correct")
              : t("incorrect")}
          </p>
        )}
      </div>
    </div>
  );
}
