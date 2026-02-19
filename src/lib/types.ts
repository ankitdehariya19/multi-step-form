export interface PersonalDetails {
  fullName: string;
  email: string;
  phone?: string;
  address: string;
}

export type GrievanceCategory =
  | 'Service Issue'
  | 'Billing'
  | 'Technical Support'
  | 'Refund'
  | 'Other';

export interface GrievanceDetails {
  category: GrievanceCategory;
  subject: string;
  description: string;
  incidentDate: string;
}

export interface DocumentFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

export interface DocumentsDetails {
  files: DocumentFile[];
}

export interface FormData extends PersonalDetails, GrievanceDetails, DocumentsDetails {
  agreedToTerms: boolean;
}

export type FormStep = 'personal' | 'grievance' | 'documents' | 'review';

export interface FormState {
  currentStep: number;
  data: FormData;
  isLoaded: boolean;
}

export type FormErrors = Partial<Record<keyof FormData, string>>;

