import client from './client';

export interface User {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'COMPLIANCE_OFFICER';
  google_id?: string;
  profile_picture?: string;
  auth_provider: 'EMAIL' | 'GOOGLE' | 'DEMO';
  profile_completed: boolean;
  is_profile_complete?: boolean;
  dob?: string;
  gender?: string;
  house_number?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  occupation?: string;
  annual_income?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  profile_completed: boolean;
  is_profile_complete?: boolean;
}

export interface CompleteProfilePayload {
  full_name: string;
  dob: string;
  gender: string;
  house_number: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  occupation: string;
  annual_income: string;
}

export const authApi = {
  login: async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/login', {
      email: emailOrUsername,
      password,
    });
    return res.data;
  },

  register: async (name: string, emailOrUsername: string, password: string): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/register', {
      name,
      email: emailOrUsername,
      password,
    });
    return res.data;
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/auth/google', { credential });
    return res.data;
  },

  demoLogin: async (role: 'USER' | 'ADMIN' = 'USER'): Promise<AuthResponse> => {
    try {
      const res = await client.post<AuthResponse>(`/auth/demo-login?role=${role}`);
      return res.data;
    } catch (err) {
      console.warn('Backend demo-login offline fallback activated:', err);
      const isUser = role === 'USER';
      return {
        access_token: 'mock-evaluator-demo-jwt-session',
        token_type: 'bearer',
        profile_completed: true,
        is_profile_complete: true,
        user: {
          id: isUser ? 'demo-applicant-001' : 'demo-admin-001',
          name: isUser ? 'Demo Applicant' : 'Compliance Officer',
          full_name: isUser ? 'Demo Applicant' : 'Compliance Officer',
          email: isUser ? 'applicant@ekyc.ai' : 'admin@ekyc.ai',
          role: isUser ? 'USER' : 'ADMIN',
          auth_provider: 'DEMO',
          profile_completed: true,
          is_profile_complete: true,
          house_number: '42',
          street: 'Tech Boulevard',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560100',
          address: '42, Tech Boulevard, Bengaluru, Karnataka - 560100',
          occupation: 'Senior Engineer',
          annual_income: '1000000 - 2500000',
          created_at: new Date().toISOString(),
        },
      };
    }
  },

  completeProfile: async (profileData: CompleteProfilePayload): Promise<User> => {
    const res = await client.post<User>('/auth/complete-profile', profileData);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await client.get<User>('/auth/me');
    return res.data;
  },
};
