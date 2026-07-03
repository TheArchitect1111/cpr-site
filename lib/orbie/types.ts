export type OrbieUrgency = 'low' | 'medium' | 'high';

export interface OrbieSpecialist {
  id: string;
  name: string;
  role: string;
}

export interface OrbieGuidanceStep {
  title: string;
  reason: string;
  outcome: string;
  actionLabel: string;
  href?: string;
}

export interface OrbiePossibility {
  id: string;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
  specialistId: string;
  targetSelector: string;
  targetLabel: string;
  steps: OrbieGuidanceStep[];
  urgency?: OrbieUrgency;
  completionMessage: string;
}

export interface OrbieContext {
  productId: string;
  organizationName: string;
  accentColor: string;
  area: string;
  status: string;
  primary: OrbiePossibility;
  secondary: OrbiePossibility[];
  specialists: OrbieSpecialist[];
  helpTopics: string[];
  memorySignals: string[];
  smartchitectureChecks: string[];
}
