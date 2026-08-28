import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../api/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialToken = localStorage.getItem('ekyc_token');
const initialUser = localStorage.getItem('ekyc_user') ? JSON.parse(localStorage.getItem('ekyc_user')!) : null;

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; access_token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
      localStorage.setItem('ekyc_token', action.payload.access_token);
      localStorage.setItem('ekyc_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ekyc_token');
      localStorage.removeItem('ekyc_user');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
