export enum InteractionStatus {
  SAFE = 'Safe',
  CAUTION = 'Caution',
  WARNING = 'Warning',
  DANGEROUS = 'Dangerous',
}

export enum SeverityLevel {
  NONE = 'None',
  MINOR = 'Minor',
  MODERATE = 'Moderate',
  SEVERE = 'Severe',
}

export interface InteractionResult {
  interactionStatus: InteractionStatus;
  severityLevel: SeverityLevel;
  interactionDetails: string;
  recommendations: string;
  additionalNotes: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  medications: string;
  food: string;
  result: InteractionResult;
  isFavorite?: boolean;
}