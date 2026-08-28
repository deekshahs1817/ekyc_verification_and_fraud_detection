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
    const res = await client.get<KYCRecord[]>('/admin/queue', { params });
    return res.data;
  },

  reviewRecord: async (recordId: string, status: string, reviewNotes: string): Promise<KYCRecord> => {
    const res = await client.post<KYCRecord>(`/admin/record/${recordId}/review`, {
      status,
      review_notes: reviewNotes,
    });
    return res.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    const res = await client.get<DashboardStats>('/analytics/dashboard-stats');
    return res.data;
  },

  getAuditLogs: async (limit = 100): Promise<AuditLog[]> => {
    const res = await client.get<AuditLog[]>('/admin/audit-logs', { params: { limit } });
    return res.data;
  },
};
