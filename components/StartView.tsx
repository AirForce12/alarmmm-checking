import React, { useState, useRef, useEffect } from 'react';
import { Shield, Timer, CheckCircle, ArrowRight, Lock, AlertTriangle, Server, Radio, Activity, LockOpen } from 'lucide-react';

interface StartViewProps {
  onStart: () => void;
  onOpenScan: () => void;
  liveScanUnlocked: boolean;
}

export const StartView: React.FC<StartViewProps> = ({ onStart, onOpenScan, liveScanUnlocked }) => {
  const [accessDenied, setAccessDenied] = useState(false);
  const [highlightStart, setHighlightStart] = useState(false);
  const scanContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(282); // Default mobile height
  
  useEffect(() => {
    const updateDimensions = () => {
      if (scanContainerRef.current) {
        const height = scanContainerRef.current.clientHeight;
        setContainerHeight(height);
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Calculate scanner dimensions based on container height
  const scannerHeight = Math.max(containerHeight * 0.45, 180); // 45% of container or min 180px
  const scannerGlowHeight = scannerHeight * 1.1; // Slightly larger glow
  const scannerCoreHeight = scannerHeight * 0.6; // Core line is 60% of scanner

  const handleLiveScanClick = () => {
    if (liveScanUnlocked) {
      onOpenScan();
      return;
    }

    // Show access denied feedback
    setAccessDenied(true);
    setHighlightStart(true);

    // Hide feedback after delay
    setTimeout(() => {
      setAccessDenied(false);
      setHighlightStart(false);
    }, 3000);
  };

  return (
    <div className="relative overflow-hidden min-h-[85vh] flex items-center">
       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 lg:flex lg:items-center w-full">
          
          {/* Left Content */}
          <div className="lg:w-1/2 lg:pr-12 relative mb-12 lg:mb-0">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-brand-red text-xs sm:text-sm font-bold tracking-wide uppercase mb-6 sm:mb-8 border border-red-100 dark:border-red-900/30 animate-fade-in">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Sicherheits-Analyse 2025
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6">
              Testen Sie Ihren <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-redDark">Einbruchschutz</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-8 sm:mb-10 leading-relaxed max-w-xl">
              Wie sicher ist Ihre Immobilie wirklich? Finden Sie in wenigen Minuten Schwachstellen und erhalten Sie eine professionelle Einschätzung vom Experten.
            </p>
  
            <div className="flex flex-col sm:flex-row gap-4 relative w-full sm:w-auto">
              {/* Access Denied Popup */}
              {accessDenied && (
                <div className="absolute -top-24 left-0 w-full sm:w-auto bg-brand-dark text-white px-6 py-3 rounded-xl shadow-2xl border-l-4 border-brand-red animate-bounce flex items-center z-50">
                  <AlertTriangle className="w-5 h-5 text-brand-red mr-3" />
                  <div className="text-sm">
                    <span className="font-bold block text-brand-red uppercase tracking-wider text-xs">ZUGRIFF VERWEIGERT</span>
                    Bitte führen Sie zuerst den Standard-Test durch.
                  </div>
                </div>
              )}

              <button
                onClick={onStart}
                className={`group flex items-center justify-center px-8 py-4 bg-brand-red text-white text-lg font-bold rounded-xl shadow-lg hover:bg-brand-redDark hover:shadow-xl transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red w-full sm:w-auto ${highlightStart ? 'animate-pulse ring-4 ring-brand-red/30 scale-105' : 'hover:-translate-y-0.5'}`}
              >
                Jetzt Test starten
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={handleLiveScanClick}
                className={`group flex items-center justify-center px-8 py-4 backdrop-blur text-lg font-bold rounded-xl shadow hover:shadow-lg border transition-all duration-200 w-full sm:w-auto 
                  ${liveScanUnlocked 
                    ? 'bg-brand-red/10 border-brand-red text-brand-red animate-pulse hover:bg-brand-red hover:text-white cursor-pointer' 
                    : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-80'
                  }`}
              >
                 <span className={`relative flex h-3 w-3 mr-3`}>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${liveScanUnlocked ? 'bg-brand-red animate-ping' : 'bg-gray-400'}`}></span>
                  </span>
                {liveScanUnlocked ? <LockOpen className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Live Echtzeit Scan
              </button>
            </div>
  
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Timer className="w-5 h-5 mr-2 text-brand-red" />
                Dauer: ~2 Min
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-brand-red" />
                100% Kostenlos
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-brand-red" />
                DSVGO Konform
              </div>
            </div>
          </div>
  
          {/* Right Visual: THE PREMIUM SECURITY BOX */}
          <div className="lg:w-1/2 lg:pl-8 flex justify-center items-center relative w-full">
             
             {/* The Container Box */}
             <div className="relative w-full max-w-[500px] h-[300px] sm:h-[400px] group cursor-default mx-auto">
                {/* Glass Frame Background */}
                <div className="absolute inset-0 bg-white/10 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl transition-all duration-500 group-hover:border-brand-red/50 group-hover:shadow-[0_0_60px_rgba(196,33,38,0.2)] overflow-hidden"></div>

                {/* Box Header */}
                <div className="absolute top-0 left-0 right-0 h-10 sm:h-12 border-b border-white/10 dark:border-gray-700/50 flex items-center justify-between px-4 sm:px-6 bg-white/5 dark:bg-gray-800/50 rounded-t-2xl z-30 backdrop-blur-md">
                    <div className="flex items-center">
                       <Server className="w-3 h-3 sm:w-4 sm:h-4 text-brand-red mr-2" />
                       <span className="text-[8px] sm:text-[10px] font-bold text-gray-600 dark:text-gray-300 tracking-[0.2em] uppercase">BLOCKALARM ABWEHR-KERN</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400/50"></div>
                    </div>
                </div>

                {/* Inner Content: PROFESSIONAL SCAN SIMULATION */}
                <div 
                  ref={scanContainerRef}
                  className="absolute inset-0 top-10 sm:top-12 bottom-8 sm:bottom-10 bg-black/65 overflow-hidden flex items-center justify-center"
                >
                    
                    {/* 1. Base Image with Professional Grading & Vignette */}
                    <div className="absolute inset-0 z-0">
                      <img 
                        src="https://i.ibb.co/Qvdd6vcM/scan-hause.png$0" 
                        alt="Security Scan Visualization" 
                        className="w-full h-full object-cover opacity-75 grayscale-[25%] contrast-110 transition-opacity duration-300"
                        style={{ maskImage: 'radial-gradient(circle at center, black 55%, transparent 100%)' }}
                      />
                      {/* Red tint overlay for "Night Vision" feel */}
                      <div className="absolute inset-0 bg-brand-red/4 mix-blend-overlay"></div>
                    </div>
                    
                    {/* 2. Digital Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                    {/* 3. Professional Scanner Beam - Clean & Smooth */}
                    <div className="absolute inset-x-0 z-20 pointer-events-none deep-scan-animation">
                      <div className="relative -translate-y-1/2" style={{ height: `${scannerHeight}px` }}>
                        {/* Outer Glow Layer - Softest, Widest Shadow */}
                        <div 
                          className="absolute inset-x-0 top-1/2 bg-gradient-to-b from-transparent via-brand-red/20 to-transparent blur-xl opacity-70"
                          style={{ 
                            height: `${scannerGlowHeight}px`,
                            transform: 'translateY(-50%)',
                            filter: 'blur(20px)',
                            boxShadow: `
                              0 0 40px rgba(196, 33, 38, 0.4),
                              0 0 80px rgba(196, 33, 38, 0.25),
                              0 0 120px rgba(196, 33, 38, 0.15),
                              inset 0 0 60px rgba(255, 255, 255, 0.05)
                            `
                          }}
                        ></div>
                        
                        {/* Main Scanner Beam - Professional Gradient with Smooth Shadow */}
                        <div 
                          className="absolute inset-x-0 top-1/2 bg-gradient-to-b from-transparent via-brand-red/35 to-transparent blur-md opacity-90"
                          style={{ 
                            height: `${scannerHeight}px`,
                            transform: 'translateY(-50%)',
                            filter: 'blur(8px)',
                            boxShadow: `
                              0 0 20px rgba(196, 33, 38, 0.6),
                              0 0 40px rgba(196, 33, 38, 0.4),
                              0 0 60px rgba(196, 33, 38, 0.25),
                              inset 0 2px 4px rgba(255, 255, 255, 0.1),
                              inset 0 -2px 4px rgba(196, 33, 38, 0.2)
                            `
                          }}
                        ></div>
                        
                        {/* Core Scan Line - Bright Center with Professional Glow */}
                        <div 
                          className="absolute inset-x-0 top-1/2 bg-gradient-to-r from-transparent via-white to-transparent"
                          style={{ 
                            height: '2px',
                            transform: 'translateY(-50%)',
                            boxShadow: `
                              0 0 4px rgba(255, 255, 255, 0.9),
                              0 0 8px rgba(255, 255, 255, 0.7),
                              0 0 12px rgba(196, 33, 38, 0.8),
                              0 0 20px rgba(196, 33, 38, 0.6),
                              0 0 30px rgba(196, 33, 38, 0.4),
                              inset 0 0 10px rgba(255, 255, 255, 0.3)
                            `
                          }}
                        ></div>
                        
                        {/* Wide Illumination Effect - Smooth Screen Blend */}
                        <div 
                          className="absolute inset-x-0 top-1/2 bg-gradient-to-b from-brand-red/12 via-brand-red/6 to-transparent mix-blend-screen blur-2xl"
                          style={{ 
                            height: `${scannerGlowHeight * 1.2}px`,
                            transform: 'translateY(-50%)',
                            filter: 'blur(24px)'
                          }}
                        ></div>
                        
                        {/* Secondary Glow Layer - Extra Smoothness & Depth */}
                        <div 
                          className="absolute inset-x-0 top-1/2 bg-gradient-to-b from-white/8 via-white/4 to-transparent blur-lg"
                          style={{ 
                            height: `${scannerCoreHeight}px`,
                            transform: 'translateY(-50%)',
                            filter: 'blur(12px)',
                            opacity: 0.6
                          }}
                        ></div>
                      </div>
                    </div>

                     {/* HUD Overlay Elements (2D) */}
                     <div className="absolute top-4 left-4 z-30">
                        <div className="text-[8px] font-mono text-brand-red mb-1 tracking-wider drop-shadow-[0_0_4px_rgba(196,33,38,0.8)]">ZIELERFASSUNG</div>
                        <div className="h-[2px] w-16 bg-brand-red/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div className="h-full bg-brand-red animate-[scan_3s_linear_infinite] w-full shadow-[0_0_8px_rgba(196,33,38,0.9)]"></div>
                        </div>
                     </div>

                     <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md border border-brand-red/30 p-2 rounded text-brand-red z-30 flex items-center gap-3 shadow-lg shadow-brand-red/20">
                       <div className="relative">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-60 animate-ping"></span>
                          <Activity className="relative w-3 h-3 drop-shadow-[0_0_4px_rgba(196,33,38,0.8)]" />
                       </div>
                       <div className="text-[8px] sm:text-[10px] font-bold font-mono tracking-widest drop-shadow-[0_0_4px_rgba(196,33,38,0.8)]">SCAN LÄUFT...</div>
                    </div>
                    
                    {/* Professional Grid Overlay - Smooth and Widespread */}
                    <div className="absolute inset-0 z-10 opacity-40">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(196,33,38,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(196,33,38,0.15)_1px,transparent_1px)] bg-[size:35px_35px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_85%)]"></div>
                      {/* Secondary finer grid */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:17px_17px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)] opacity-60"></div>
                    </div>
                </div>

                {/* Box Footer */}
                <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-10 border-t border-white/10 dark:border-gray-700/50 flex items-center justify-between px-4 sm:px-6 bg-white/5 dark:bg-gray-800/50 rounded-b-2xl z-30 backdrop-blur-md">
                     <div className="flex items-center">
                        <Radio className="w-3 h-3 text-gray-500 mr-2 animate-pulse" />
                        <span className="text-[8px] sm:text-[10px] font-mono text-gray-500 uppercase tracking-wider">LIVE SATELLITE UPLINK</span>
                     </div>
                     <span className="text-[8px] sm:text-[10px] font-mono text-brand-red font-bold animate-pulse tracking-widest">VERBUNDEN</span>
                </div>

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-brand-red rounded-tl-sm z-40 opacity-50"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-brand-red rounded-tr-sm z-40 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-brand-red rounded-bl-sm z-40 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-brand-red rounded-br-sm z-40 opacity-50"></div>
             </div>
          </div>
       </div>
    </div>
  );
};