export type ErrorType =
  | 'copula_omitted'
  | 'article_missing'
  | 'article_spurious'
  | 'aspect_confused'
  | 'pronoun_dropped'
  | 'word_order_vso'
  | 'plural_irregular'
  | 'preposition_transfer';

export interface ConceptExample {
  source: string;
  target: string;
  blocks: string[];
}

export interface ConceptNode {
  id: string;
  family: string;
  source_pattern: string;
  target_pattern: string;
  contrast_note: string;
  examples: ConceptExample[];
  common_errors: ErrorType[];
  prerequisites: string[];
  cefr_band: 'A1+' | 'A2' | 'B1' | 'B2' | 'C1';
  transfer_weight: number;
  tracks: ('general' | 'academic' | 'sustainability')[];
}

export interface LearnerState {
  concept_id: string;
  mastery: number;
  ease: number;
  interval: number;
  next_due: number;
  error_signature: Record<ErrorType, number>;
}
