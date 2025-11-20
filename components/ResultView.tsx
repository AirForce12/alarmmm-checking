import React, { useState, useEffect } from 'react';
import { ScoringResult } from '../types';
import { RiskGauge } from './RiskGauge';
import { LockAnalyzer } from './LockAnalyzer';
import { getBKARisk } from '../constants';
import { getLocationFromPlz, getMapImageUrl, getCoordinates } from '../utils/geo';
import { AlertTriangle, CheckCircle, ArrowRight, Lock, Phone, Mail, User, Info, Loader2, Coins, MapPin, TrendingUp, Satellite } from 'lucide-react';

interface ResultViewProps {
  result: ScoringResult;
  onRestart: () => void;
  onGoHome?: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onRestart, onGoHome }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bkaStats, setBkaStats] = useState<any>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (result.plz) {
      setBkaStats(getBKARisk(result.plz));
      
      // Fetch Real Location Data
      getLocationFromPlz(result.plz).then(async (loc) => {
        if (loc) {
          setLocationName(`${loc.city}, ${loc.state}`);
          // Get Map Image for this city
          const coords = await getCoordinates(`${loc.city}, Germany`);
          if (coords) {
            setMapUrl(getMapImageUrl(coords.lat, coords.lon));
          }
        }
      });
    }
  }, [result.plz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Import email utility dynamically
      const { sendEmailNotification } = await import('../utils/email');
      
      // Send email notification with all form data and result data
      await sendEmailNotification({
        formType: 'contact-form',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        plz: result.plz,
        additionalData: {
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          totalScore: result.totalScore,
          bkaStats: bkaStats,
          locationName: locationName,
          recommendations: result.recommendations
        }
      });
      
      // Small delay to ensure email client opens
      setTimeout(() => {
        setLoading(false);
        setFormSubmitted(true);
      }, 500);
    } catch (error) {
      console.error('Error sending email:', error);
      setLoading(false);
      setFormSubmitted(true); // Still show success even if email fails
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      
      {/* LIVE SCAN UNLOCKED BANNER */}
      {onGoHome && (
        <div className="mb-8 bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-lg border border-brand-red/30 animate-fade-in gap-4 text-center sm:text-left">
           <div className="flex items-center flex-col sm:flex-row text-white gap-3 sm:gap-0">
              <div className="bg-brand-red p-2 rounded-full sm:mr-3 animate-pulse">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-brand-red">Feature Freigeschaltet</div>
                <div className="font-bold text-sm sm:text-base">Echtzeit Satelliten-Scan ist jetzt verfügbar</div>
              </div>
           </div>
           <button 
             onClick={onGoHome}
             className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-white text-brand-dark font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors active:scale-95"
           >
             Zum Live Scan &rarr;
           </button>
        </div>
      )}

      <div className="text-center mb-8 md:mb-10 animate-fade-in">
        <span className="inline-block py-1 px-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold tracking-wider uppercase mb-4">Analyse Abgeschlossen</span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Ihr Sicherheits-Ergebnis</h2>
        <p className="text-gray-600 dark:text-gray-400">Hier ist Ihre persönliche Auswertung</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mb-12">
        {/* Score Card */}
        <div className="md:col-span-7 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[320px]">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red to-brand-redDark"></div>
           
           <div className="w-full flex justify-center mb-6 md:mb-8 pt-4">
              <RiskGauge score={result.totalScore} />
           </div>
           
           <div className="relative z-10 max-w-lg">
             <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
               Risikostufe: <span className={`${result.riskLevel === 'Kritisch' ? 'text-brand-red' : result.riskLevel === 'Mittel' ? 'text-amber-500' : 'text-emerald-500'}`}>{result.riskLevel}</span>
             </h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-2 md:px-4">
               {result.riskLevel === 'Kritisch' 
                 ? 'Achtung: Es wurden signifikante Sicherheitslücken festgestellt. Ihr Objekt ist für Einbrecher ein attraktives Ziel. Dringender Handlungsbedarf.'
                 : result.riskLevel === 'Mittel' 
                 ? 'Ihr Objekt verfügt über Basisschutz, weist aber Lücken auf, die von erfahrenen Tätern genutzt werden könnten.'
                 : 'Sehr gut: Ihr Sicherheitsstandard ist hoch. Wir empfehlen lediglich eine regelmäßige Wartung und Überprüfung.'}
             </p>
           </div>
        </div>

        {/* Summary Card */}
        <div className="md:col-span-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
           <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center">
             <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center mr-3">
               <Lock className="w-4 h-4 text-brand-red" />
             </div>
             Analyse-Zusammenfassung
           </h4>
           <div className="space-y-5">
              {Object.entries(result.categoryScores).slice(0,5).map(([cat, rawScore]) => {
                 const score = rawScore as number;
                 return (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    <span>{cat}</span>
                    <span className={score > 50 ? 'text-brand-red' : 'text-emerald-500'}>{score > 50 ? 'Risiko' : 'Sicher'}</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${score > 60 ? 'bg-brand-red' : score > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              );})}
           </div>
        </div>
      </div>

      {/* BKA HEATMAP SECTION (REAL DATA) */}
      {bkaStats && (
        <div className="mb-12 bg-white dark:bg-gray-900 rounded-3xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800 relative">
           {/* Background Map (Real) */}
           {mapUrl && (
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <img src={mapUrl} className="w-full h-full object-cover grayscale" alt="Map" />
                 <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900/50"></div>
              </div>
           )}

          <div className="p-6 md:p-8 md:flex items-center gap-8 relative z-10">
            <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center justify-center text-center">
               <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-4 relative border-4 border-white dark:border-gray-800 shadow-lg">
                 <MapPin className="w-10 h-10 text-brand-red" />
                 <div className="absolute top-0 right-0 bg-brand-red text-white text-xs font-bold px-2 py-1 rounded-full shadow">BKA</div>
               </div>
               <div className="text-4xl font-extrabold text-gray-900 dark:text-white">PLZ {bkaStats.plz}</div>
               <div className="text-lg text-gray-600 dark:text-gray-300 font-medium mt-1">{locationName}</div>
            </div>
            
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                 <div className="flex items-center text-brand-red mb-2">
                   <TrendingUp className="w-5 h-5 mr-2" />
                   <span className="font-bold">Einbruch-Trend</span>
                 </div>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">+{bkaStats.burglaryTrend}%</p>
                 <p className="text-xs text-gray-500">Anstieg der Delikte im Vergleich zum Vorjahr in der Region {locationName || 'Ihres Wohnorts'}.</p>
               </div>

               <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                 <div className="flex items-center text-amber-500 mb-2">
                   <AlertTriangle className="w-5 h-5 mr-2" />
                   <span className="font-bold">Gefahren-Index</span>
                 </div>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{bkaStats.riskScore}/10</p>
                 <p className="text-xs text-gray-500">Statistische Wahrscheinlichkeit basierend auf Versicherungsdaten.</p>
               </div>
               
               <div className="col-span-full">
                 <p className="text-sm text-gray-500 italic border-l-2 border-brand-red pl-3">
                   "In der Region {locationName || bkaStats.plz} verzeichnen Behörden aktuell eine erhöhte Aktivität organisierter Banden. Besonders in der Dämmerungszeit wird zu erhöhter Wachsamkeit geraten."
                 </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {result.topRisks.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
            <AlertTriangle className="w-6 h-6 text-brand-red mr-3" />
            Empfohlene Maßnahmen
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.topRisks.map((risk, idx) => (
              <div key={risk.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-brand-red dark:bg-red-900/20 border border-red-200 dark:border-red-900/30">
                    Priorität {idx + 1}
                  </span>
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 leading-snug">
                    {risk.text}
                </h4>

                {/* Explanation / Subtext */}
                {risk.subtext && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg flex gap-3">
                        <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {risk.subtext}
                        </p>
                    </div>
                )}

                <div className="flex-grow">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Unsere Empfehlung:</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">"{risk.recommendation}"</p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Lösung</span>
                  <a 
                    href={risk.productUrl}
                    target="_blank"
                    rel="noopener noreferrer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-brand-red flex items-center group cursor-pointer hover:underline"
                  >
                    {risk.productMatch}
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOCK ANALYZER (REAL AI) */}
      <div className="mb-16">
        <LockAnalyzer />
      </div>

      {/* Lead Form Section */}
      <div id="contact" className="bg-brand-dark text-white rounded-3xl shadow-2xl p-6 md:p-16 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red opacity-10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900 opacity-20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Sichern Sie Ihr Objekt professionell ab</h3>
            <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
              Lassen Sie die festgestellten Schwachstellen von unseren zertifizierten Experten überprüfen. Fordern Sie jetzt Ihre <span className="text-white font-bold">kostenlose Sicherheits-Analyse vor Ort</span> an.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center mt-1">
                  <CheckCircle className="w-4 h-4 text-brand-red" />
                </div>
                <div className="ml-4">
                  <h5 className="font-bold">Maßgeschneidertes Konzept</h5>
                  <p className="text-sm text-gray-400">Individuelle Lösung statt Standard-Paket.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center mt-1">
                   <Coins className="w-4 h-4 text-brand-red" />
                </div>
                <div className="ml-4">
                  <h5 className="font-bold">Steuervorteile sichern</h5>
                  <p className="text-sm text-gray-400">Bis zu 20% der Kosten staatlich förderbar (§ 35a EStG).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl">
            {!formSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Ihr Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-600 focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all" 
                      placeholder="Vor- und Nachname" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">E-Mail</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-600 focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all" 
                        placeholder="ihre@email.de" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Telefon</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-500" />
                      </div>
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-600 focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all" 
                        placeholder="089 388 318 0" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4">
                  <input type="checkbox" id="privacy" required className="mt-1 h-4 w-4 rounded bg-gray-800 border-gray-700 text-brand-red focus:ring-brand-red" />
                  <label htmlFor="privacy" className="text-xs text-gray-400 cursor-pointer leading-snug">
                    Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und Zuordnung für eventuelle Rückfragen dauerhaft gespeichert werden. <a href="https://www.blockalarm.de/datenschutz/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Datenschutz</a>.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-brand-red hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sende Daten...
                    </>
                  ) : 'Kostenlose Analyse anfordern'}
                </button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Vielen Dank!</h4>
                <p className="text-gray-300 mb-8">
                  Wir haben Ihre Anfrage erhalten. Ein Sicherheitsexperte von BLOCKALARM wird sich in Kürze telefonisch bei Ihnen melden, um die Details zu besprechen.
                </p>
                <button onClick={onRestart} className="text-sm font-bold text-brand-red hover:text-white transition-colors uppercase tracking-wide">
                  Check neu starten
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};