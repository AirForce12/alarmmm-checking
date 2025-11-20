import React, { useState, useEffect, useRef } from 'react';
import { X, Crosshair, Map, Satellite, Search, CheckCircle, ShieldAlert, Loader2, Puzzle, Wifi, AlertTriangle } from 'lucide-react';
import { getCoordinates, getSatelliteImageUrl, searchAddress, GeoResult } from '../utils/geo';
import { sendEmailNotification } from '../utils/email';

interface SatelliteScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'address' | 'scanning' | 'captcha' | 'form' | 'success';

export const SatelliteScanModal: React.FC<SatelliteScanModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);
  
  // Debounce State
  const [debouncedAddress, setDebouncedAddress] = useState(address);

  // Real Satellite Data
  const [satelliteUrl, setSatelliteUrl] = useState<string | null>(null);
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    privacyAccepted: false
  });

  useEffect(() => {
    if (isOpen) {
      setStep('address');
      setAddress('');
      setScanProgress(0);
      setSliderValue(0);
      setCaptchaVerified(false);
      setSatelliteUrl(null);
      setSuggestions([]);
    }
  }, [isOpen]);

  // Debounce Effect: Only update debouncedAddress 500ms after user stops typing
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedAddress(address);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [address]);

  // API Call Effect: Triggered when debouncedAddress changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedAddress.length > 2) {
        const results = await searchAddress(debouncedAddress);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedAddress]);


  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const selectAddress = (item: GeoResult) => {
    setAddress(item.displayName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (address.length < 3) return;

    setLoading(true);
    
    // Always fetch fresh coordinates using Google API to ensure Rooftop precision
    const location = await getCoordinates(address);
    
    if (location) {
      setCoords({ lat: location.lat, lon: location.lon });
      const url = getSatelliteImageUrl(location.lat, location.lon);
      setSatelliteUrl(url);
      setLoading(false);
      setStep('scanning');
    } else {
      setLoading(false);
      alert("Adresse konnte nicht exakt lokalisiert werden. Bitte überprüfen Sie die Schreibweise.");
    }
  };

  // Scanning Simulation on Real Image
  useEffect(() => {
    if (step === 'scanning') {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('captcha');
            return 100;
          }
          return prev + 1;
        });
      }, 40); // 4 seconds total
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val >= 65 && val <= 75) {
      setTimeout(() => {
        setCaptchaVerified(true);
        setTimeout(() => setStep('form'), 500);
      }, 200);
    }
  };

  const validatePhone = (phone: string) => {
    // Strips spaces, dashes, slashes. Must start with 015, 016, 017 for mobile generally, or just valid German format 01...
    // Strict mobile: ^01[567][0-9]{7,9}$
    const clean = phone.replace(/[^0-9]/g, '');
    return /^01[567][0-9]{7,9}$/.test(clean);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyAccepted) {
      alert("Bitte akzeptieren Sie die Datenschutzbestimmungen.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      alert("Bitte geben Sie eine gültige deutsche Mobilnummer ein (z.B. 0171 12345678).");
      return;
    }

    setLoading(true);
    
    try {
      // Send email notification with all form data
      await sendEmailNotification({
        formType: 'satellite-scan',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: address,
        additionalData: {
          coordinates: coords,
          satelliteUrl: satelliteUrl,
          scanProgress: scanProgress
        }
      });
      
      // Small delay to ensure email client opens
      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 500);
    } catch (error) {
      console.error('Error sending email:', error);
      setLoading(false);
      setStep('success'); // Still show success even if email fails
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700 relative my-8">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-50">
          <div className="flex items-center text-brand-red animate-pulse">
            <Satellite className="w-5 h-5 mr-2" />
            <span className="font-mono font-bold tracking-widest text-sm">LIVE SATELLITE LINK</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 min-h-[400px] flex flex-col">
          
          {/* STEP 1: ADDRESS */}
          {step === 'address' && (
            <div className="animate-fade-in flex-grow flex flex-col">
              <div className="mb-6 text-center">
                <Crosshair className="w-16 h-16 text-brand-red mx-auto mb-4 animate-spin-slow" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Ziel-Adresse definieren</h3>
                <p className="text-gray-500 mt-2 text-sm">Geben Sie die exakte Adresse ein für den Google Live-Link.</p>
              </div>
              <form onSubmit={handleAddressSubmit} className="space-y-4 mt-auto relative" ref={wrapperRef}>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Adresse</label>
                  <div className="relative">
                    <Map className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" 
                      value={address}
                      onChange={handleAddressInput}
                      onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                      placeholder="Straße, Hausnummer, PLZ Stadt"
                      autoFocus
                      autoComplete="off"
                    />
                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                       <div className="absolute z-50 w-full bg-white dark:bg-gray-800 mt-1 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                          {suggestions.map((item, idx) => (
                             <div 
                               key={idx}
                               onClick={() => selectAddress(item)}
                               className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200 border-b last:border-0 border-gray-100 dark:border-gray-700 truncate"
                             >
                               {item.displayName}
                             </div>
                          ))}
                       </div>
                    )}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading || address.length < 5}
                  className="w-full bg-brand-red text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-red-900/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Satellitensuche starten</>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: SCANNING (REAL IMAGE) */}
          {step === 'scanning' && (
            <div className="flex flex-col items-center justify-center h-full">
               <div className="relative w-full h-64 bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl mb-6 group">
                 {/* REAL SATELLITE IMAGE */}
                 {satelliteUrl && (
                   <img 
                     src={satelliteUrl} 
                     alt="Satellite View" 
                     className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale-[20%]"
                   />
                 )}
                 
                 {/* Grid Overlay for Professional Look */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>

                 {/* Radar Sweep */}
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(196,33,38,0.3)_360deg)] animate-spin-slow origin-center mix-blend-overlay"></div>
                 
                 <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded text-[10px] font-mono text-brand-red border border-brand-red/30 backdrop-blur-sm flex items-center">
                    <Wifi className="w-3 h-3 mr-1 animate-pulse" /> LIVE FEED
                 </div>
                 
                 {/* Crosshair with precise center dot */}
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-[180px] h-[180px] border border-brand-red/40 rounded-full flex items-center justify-center relative">
                      {/* Center Target */}
                      <div className="w-2 h-2 bg-brand-red rounded-full shadow-[0_0_10px_rgba(196,33,38,0.8)] animate-ping absolute"></div>
                      <div className="w-1 h-1 bg-white rounded-full absolute"></div>
                      
                      {/* Cross Lines */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-brand-red"></div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-brand-red"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-brand-red"></div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-brand-red"></div>
                   </div>
                 </div>

                 <div className="absolute bottom-0 left-0 w-full bg-black/80 text-brand-red font-mono text-xs p-2 text-center">
                    LAT: {coords?.lat.toFixed(5)} | LON: {coords?.lon.toFixed(5)} | ALT: 120m
                 </div>
               </div>
               
               <div className="w-full max-w-xs bg-gray-800 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-brand-red transition-all duration-75" style={{ width: `${scanProgress}%` }}></div>
               </div>
               <div className="mt-4 font-mono text-sm text-brand-red animate-pulse">
                 {scanProgress < 30 ? "VERBINDUNGSAUFBAU..." : scanProgress < 70 ? "OBJEKT-ANALYSE..." : "SCHWACHSTELLEN-BERECHNUNG..."}
               </div>
            </div>
          )}

          {/* STEP 3: CAPTCHA */}
          {step === 'captcha' && (
            <div className="animate-fade-in flex flex-col items-center justify-center h-full">
              <ShieldAlert className="w-12 h-12 text-amber-500 mb-2" />
              <h3 className="text-lg font-bold text-center mb-1 dark:text-white">Zugriff verifizieren</h3>
              <p className="text-center text-gray-500 mb-6 text-xs px-4">
                Bestätigen Sie die Anfrage, um den detaillierten Bericht zu sehen.
              </p>

              <div className="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 select-none">
                <div className="relative h-32 bg-gray-300 dark:bg-gray-900 rounded-lg overflow-hidden mb-6 group">
                   {/* Use the actual satellite image for the puzzle */}
                   <img 
                     src={satelliteUrl || "https://images.unsplash.com/photo-1558002038-109177381770?auto=format&fit=crop&w=400&q=80"} 
                     className="w-full h-full object-cover opacity-50 grayscale" 
                   />
                   <div className="absolute top-8 left-[70%] w-12 h-12 border-2 border-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.5)] rounded"></div>
                   
                   <div 
                     className="absolute top-8 w-12 h-12 bg-brand-red shadow-xl border-2 border-white cursor-grab active:cursor-grabbing rounded z-10"
                     style={{ left: `${sliderValue}%` }}
                   >
                      <Puzzle className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                   </div>
                </div>

                <input 
                  ref={sliderRef}
                  type="range" 
                  min="0" 
                  max="90" 
                  value={sliderValue}
                  onChange={handleSliderChange}
                  disabled={captchaVerified}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-brand-red"
                />
              </div>
            </div>
          )}

          {/* STEP 4: FORM */}
          {step === 'form' && (
            <div className="animate-fade-in h-full flex flex-col">
              <h3 className="text-xl font-bold mb-4 dark:text-white text-center">Bericht freischalten</h3>
              <p className="text-gray-500 text-xs text-center mb-6">Bitte ergänzen Sie Ihre Daten für die Auswertung.</p>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Vorname"
                      required
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-gray-900 dark:text-white text-sm"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="Nachname"
                      required
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-gray-900 dark:text-white text-sm"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                </div>
                
                <input 
                  type="email" 
                  placeholder="E-Mail Adresse"
                  required
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-gray-900 dark:text-white text-sm"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />

                 <input 
                  type="tel" 
                  placeholder="Mobilnummer (z.B. 017...)"
                  required
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all text-gray-900 dark:text-white text-sm"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                
                <div className="flex items-start gap-3 mt-2">
                  <input 
                    type="checkbox" 
                    id="modal_privacy" 
                    required 
                    checked={formData.privacyAccepted}
                    onChange={e => setFormData({...formData, privacyAccepted: e.target.checked})}
                    className="mt-1 h-4 w-4 rounded bg-gray-800 border-gray-700 text-brand-red focus:ring-brand-red" 
                  />
                  <label htmlFor="modal_privacy" className="text-[10px] text-gray-500 cursor-pointer">
                    Ich stimme der Verarbeitung meiner Daten gemäß <a href="https://www.blockalarm.de/datenschutz/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Datenschutz</a> zu.
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-brand-red text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center shadow-lg shadow-red-900/20 mt-2"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Jetzt Bericht anfordern"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'success' && (
            <div className="animate-fade-in h-full flex flex-col items-center justify-center">
               {/* Success Visualization with Grid Sector Analysis */}
               <div className="relative w-full h-56 rounded-xl overflow-hidden mb-6 border border-gray-700 shadow-lg">
                  {satelliteUrl && (
                    <img src={satelliteUrl} className="w-full h-full object-cover opacity-60 grayscale" />
                  )}
                  
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-[1px] bg-transparent">
                     {/* Generate grid cells */}
                     {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="border border-brand-red/20 relative">
                           {/* Randomly highlight some sectors as risky */}
                           {[2, 5, 9].includes(i) && (
                              <div className="absolute inset-0 bg-red-500/30 animate-pulse"></div>
                           )}
                        </div>
                     ))}
                  </div>

                  {/* Central Target */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-brand-red rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(196,33,38,0.5)]">
                     <Crosshair className="w-8 h-8 text-brand-red" />
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-red-900/80 text-white text-[10px] px-2 py-1 rounded font-mono border border-red-500 animate-pulse">
                    KRITISCHE ZONEN ERKANNT
                  </div>
               </div>

               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyse erfolgreich!</h3>
               <p className="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm leading-relaxed">
                 Wir haben die Satellitendaten für <span className="text-brand-red font-mono font-bold">{address}</span> ausgewertet.<br/>
                 Es wurden <span className="text-gray-900 dark:text-white font-bold">3 potenzielle Schwachstellen</span> in der Gebäudeumgebung identifiziert.
                 <br/><br/>
                 Ein Sicherheitsexperte kontaktiert Sie in Kürze unter <span className="text-gray-900 dark:text-white font-bold">{formData.phone}</span>, um den Bericht zu besprechen.
               </p>
               <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-sm border border-gray-600">
                 Fenster schließen
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};