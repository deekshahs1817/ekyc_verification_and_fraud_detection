import client from './client';

export interface XAIRiskFactor {
  feature: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  contribution_score: number;
}

export interface KYCRecord {
  id: string;
  user_id: string;
  user_email?: string;

  entered_name: string;
  entered_dob: string;
  entered_gender: string;
  entered_phone: string;
  entered_email: string;
  entered_address: string;
  entered_occupation?: string;
  entered_annual_income?: string;
  entered_aadhaar: string;
  entered_pan: string;

  ocr_name?: string;
  ocr_dob?: string;
  ocr_phone?: string;
  ocr_address?: string;
  ocr_aadhaar?: string;
  ocr_pan?: string;
  ocr_raw_text?: string;
  ocr_details?: {
    aadhaar?: { uploaded: boolean; fields: Record<string, string | null>; raw_text: string; lines: string[] };
    pan?: { uploaded: boolean; fields: Record<string, string | null>; raw_text: string; lines: string[] };
    utility?: { uploaded: boolean; fields: Record<string, string | null>; raw_text: string; lines: string[] };
  };

  aadhaar_path?: string;
  pan_path?: string;
  utility_path?: string;
  selfie_path?: string;
  tamper_heatmap_path?: string;
  report_pdf_path?: string;

  doc_type_detected?: string;
  doc_classification_confidence: number;
  aadhaar_checksum_valid: boolean;
  pan_format_valid: boolean;

  name_similarity: number;
  address_similarity: number;
  dob_match: boolean;
  phone_match: boolean;
  aadhaar_match: boolean;
  pan_match: boolean;
  consistency_score: number;

  face_score: number;
  liveness_score: number;
  tamper_score: number;
  blur_score: number;

  duplicate_flag: boolean;
  duplicate_count: number;
  duplicate_details?: any;

  aml_flag: boolean;
  aml_reasons?: string[];

  fraud_score: number;
  trust_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED';

  xai_risk_factors?: XAIRiskFactor[];

  reviewer_id?: string;
  reviewer_name?: string;
  review_notes?: string;
  reviewed_at?: string;

  created_at: string;
  updated_at: string;
}

export const kycApi = {
  submitKYC: async (formData: FormData): Promise<KYCRecord> => {
    const res = await client.post<KYCRecord>('/kyc/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getMyRecords: async (): Promise<KYCRecord[]> => {
    const res = await client.get<KYCRecord[]>('/kyc/my-records');
    return res.data;
  },

  getRecordById: async (id: string): Promise<KYCRecord> => {
    const res = await client.get<KYCRecord>(`/kyc/record/${id}`);
    return res.data;
  },
};
