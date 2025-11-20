import React, { useState, useEffect } from 'react';
import { BRAND_ASSETS } from '../constants';
import { Moon, Sun, Phone, ShieldCheck } from 'lucide-react';
import { LayoutProps } from '../types';

export const Layout: React.FC<LayoutProps> = ({ children, onGoHome }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* --- SECURITY-THEMED BACKGROUND PATTERN --- */}
      <div className="fixed inset-0 z-0 bg-gray-50 dark:bg-black transition-colors duration-500 overflow-hidden pointer-events-none">
        {/* Base gradient overlay - lighter */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black"></div>
        
        {/* Security Grid Pattern - Surveillance-style grid - MORE VISIBLE */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(196, 33, 38, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(196, 33, 38, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: '0.4',
            filter: 'brightness(1.1)'
          }}
        ></div>
        
        {/* Security Dots Pattern - Like security camera monitoring points - MORE VISIBLE */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(196, 33, 38, 0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0',
            opacity: '0.3'
          }}
        ></div>
        
        {/* Hexagonal Security Mesh Pattern - Like security system networks - MORE VISIBLE */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(60deg, transparent, transparent 28px, rgba(196, 33, 38, 0.12) 28px, rgba(196, 33, 38, 0.12) 29px),
              repeating-linear-gradient(-60deg, transparent, transparent 28px, rgba(196, 33, 38, 0.12) 28px, rgba(196, 33, 38, 0.12) 29px),
              repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(196, 33, 38, 0.12) 28px, rgba(196, 33, 38, 0.12) 29px)
            `,
            backgroundSize: '50px 50px',
            opacity: '0.25'
          }}
        ></div>
        
        {/* Corner accent - Security perimeter indication - MORE VISIBLE */}
        <div className="absolute top-0 left-0 w-64 h-64 border-l-2 border-t-2 border-brand-red/20 dark:border-brand-red/30"></div>
        <div className="absolute top-0 right-0 w-64 h-64 border-r-2 border-t-2 border-brand-red/20 dark:border-brand-red/30"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 border-l-2 border-b-2 border-brand-red/20 dark:border-brand-red/30"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 border-r-2 border-b-2 border-brand-red/20 dark:border-brand-red/30"></div>
        
        {/* Reduced gradient fade so pattern shows through */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent dark:from-brand-dark/40"></div>
      </div>

      {/* Header */}
      <header className="bg-white/90 dark:bg-brand-dark/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo - Clickable */}
          <button 
            onClick={onGoHome} 
            className="flex-shrink-0 flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
          >
             <img 
               src={darkMode ? BRAND_ASSETS.logoWhite : BRAND_ASSETS.logoBlack} 
               alt="BLOCKALARM" 
               className="h-10 sm:h-10 w-auto md:h-12 transition-all"
             />
             <div className="hidden xs:flex flex-col ml-2 sm:ml-3 border-l pl-2 sm:pl-3 border-gray-300 dark:border-gray-700 text-left">
                <span className="text-[10px] sm:text-xs font-bold text-brand-red tracking-widest uppercase">Einbruchschutz-Check</span>
                <span className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 tracking-widest">BLOCKALARM GMBH ©2025</span>
             </div>
          </button>

          {/* Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <a href="tel:+49893883180" className="hidden md:flex items-center text-gray-600 dark:text-gray-300 hover:text-brand-red transition-colors">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">089 388 318 0</span>
            </a>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-8 mt-auto relative z-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0 text-center md:text-left">
             <div className="flex flex-col sm:flex-row items-center opacity-90">
                 <div className="flex items-center mb-2 sm:mb-0">
                    <ShieldCheck className="w-5 h-5 text-brand-red mr-2" />
                    <span className="text-sm font-medium">Created and Powered by</span>
                 </div>
                 <a href="mailto:hysa@blockalarm.de" className="text-white hover:text-brand-red transition-colors font-bold ml-1 sm:ml-2">ANDI IT</a> 
                 <span className="hidden sm:inline mx-2">|</span>
                 <span className="text-sm font-medium">BLOCKALARM GMBH</span>
             </div>
          </div>
          <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-400">
            <a href="https://www.blockalarm.de/impressum/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Impressum</a>
            <a href="https://www.blockalarm.de/datenschutz/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Datenschutz</a>
            <a href="https://www.blockalarm.de/kontakt/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
};