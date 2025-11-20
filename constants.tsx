import { Category, Question, BKACrimeStats } from './types';

// --- API CONFIGURATION ---
export const GOOGLE_MAPS_API_KEY = (process.env.GOOGLE_MAPS_API_KEY as string) || 'AIzaSyBrx0X0c_l9lRl_3KM4uIeMtGBn7LBe7CE'; // Static Maps
export const GOOGLE_GEOCODING_API_KEY = (process.env.GOOGLE_GEOCODING_API_KEY as string) || 'AIzaSyDz3KHBDPkUl6IxoWCRv1sQmWaSidHC7R4'; // Geocoding & Places
export const GEMINI_API_KEY = (process.env.GEMINI_API_KEY as string) || 'AIzaSyAB0dTIVBzIB-9SZkSo2UMVPuqvtUfAfkI';
export const APP_USER_AGENT = 'BlockalarmCheck/1.0 (hysa@blockalarm.de)';

export const BRAND_ASSETS = {
  logoBlack: 'https://www.blockalarm.de/wp-content/uploads/2022/09/Blockalarm-alarmanlagen-muenchen-logo-schwarz.png',
  logoWhite: 'https://www.blockalarm.de/wp-content/uploads/2022/09/Blockalarm-alarmanlagen-muenchen-logo-weiss-1.png',
};

// URLs for Blockalarm Product Pages - Verified URLs
const URLS = {
  HOME: 'https://www.blockalarm.de/',
  QOLSYS: 'https://www.blockalarm.de/qolsys-iq-panel-4/',
  OUTDOOR: 'https://www.blockalarm.de/alarmanlage-aussenbereich/',
  VIDEO: 'https://www.blockalarm.de/videoueberwachung/',
  COMMERCIAL: 'https://www.blockalarm.de/gewerbe-alarmanlagen/',
  HOUSE: 'https://www.blockalarm.de/haus-alarmanlage/',
  SERVICE: 'https://www.blockalarm.de/aufschaltung-leitstelle/', // 24h Fernüberwachung
  MECHANICAL: 'https://www.blockalarm.de/sicherheitstechnik/', 
  SMARTHOME: 'https://www.blockalarm.de/alarm-smart-home/', // Scharfschaltung Automatik & Anwesenheitssimulation
  SECURITY_CHECK: 'https://www.blockalarm.de/alarmanlage-kosten/', // Kostenloser Sicherheits-Check vor Ort
  ACCESS_CONTROL: 'https://www.blockalarm.de/gewerbe-alarmanlagen/', // Zutrittskontrolle (Commercial page)
};

// Simulation Logic for BKA Data based on PLZ
// Note: Real BKA data is not available via public free API. 
// We use the PLZ to generate a consistent, plausible risk profile for the "Heatmap" simulation
// but we will now combine it with REAL map data in the UI.
export const getBKARisk = (plz: string): BKACrimeStats => {
  const seed = parseInt(plz.substring(0, 2)) || 80;
  
  let trend = 0;
  let risk = 0;
  let incidents = 0;

  // High risk urban areas logic
  if (['10', '20', '40', '50', '60', '70', '80', '90'].includes(plz.substring(0, 2))) {
     trend = 12 + (seed % 8); // +12% to +20%
     risk = 8 + (seed % 2);   // 8-9/10
     incidents = 240 + (seed * 2);
  } else {
     trend = 4 + (seed % 6);  // +4% to +10%
     risk = 4 + (seed % 4);   // 4-7/10
     incidents = 80 + (seed * 3);
  }

  return {
    plz,
    burglaryTrend: trend,
    riskScore: risk,
    incidentsLastYear: incidents
  };
};

export const QUESTIONS: Question[] = [
  // --- Grundstück & Perimeter ---
  {
    id: 'q_per_1',
    category: Category.PROPERTY,
    text: 'Ist Ihr Grundstück vollständig umfriedet (Zaun, Mauer) und gegen Übersteigen gesichert?',
    subtext: 'Offene Grundstücke ermöglichen Tätern das unbemerkte Auskundschaften und Betreten.',
    weight: 3,
    riskAnswer: false, // No = Risk
    recommendation: 'Errichten Sie eine klare physische Barriere, um Gelegenheitsäter abzuschrecken.',
    productMatch: 'Außenhautüberwachung',
    productUrl: URLS.OUTDOOR
  },
  {
    id: 'q_per_2',
    category: Category.PROPERTY,
    text: 'Bietet Ihr Grundstück viele unübersichtliche Ecken, dichte Hecken oder Sichtschutzwände?',
    subtext: 'Einbrecher nutzen Deckung, um ungestört arbeiten zu können.',
    weight: 4,
    riskAnswer: true, // Yes = Risk
    recommendation: 'Reduzieren Sie Sichtbarrieren oder überwachen Sie tote Winkel elektronisch.',
    productMatch: 'Videoüberwachung Außenbereich',
    productUrl: URLS.VIDEO
  },

  // --- Beleuchtung & Sicht ---
  {
    id: 'q_light_1',
    category: Category.LIGHTING,
    text: 'Ist eine Bewegungsmelder-gesteuerte Außenbeleuchtung vorhanden?',
    subtext: 'Plötzliches Licht stört Täter empfindlich und alarmiert Nachbarn.',
    weight: 3,
    riskAnswer: false,
    recommendation: 'Licht schreckt ab. Installieren Sie LED-Strahler mit Bewegungssensoren an allen Zugängen.',
    productMatch: 'Gefahrenmeldeanlage mit Lichtsteuerung',
    productUrl: URLS.QOLSYS
  },
  {
    id: 'q_light_2',
    category: Category.LIGHTING,
    text: 'Sind Hausnummer und Eingangsbereich auch nachts gut sichtbar beleuchtet?',
    subtext: 'Wichtig für Polizei und Rettungskräfte im Ernstfall, um Ihr Objekt schnell zu finden.',
    weight: 1,
    riskAnswer: false,
    recommendation: 'Sorgen Sie für schnelle Auffindbarkeit durch Sicherheitskräfte im Alarmfall.',
    productMatch: 'Basisschutz für Immobilien',
    productUrl: URLS.HOUSE
  },

  // --- Zugänge & Gebäudehülle ---
  {
    id: 'q_acc_1',
    category: Category.ACCESS,
    text: 'Verfügen Fenster und Terrassentüren über pilzkopfverriegelte Beschläge (mind. RC2)?',
    subtext: 'Standard-Zapfen lassen sich mit einem Schraubendreher in wenigen Sekunden aufhebeln.',
    weight: 5,
    riskAnswer: false,
    recommendation: 'Rüsten Sie mechanische Sicherungen nach oder sichern Sie Fenster elektronisch ab.',
    productMatch: 'Glasbruch & Öffnungsmelder',
    productUrl: URLS.QOLSYS
  },
  {
    id: 'q_acc_2',
    category: Category.ACCESS,
    text: 'Gibt es Nebeneingänge, Kellerfenster oder Lichtschächte, die nicht extra gesichert sind?',
    subtext: 'Diese Bereiche sind oft schlecht einsehbar und daher beliebte Einstiegspunkte.',
    weight: 4,
    riskAnswer: true,
    recommendation: 'Sichern Sie Lichtschächte gegen Abheben und vergittern Sie Kellerfenster.',
    productMatch: 'Elektronische Außenhautsicherung',
    productUrl: URLS.OUTDOOR
  },
  {
    id: 'q_acc_3',
    category: Category.ACCESS,
    text: 'Befinden sich Kletterhilfen (Mülltonnen, Rankgitter, Carports) nahe am Gebäude?',
    subtext: 'Täter gelangen so leicht auf Balkone oder an Fenster im 1. Stock.',
    weight: 3,
    riskAnswer: true,
    recommendation: 'Entfernen Sie Aufstiegshilfen, die den Einstieg in obere Etagen erleichtern.',
    productMatch: 'Vorwarn-Systeme',
    productUrl: URLS.QOLSYS
  },

  // --- Mechanischer Schutz ---
  {
    id: 'q_mech_1',
    category: Category.MECHANICS,
    text: 'Ist der Profilzylinder der Eingangstür bündig mit dem Beschlag (kein Überstand > 3mm)?',
    subtext: 'Überstehende Zylinder können leicht abgebrochen werden ("Zieh-Methode").',
    weight: 3,
    riskAnswer: false,
    recommendation: 'Installieren Sie einen Sicherheitsbeschlag mit Zylinderschutz.',
    productMatch: 'Sicherheitstechnik',
    productUrl: URLS.MECHANICAL
  },
  {
    id: 'q_mech_2',
    category: Category.MECHANICS,
    text: 'Verfügt Ihre Eingangstür über eine Mehrfachverriegelung?',
    subtext: 'Einfache Schlösser bieten kaum Widerstand gegen körperliche Gewalt (Eintreten).',
    weight: 3,
    riskAnswer: false,
    recommendation: 'Nutzen Sie Schwenkriegelschlösser für erhöhten Aufbruchwiderstand.',
    productMatch: 'Sicherheitstechnik',
    productUrl: URLS.MECHANICAL
  },

  // --- Elektronische Sicherheit ---
  {
    id: 'q_elec_1',
    category: Category.ELECTRONICS,
    text: 'Ist bereits eine Einbruchmeldeanlage (Alarmanlage) installiert?',
    subtext: 'Studien belegen: Sichtbare Alarmanlagen vertreiben Einbrecher in den meisten Fällen sofort.',
    weight: 5,
    riskAnswer: false,
    recommendation: 'Eine VdS-konforme Alarmanlage ist der effektivste Schutz bei Abwesenheit.',
    productMatch: 'Qolsys IQ Panel 4',
    productUrl: URLS.QOLSYS
  },
  {
    id: 'q_elec_2',
    category: Category.ELECTRONICS,
    text: 'Ist Ihre Anlage auf eine 24/7 Notruf- und Serviceleitstelle (NSL) aufgeschaltet?',
    subtext: 'Ein lokaler Alarm wird oft von Nachbarn ignoriert oder nicht gehört.',
    weight: 5,
    riskAnswer: false,
    recommendation: 'Nur eine Aufschaltung garantiert professionelle Intervention rund um die Uhr.',
    productMatch: '24h Fernüberwachung',
    productUrl: URLS.SERVICE
  },
  {
    id: 'q_elec_3',
    category: Category.ELECTRONICS,
    text: 'Gibt es eine Videoüberwachung mit Aufzeichnung und Fernzugriff?',
    subtext: 'Videoüberwachung dient der Täterabschreckung und Beweissicherung.',
    weight: 3,
    riskAnswer: false,
    recommendation: 'Videoüberwachung hilft bei der Täteridentifizierung und Alarmverifikation.',
    productMatch: 'Videoüberwachung & KI',
    productUrl: URLS.VIDEO
  },

  // --- Organisation ---
  {
    id: 'q_org_1',
    category: Category.ORG,
    text: 'Haben Sie eine klare Übersicht, wer alles Schlüssel zu Ihrem Objekt besitzt?',
    subtext: 'Verlorene oder unkontrollierte Schlüssel sind ein hohes Sicherheitsrisiko.',
    weight: 2,
    riskAnswer: false,
    recommendation: 'Tauschen Sie Schließzylinder aus, wenn Schlüssel verloren gegangen sind.',
    productMatch: 'Zutrittskontrolle',
    productUrl: URLS.ACCESS_CONTROL // Commercial/Gewerbe page for access control
  },
  {
    id: 'q_org_2',
    category: Category.ORG,
    text: 'Schließen Sie auch bei kurzer Abwesenheit alle Fenster und Türen komplett ab?',
    subtext: 'Gekippte Fenster sind offene Fenster. Versicherungen zahlen hier oft nicht.',
    weight: 4,
    riskAnswer: false,
    recommendation: 'Gewöhnen Sie sich eine strikte Verschlussroutine an ("Konsequentes Handeln").',
    productMatch: 'Scharfschaltung Automatik',
    productUrl: URLS.SMARTHOME // Smart Home Automation
  },
  
  // --- Wertsachen & Risiko ---
  {
    id: 'q_val_1',
    category: Category.VALUABLES,
    text: 'Werden Bargeld, Schmuck oder sensible Daten offen aufbewahrt?',
    subtext: 'Gelegenheit macht Diebe – auch bei flüchtigen Einbrüchen zählen Sekunden.',
    weight: 4,
    riskAnswer: true,
    recommendation: 'Nutzen Sie zertifizierte Wertschutzschränke (Tresore) für Wertsachen.',
    productMatch: 'Objektschutz & Alarm',
    productUrl: URLS.COMMERCIAL
  },
  {
    id: 'q_val_2',
    category: Category.VALUABLES,
    text: 'Ist Ihr Objekt bei Abwesenheit (Urlaub/Wochenende) als unbewohnt erkennbar?',
    subtext: 'Überfüllte Briefkästen oder dauerhaft dunkle Fenster signalisieren "Freie Bahn".',
    weight: 3,
    riskAnswer: true,
    recommendation: 'Simulieren Sie Anwesenheit durch Zeitschaltuhren oder Smart-Home-Lösungen.',
    productMatch: 'Smarthome Simulation',
    productUrl: URLS.SMARTHOME
  }
];