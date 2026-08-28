import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KYCRecord } from '../api/kycApi';

interface KYCState {
  currentRecord: KYCRecord | null;
  records: KYCRecord[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: KYCState = {
  currentRecord: null,
  records: [],
  loading: false,
  submitting: false,
  error: null,
};

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {
    setCurrentRecord: (state, action: PayloadAction<KYCRecord | null>) => {
      state.currentRecord = action.payload;
    },
    setRecords: (state, action: PayloadAction<KYCRecord[]>) => {
      state.records = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.submitting = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCurrentRecord, setRecords, setSubmitting, setLoading, setError } = kycSlice.actions;
export default kycSlice.reducer;
