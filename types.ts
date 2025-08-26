
export type InputType = 'idea' | 'url';

export interface KeywordData {
  text: string;
  volume: number | null;
  loading?: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Competitor {
  title: string;
  url: string;
}

export interface CompetitorAnalysis {
  targetKeyword: string;
  competitors: Competitor[];
}

export interface OptimizationPlan {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h2: string[];
  h3: string[];
  h4: string[];
  faqs: FAQ[];
  contentStrategyFramework: string;
  blogIdeas: string[];
  internalLinking: string;
  competitorAnalysis: CompetitorAnalysis;
}