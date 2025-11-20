
import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, ScanLine, CheckCircle, Loader2 } from 'lucide-react';
import { analyzeLockImage, VisionAnalysisResult } from '../utils/vision';

export const LockAnalyzer: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setAnalyzing(true);
        setResult(null);

        // REAL GEMINI ANALYSIS
        const analysis = await analyzeLockImage(base64);
        setResult(analysis);
        setAnalyzing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
       {/* Header */}
       <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center text-white font-bold">
             <ScanLine className="w-5 h-5 mr-2 text-brand-red" />
             Bot-Schloss-Analyse
          </div>
          <span className="text-[10px] bg-brand-red/20 text-brand-red px-2 py-1 rounded uppercase font-bold tracking-wider">Live AI</span>
       </div>

       <div className="p-6 md:p-8">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            capture="environment"
            className="hidden" 
          />

          {!imagePreview && (
             <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-600">
                   <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Sicherheits-Check Ihres Schließzylinders</h4>
                <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                   Machen Sie ein Foto Ihres Schlüssels oder Schlosses. Unsere KI analysiert das Profil in Echtzeit.
                </p>
                
                <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="bg-white text-brand-dark px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center mx-auto"
                >
                   <Upload className="w-4 h-4 mr-2" /> Foto hochladen
                </button>
             </div>
          )}

          {/* Scanning UI */}
          {analyzing && imagePreview && (
             <div className="relative h-64 w-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
                <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-red shadow-[0_0_15px_rgba(196,33,38,1)] animate-[scan_2s_linear_infinite] z-10"></div>
                
                <div className="text-center z-20 bg-black/50 p-4 rounded-xl backdrop-blur">
                   <Loader2 className="w-8 h-8 text-brand-red animate-spin mx-auto mb-2" />
                   <div className="font-mono text-brand-red text-xl font-bold mb-1 tracking-widest">ANALYZING...</div>
                   <div className="text-xs text-gray-300 font-mono"> 001and BoT....</div>
                </div>
             </div>
          )}

          {/* Result UI */}
          {result && !analyzing && (
             <div className="animate-fade-in">
                {result.securityLevel === 'unknown' ? (
                   <div className="flex items-center justify-center mb-6">
                       <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-gray-500 bg-gray-500/20">
                          <AlertTriangle className="w-8 h-8 text-gray-400" />
                       </div>
                   </div>
                ) : (
                   <div className="flex items-center justify-center mb-6">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${result.securityLevel === 'low' ? 'bg-red-500/20 border-red-500' : result.securityLevel === 'medium' ? 'bg-amber-500/20 border-amber-500' : 'bg-green-500/20 border-green-500'}`}>
                         {result.securityLevel === 'low' ? <AlertTriangle className="w-8 h-8 text-red-500" /> : result.securityLevel === 'medium' ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <CheckCircle className="w-8 h-8 text-green-500" />}
                      </div>
                   </div>
                )}
                
                <h4 className="text-xl font-bold text-white text-center mb-2">
                  {result.isLock ? 'Analyse Abgeschlossen' : 'Objekt nicht erkannt'}
                </h4>
                
                <p className="text-gray-400 text-center text-sm mb-6 max-w-md mx-auto italic bg-gray-800/50 p-3 rounded border border-gray-700">
                   "{result.reason}"
                </p>
                
                {result.isLock && result.securityLevel !== 'unknown' && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Sicherheitsstufe:</span>
                        <span className={`font-bold uppercase ${result.securityLevel === 'low' ? 'text-red-500' : result.securityLevel === 'medium' ? 'text-amber-500' : 'text-green-500'}`}>
                          {result.securityLevel === 'low' ? 'NIEDRIG' : result.securityLevel === 'medium' ? 'MITTEL' : 'HOCH'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full mb-4">
                        <div 
                          className={`h-full rounded-full ${result.securityLevel === 'low' ? 'bg-red-500' : result.securityLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} 
                          style={{ width: result.securityLevel === 'low' ? '25%' : result.securityLevel === 'medium' ? '60%' : '95%' }}
                        ></div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                   <button 
                     onClick={() => { setImagePreview(null); setResult(null); }}
                     className="text-gray-400 hover:text-white text-xs underline mr-4"
                   >
                     Neues Bild
                   </button>
                   <a href="https://www.blockalarm.de/transponder/" target="_blank" rel="noopener noreferrer" className="text-brand-red font-bold hover:text-white hover:underline transition-colors">
                      Sichere Zylinder ansehen &rarr;
                   </a>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
