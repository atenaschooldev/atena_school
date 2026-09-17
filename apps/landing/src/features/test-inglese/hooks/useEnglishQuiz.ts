import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export interface Question {
  id: number;
  level: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export const QUESTIONS: Question[] = [
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

export const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "Ottimo tentativo! Con il giusto supporto, potrai presto iniziare a sostenere le tue prime conversazioni in inglese.",
  A2: "Hai una base elementare. Riesci a capire frasi ed espressioni di uso frequente. Lavoriamo insieme per renderle più fluide!",
  B1: "Sei a livello intermedio! Comprendi i punti chiave di argomenti familiari. Ti aiuteremo a fare il salto verso una maggiore scioltezza.",
  B2: "Ottimo livello intermedio-alto! Ti esprimi con discreta spontaneità. Perfetto per approfondire sfumature linguistiche complesse.",
  C1: "Livello avanzato! Comprendi testi complessi e ti esprimi in modo flessibile ed efficace. Possiamo aiutarti a perfezionare i dettagli da madrelingua!",
  C2: "Padronanza completa! Ti esprimi con naturalezza e precisione assoluta. Il nostro supporto può aiutarti a mantenere l'eccellenza o preparare certificazioni specifiche."
};

export function useEnglishQuiz() {
  const [shuffledQuestions] = useState<Question[]>(() => [...QUESTIONS].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(() => new Array(QUESTIONS.length).fill(null));
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

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

  const selectOption = (opt: string) => {
    const updated = [...answers];
    updated[currentIndex] = opt;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    let score = 0;
    shuffledQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });

    let estimatedLevel = "A1";
    if (score >= 9) estimatedLevel = "C2";
    else if (score >= 7) estimatedLevel = "C1";
    else if (score >= 5) estimatedLevel = "B2";
    else if (score >= 3) estimatedLevel = "B1";
    else if (score >= 2) estimatedLevel = "A2";

    return { score, total: shuffledQuestions.length, level: estimatedLevel };
  };

  return {
    shuffledQuestions,
    currentIndex,
    answers,
    completed,
    selectOption,
    handleNext,
    handlePrev,
    calculateResults,
  };
}
