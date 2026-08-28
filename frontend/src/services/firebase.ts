import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  ConfirmationResult,
  UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCswfDNBG4NOgFFGHVRxmWjrJAPHEnOvnU',
  authDomain: 'ekyc-verification-system-f2a61.firebaseapp.com',
  projectId: 'ekyc-verification-system-f2a61',
  storageBucket: 'ekyc-verification-system-f2a61.firebasestorage.app',
  messagingSenderId: '600382410053',
  appId: '1:600382410053:web:de5043e33a5874f4c2422c',
  measurementId: 'G-1QFP3YTJFN',
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Initializes invisible/visible RecaptchaVerifier on the specified DOM element
 */
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  // Clear any existing verifier on window if present
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      console.warn('Clearing previous recaptcha:', e);
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved successfully.');
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired. User must retry.');
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
};

/**
 * Initiates Phone Number OTP verification
 */
export const sendPhoneOtp = async (
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

/**
 * Triggers Google Sign-In popup via Firebase
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  return await signInWithPopup(auth, googleProvider);
};

export default app;
