import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StartView } from './components/StartView';
import { QuizFlow } from './components/QuizFlow';
import { ResultView } from './components/ResultView';
import { SatelliteScanModal } from './components/SatelliteScanModal';
import { Answer, ScreenState } from './types';
import { calculateScore } from './utils/scoring';

export const App = () => {
  const [screen, setScreen] = useState<ScreenState>('start');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [plz, setPlz] = useState<string | undefined>(undefined);
  
  // Logic to unlock the "Live Scan" button only after quiz completion
  const [liveScanUnlocked, setLiveScanUnlocked] = useState(false);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const handleStart = () => setScreen('quiz');
  
  const handleQuizComplete = (collectedAnswers: Answer[]) => {
    // Extract PLZ if present in the answers (synthetic answer)
    const plzAnswer = collectedAnswers.find(a => a.questionId === 'plz_input');
    if (plzAnswer && (plzAnswer as any).extra) {
      setPlz((plzAnswer as any).extra);
    }

    setAnswers(collectedAnswers);
    // Unlock the Live Scan feature permanently for this session
    setLiveScanUnlocked(true);
    setScreen('result');
  };

  const handleRestart = () => {
    setAnswers([]);
    setPlz(undefined);
    setScreen('start');
  };

  // Navigation handler to go back to home without resetting "Unlocked" state
  const handleGoHome = () => {
    setScreen('start');
  };

  const scoreResult = {
    ...calculateScore(answers),
    plz: plz // Attach PLZ to result
  };

  return (
    <Layout onGoHome={handleGoHome}>
      <SatelliteScanModal 
        isOpen={showScanModal} 
        onClose={() => setShowScanModal(false)} 
      />
      
      {screen === 'start' && (
        <StartView 
          onStart={handleStart} 
          onOpenScan={() => setShowScanModal(true)}
          liveScanUnlocked={liveScanUnlocked}
        />
      )}
      
      {screen === 'quiz' && (
        <QuizFlow 
          onComplete={handleQuizComplete} 
        />
      )}
      
      {screen === 'result' && (
        <ResultView 
          result={scoreResult} 
          onRestart={handleRestart}
          onGoHome={handleGoHome}
        />
      )}
    </Layout>
  );
};