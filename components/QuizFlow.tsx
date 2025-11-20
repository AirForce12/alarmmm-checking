import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from '../constants';
import { Answer } from '../types';
import { ArrowLeft, Check, X, HelpCircle, MapPin, ArrowRight } from 'lucide-react';

interface QuizFlowProps {
  onComplete: (answers: Answer[]) => void;
  initialAnswers?: Answer[];
}

export const QuizFlow: React.FC<QuizFlowProps> = ({ onComplete, initialAnswers = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [isLocked, setIsLocked] = useState(false);
  
  // PLZ State
  const [showPlzInput, setShowPlzInput] = useState(false);
  const [plz, setPlz] = useState('');
  const [plzError, setPlzError] = useState('');
  const plzInputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = ((currentIndex + (showPlzInput ? 1 : 0)) / (totalQuestions + 1)) * 100;

  const handleAnswer = (value: boolean | null) => {
    if (isLocked) return;
    setIsLocked(true);

    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
    const answerObj: Answer = { questionId: currentQuestion.id, value };
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = answerObj;
    } else {
      newAnswers.push(answerObj);
    }
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsLocked(false);
      } else {
        // Instead of completing immediately, show PLZ input
        setIsLocked(false);
        setShowPlzInput(true);
      }
    }, 250);
  };

  const handleBack = () => {
    if (showPlzInput) {
      setShowPlzInput(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handlePlzSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(plz)) {
      setPlzError('Bitte geben Sie eine gültige 5-stellige PLZ ein.');
      return;
    }
    const finalAnswers = [...answers, { questionId: 'plz_input', value: true, extra: plz } as any]; 
    onComplete(finalAnswers); 
  };

  useEffect(() => {
    if (showPlzInput && plzInputRef.current) {
      plzInputRef.current.focus();
    }
  }, [showPlzInput]);

  // Special Render for PLZ Step
  if (showPlzInput) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-12 flex flex-col min-h-[70vh]">
         <div className="mb-8 md:mb-12">
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">
              <span>Letzter Schritt</span>
              <span>Standort-Analyse</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-brand-red w-full" />
            </div>
         </div>

         <div className="flex-grow flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
               <MapPin className="w-8 h-8 md:w-10 md:h-10 text-brand-red" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Regionale Risiko-Auswertung
            </h2>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md leading-relaxed">
              Geben Sie Ihre Postleitzahl ein, um die Einbruchstatistik des BKA für Ihre Region in die Bewertung einzubeziehen.
            </p>

            <form onSubmit={handlePlzSubmit} className="w-full max-w-xs">
               <input 
                 ref={plzInputRef}
                 type="text" 
                 pattern="[0-9]*"
                 inputMode="numeric"
                 value={plz}
                 onChange={(e) => { setPlz(e.target.value); setPlzError(''); }}
                 placeholder="z.B. 80331"
                 className="w-full text-center text-3xl font-bold tracking-widest p-4 border-b-2 border-gray-300 dark:border-gray-700 bg-transparent focus:border-brand-red focus:outline-none mb-4 text-gray-900 dark:text-white transition-colors rounded-none"
                 maxLength={5}
               />
               {plzError && <p className="text-red-500 text-sm mb-4 font-medium">{plzError}</p>}
               
               <button 
                 type="submit"
                 className="w-full bg-brand-red text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center shadow-lg active:scale-95"
               >
                 Ergebnis anzeigen <ArrowRight className="ml-2 w-5 h-5" />
               </button>
            </form>
         </div>
         
         <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
            <button onClick={handleBack} className="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors p-2 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
            </button>
         </div>
      </div>
    );
  }

  // Normal Question Render
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-12 flex flex-col min-h-[70vh]">
      <div className="mb-6 md:mb-12">
        <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">
          <span>Frage {currentIndex + 1} / {totalQuestions}</span>
          <span className="text-right">{currentQuestion.category}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-red transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center relative">
        {/* Question Container - Fixed Height with Scroll */}
        <div className="mb-6 md:mb-8 max-h-[200px] md:max-h-[250px] overflow-y-auto pr-2">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3 leading-tight">
            {currentQuestion.text}
          </h2>
          {currentQuestion.subtext && (
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {currentQuestion.subtext}
            </p>
          )}
        </div>

        {/* Buttons Container - Fixed Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 flex-shrink-0">
          <button
            onClick={() => handleAnswer(true)}
            disabled={isLocked}
            className="group relative flex items-center p-4 md:p-6 text-lg font-bold border-2 rounded-2xl transition-all duration-100 focus:outline-none shadow-sm hover:shadow-md border-gray-200 dark:border-gray-700 hover:border-brand-red bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-white active:scale-[0.98] w-full text-left"
          >
            <div className="flex-shrink-0 p-2 rounded-full transition-colors bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-brand-dark mr-4">
               <Check className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-brand-red" />
            </div>
            <span>Ja</span>
          </button>

          <button
            onClick={() => handleAnswer(false)}
            disabled={isLocked}
            className="group relative flex items-center p-4 md:p-6 text-lg font-bold border-2 rounded-2xl transition-all duration-100 focus:outline-none shadow-sm hover:shadow-md border-gray-200 dark:border-gray-700 hover:border-brand-red bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-white active:scale-[0.98] w-full text-left"
          >
            <div className="flex-shrink-0 p-2 rounded-full transition-colors bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-brand-dark mr-4">
               <X className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-brand-red" />
            </div>
            <span>Nein</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={handleBack}
          disabled={currentIndex === 0 || isLocked}
          className={`flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors p-2 -ml-2 ${currentIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
        </button>

        <button
          onClick={() => handleAnswer(null)}
          disabled={isLocked}
          className="flex items-center text-sm font-semibold text-gray-400 hover:text-brand-red transition-colors p-2 -mr-2"
        >
          <HelpCircle className="w-4 h-4 mr-2" /> Weiß nicht
        </button>
      </div>
    </div>
  );
};