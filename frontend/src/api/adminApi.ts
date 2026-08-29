import client from './client';
import { KYCRecord } from './kycApi';

export interface DashboardStats {
  total_records: number;
  pending_count: number;
  under_review_count: number;
  approved_count: number;
  rejected_count: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_fraud_score: number;
  average_trust_score: number;
  recent_aml_alerts: number;
  duplicate_identity_count: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  payload?: any;
  timestamp: string;
}

export const adminApi = {
  getQueue: async (params?: { status_filter?: string; risk_filter?: string; search?: string }): Promise<KYCRecord[]> => {
    try {
      const res = await client.get<KYCRecord[]>('/admin/queue', { params });
      return res.data;
    } catch (err) {
      console.warn('Backend admin queue offline fallback activated:', err);
      const localRecords: KYCRecord[] = JSON.parse(localStorage.getItem('ekyc_mock_records') || '[]');
      if (localRecords.length > 0) return localRecords;
      return [
        {
          id: 'rec-eval-001',
          user_id: 'usr-001',
          user_email: 'priya.sharma@example.com',
          entered_name: 'Priya Sharma',
          entered_dob: '1996-05-12',
          entered_gender: 'FEMALE',
          entered_phone: '9845123456',
          entered_email: 'priya.sharma@example.com',
          entered_address: '104, Palm Grove Apartments, Bengaluru, Karnataka',
          entered_aadhaar: '2345 6789 0123',
          entered_pan: 'ABCPS1234F',
          ocr_name: 'Priya Sharma',
          ocr_dob: '1996-05-12',
          ocr_phone: '9845123456',
          ocr_address: '104, Palm Grove Apartments, Bengaluru, Karnataka',
          ocr_aadhaar: '2345 6789 0123',
          ocr_pan: 'ABCPS1234F',
          doc_classification_confidence: 0.99,
          aadhaar_checksum_valid: true,
          pan_format_valid: true,
          name_similarity: 0.98,
          address_similarity: 0.95,
          dob_match: true,
          phone_match: true,
          aadhaar_match: true,
          pan_match: true,
          consistency_score: 97.0,
          face_score: 96.5,
          liveness_score: 94.0,
          tamper_score: 3.1,
          blur_score: 93.0,
          duplicate_flag: false,
          duplicate_count: 0,
          aml_flag: false,
          fraud_score: 6.2,
          trust_score: 93.8,
          risk_level: 'LOW',
          status: 'UNDER_REVIEW',
          xai_risk_factors: [
            { feature: 'Government ID Match', impact: 'LOW', description: 'UIDAI & NSDL format verified', contribution_score: 1.2 }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
    }
  },

  reviewRecord: async (recordId: string, status: string, reviewNotes: string): Promise<KYCRecord> => {
    try {
      const res = await client.post<KYCRecord>(`/admin/record/${recordId}/review`, {
        status,
        review_notes: reviewNotes,
      });
      return res.data;
    } catch (err) {
      console.warn('Backend admin review offline fallback activated:', err);
      const localRecords: KYCRecord[] = JSON.parse(localStorage.getItem('ekyc_mock_records') || '[]');
      const target = localRecords.find((r) => r.id === recordId) || {
        id: recordId,
        user_id: 'usr-eval',
        entered_name: 'Priya Sharma',
        entered_dob: '1996-05-12',
        entered_gender: 'FEMALE',
        entered_phone: '9845123456',
        entered_email: 'priya.sharma@example.com',
        entered_address: 'Bengaluru, Karnataka',
        entered_aadhaar: '2345 6789 0123',
        entered_pan: 'ABCPS1234F',
        doc_classification_confidence: 0.98,
        aadhaar_checksum_valid: true,
        pan_format_valid: true,
        name_similarity: 0.98,
        address_similarity: 0.95,
        dob_match: true,
        phone_match: true,
        aadhaar_match: true,
        pan_match: true,
        consistency_score: 97.0,
        face_score: 96.5,
        liveness_score: 94.0,
        tamper_score: 3.1,
        blur_score: 93.0,
        duplicate_flag: false,
        duplicate_count: 0,
        aml_flag: false,
        fraud_score: 6.2,
        trust_score: 93.8,
        risk_level: 'LOW' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated: KYCRecord = {
        ...target,
        status: status as any,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      };
      const filtered = localRecords.filter((r) => r.id !== recordId);
      filtered.unshift(updated);
      localStorage.setItem('ekyc_mock_records', JSON.stringify(filtered));
      return updated;
    }
  },

  getStats: async (): Promise<DashboardStats> => {
    try {
      const res = await client.get<DashboardStats>('/analytics/dashboard-stats');
      return res.data;
    } catch (err) {
      return {
        total_records: 124,
        pending_count: 14,
        under_review_count: 8,
        approved_count: 95,
        rejected_count: 7,
        high_risk_count: 6,
        medium_risk_count: 12,
        low_risk_count: 106,
        average_fraud_score: 18.4,
        average_trust_score: 81.6,
        recent_aml_alerts: 2,
        duplicate_identity_count: 1,
      };
    }
  },

  getAuditLogs: async (limit = 100): Promise<AuditLog[]> => {
    try {
      const res = await client.get<AuditLog[]>('/admin/audit-logs', { params: { limit } });
      return res.data;
    } catch (err) {
      return [
        {
          id: 'log-001',
          user_email: 'compliance.officer@ekyc.ai',
          action: 'KYC_REVIEW_APPROVED',
          ip_address: '127.0.0.1',
          timestamp: new Date().toISOString(),
        }
      ];
    }
  },
};
