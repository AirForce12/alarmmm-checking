import { Answer, Category, Question, ScoringResult } from '../types';
import { QUESTIONS } from '../constants';

interface RiskCombination {
  id: string;
  category: Category;
  name: string;
  description: string;
  condition: (answers: Answer[]) => boolean;
  weightPenalty: number;
  recommendation: string;
  productMatch: string;
  productUrl: string;
}

// Definitions of combined risks (e.g. "Darkness + Hidden" = Extra Risk)
const RISK_COMBINATIONS: RiskCombination[] = [
  {
    id: 'combo_dark_hidden',
    category: Category.PROPERTY,
    name: 'Kritisch: Dunkelheit & Verstecke',
    description: 'Ihr Grundstück ist nachts dunkel und bietet gleichzeitig Sichtschutz für Täter. Eine ideale Einladung.',
    condition: (answers) => 
      checkAnswerMatchesRisk(answers, 'q_per_2') && // Hidden spots = YES (Risk)
      checkAnswerMatchesRisk(answers, 'q_light_1'), // No lights = NO (Risk)
    weightPenalty: 10,
    recommendation: 'Kombinieren Sie Bewegungsmelder mit Videoüberwachung in toten Winkeln.',
    productMatch: 'Videoüberwachung & Außenlicht',
    productUrl: 'https://www.blockalarm.de/videoueberwachung/'
  },
  {
    id: 'combo_easy_entry',
    category: Category.ACCESS,
    name: 'Hohes Einbruchrisiko',
    description: 'Fenster sind mechanisch ungesichert und es fehlt eine Alarmanlage zur Abschreckung.',
    condition: (answers) => 
      checkAnswerMatchesRisk(answers, 'q_acc_1') && // Windows insecure (Risk)
      checkAnswerMatchesRisk(answers, 'q_elec_1'), // No Alarm (Risk)
    weightPenalty: 15,
    recommendation: 'Mechanische Sicherung verzögert nur. Ohne Alarm haben Täter zu viel Zeit. Dringend nachrüsten!',
    productMatch: 'Qolsys IQ Panel 4',
    productUrl: 'https://www.blockalarm.de/qolsys-iq-panel-4/'
  },
  {
    id: 'combo_value_protection',
    category: Category.VALUABLES,
    name: 'Wertsachen akut gefährdet',
    description: 'Offen gelagerte Wertsachen ohne Alarmüberwachung sind leichte Beute.',
    condition: (answers) => 
      checkAnswerMatchesRisk(answers, 'q_val_1') && // Valuables open (Risk)
      checkAnswerMatchesRisk(answers, 'q_elec_1'), // No Alarm (Risk)
    weightPenalty: 12,
    recommendation: 'Installieren Sie einen Tresor und sichern Sie den Raum elektronisch.',
    productMatch: 'Objektschutz & Alarm',
    productUrl: 'https://www.blockalarm.de/gewerbe-alarmanlagen/'
  }
];

/**
 * Helper to check if an answer corresponds to the "Risk" state defined in the Question.
 * If the answer is missing or "Don't know", we treat it as Risk (Conservative approach).
 */
function checkAnswerMatchesRisk(answers: Answer[], questionId: string): boolean {
  const q = QUESTIONS.find(quest => quest.id === questionId);
  if (!q) return false;
  
  const a = answers.find(ans => ans.questionId === questionId);
  if (!a) return true; // Missing answer treated as risk
  if (a.value === null) return true; // "Weiß nicht" treated as risk
  
  return a.value === q.riskAnswer;
}

/**
 * Calculates the risk score based on user answers.
 * Features:
 * - Weighted sum of risks
 * - Compound risk penalties (Combinations of bad answers)
 * - Uncertainty penalty (Too many "Don't knows")
 * - Normalized 0-100 Score
 */
export const calculateScore = (answers: Answer[]): ScoringResult => {
  let totalPossibleWeight = 0;
  let currentRiskWeight = 0;
  let unknownCount = 0;
  
  const categoryRisks: Record<Category, { current: number; total: number }> = {
    [Category.PROPERTY]: { current: 0, total: 0 },
    [Category.ACCESS]: { current: 0, total: 0 },
    [Category.LIGHTING]: { current: 0, total: 0 },
    [Category.MECHANICS]: { current: 0, total: 0 },
    [Category.ELECTRONICS]: { current: 0, total: 0 },
    [Category.ORG]: { current: 0, total: 0 },
    [Category.VALUABLES]: { current: 0, total: 0 },
  };

  const topRisks: Question[] = [];

  // 1. Base Scoring Loop
  QUESTIONS.forEach((q) => {
    const answer = answers.find((a) => a.questionId === q.id);
    
    // Add to max potential totals
    totalPossibleWeight += q.weight;
    if (categoryRisks[q.category]) {
      categoryRisks[q.category].total += q.weight;
    }

    let isRisk = false;
    
    if (!answer) {
      isRisk = true; // Treated as risk if missing
    } else if (answer.value === null) {
      isRisk = true; // Treated as risk if unknown
      unknownCount++;
    } else if (answer.value === q.riskAnswer) {
      isRisk = true; // Confirmed risk
    }

    if (isRisk) {
      currentRiskWeight += q.weight;
      if (categoryRisks[q.category]) {
        categoryRisks[q.category].current += q.weight;
      }
      
      // Identify individual High Risks (Weight >= 4)
      if (q.weight >= 4) {
        topRisks.push(q);
      }
    }
  });

  // 2. Apply Compound Risk Penalties
  RISK_COMBINATIONS.forEach(combo => {
    if (combo.condition(answers)) {
      currentRiskWeight += combo.weightPenalty;
      
      if (categoryRisks[combo.category]) {
        categoryRisks[combo.category].current += combo.weightPenalty;
      }

      // Add as a synthetic "Question" for the Top Risks display
      topRisks.push({
        id: combo.id,
        category: combo.category,
        text: combo.name,
        subtext: combo.description,
        weight: combo.weightPenalty,
        riskAnswer: true, 
        recommendation: combo.recommendation,
        productMatch: combo.productMatch,
        productUrl: combo.productUrl
      });
    }
  });

  // 3. Uncertainty Penalty
  if (unknownCount > 2) {
    const penalty = unknownCount * 2;
    currentRiskWeight += penalty;
    
    if (categoryRisks[Category.ORG]) {
      categoryRisks[Category.ORG].current += penalty;
    }

    topRisks.push({
      id: 'uncertainty_penalty',
      category: Category.ORG,
      text: 'Unklarer Sicherheitsstatus',
      subtext: `Sie haben ${unknownCount} Fragen mit "Weiß nicht" beantwortet.`,
      weight: 6, // Very high priority
      riskAnswer: true,
      recommendation: 'Unwissenheit schützt nicht vor Schaden. Eine professionelle Bestandsaufnahme ist dringend ratsam.',
      productMatch: 'Kostenloser Sicherheits-Check vor Ort',
      productUrl: 'https://www.blockalarm.de/alarmanlage-kosten/'
    });
  }

  // 4. Normalize and Cap Scores
  const rawTotalScore = totalPossibleWeight > 0 ? (currentRiskWeight / totalPossibleWeight) * 100 : 0;
  const finalScore = Math.min(100, Math.round(rawTotalScore));

  const categoryScoresNormalized: any = {};
  Object.keys(categoryRisks).forEach((key) => {
    const cat = key as Category;
    const data = categoryRisks[cat];
    const catScore = data.total > 0 ? (data.current / data.total) * 100 : 0;
    categoryScoresNormalized[cat] = Math.min(100, Math.round(catScore));
  });

  // 5. Determine Verbal Risk Level
  let riskLevel: 'Niedrig' | 'Mittel' | 'Kritisch' = 'Niedrig';
  if (finalScore >= 35) riskLevel = 'Mittel';
  if (finalScore >= 65) riskLevel = 'Kritisch';

  return {
    totalScore: finalScore,
    riskLevel,
    categoryScores: categoryScoresNormalized,
    topRisks: topRisks.sort((a, b) => b.weight - a.weight).slice(0, 5),
  };
};