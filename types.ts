import { LucideIcon } from 'lucide-react';

export enum Category {
  PROPERTY = 'Grundstück & Perimeter',
  ACCESS = 'Zugänge & Gebäudehülle',
  LIGHTING = 'Beleuchtung & Sicht',
  MECHANICS = 'Mechanischer Schutz',
  ELECTRONICS = 'Elektronische Sicherheit',
  ORG = 'Organisation & Prozesse',
  VALUABLES = 'Wertsachen & Risiko'
}

export interface Question {
  id: string;
  category: Category;
  text: string;
  subtext?: string;
  weight: number; // 1 (Low) to 5 (High impact)
  riskAnswer: boolean; // If true, choosing this answer INCREASES risk.
  recommendation: string;
  productMatch: string; // The display label (e.g. "Qolsys IQ Panel")
  productUrl: string; // The actual URL to the product page
}

export interface Answer {
  questionId: string;
  value: boolean | null; // null for "Weiß nicht"
}

export interface ScoringResult {
  totalScore: number; // 0 (Safe) to 100 (High Risk)
  riskLevel: 'Niedrig' | 'Mittel' | 'Kritisch';
  categoryScores: Record<Category, number>;
  topRisks: Question[];
  plz?: string; // Zip Code for BKA Heatmap
}

export type ScreenState = 'start' | 'quiz' | 'result';

export interface BKACrimeStats {
  plz: string;
  burglaryTrend: number; // percentage increase/decrease
  riskScore: number; // 1-10
  incidentsLastYear: number;
}

export interface LayoutProps {
  children: React.ReactNode;
  onGoHome?: () => void;
}