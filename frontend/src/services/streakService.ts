export interface StreakDay {
  date: string;
  label: string;
  dayNumber: number;
  status: "COMPLETED" | "ACTIVE_TODAY" | "UPCOMING";
  activitiesCount: number;
  milestones: string[];
}

export interface UserStreak {
  currentStreak: number;
  totalActiveDays: number;
  workedAug29: boolean;
  workedAug30: boolean;
  streakDays: string[];
  status: string;
  history: StreakDay[];
}

const STORAGE_KEY = "ekyc_developer_streak_data";

export const getDeveloperStreak = (): UserStreak => {
  const defaultStreak: UserStreak = {
    currentStreak: 2,
    totalActiveDays: 2,
    workedAug29: true,
    workedAug30: true,
    streakDays: ["2026-08-29", "2026-08-30"],
    status: "ACTIVE_ON_TRACK",
    history: [
      {
        date: "2026-08-29",
        label: "Saturday, Aug 29",
        dayNumber: 1,
        status: "COMPLETED",
        activitiesCount: 8,
        milestones: [
          "Full-Stack eKYC Architecture & Database Modeling",
          "PaddleOCR & EasyOCR Multimodal Extraction Engine",
          "InsightFace Biometric Cosine Similarity Verifier",
          "CNN Error Level Analysis (ELA) Tamper Heatmaps",
          "Verhoeff Aadhaar & Regex PAN Validation",
        ],
      },
      {
        date: "2026-08-30",
        label: "Sunday, Aug 30",
        dayNumber: 2,
        status: "ACTIVE_TODAY",
        activitiesCount: 12,
        milestones: [
          "Cloudflare Pages SPA Routing & Redirects (_redirects, _headers)",
          "Cloudflare CORS Multi-Origin Regex Configuration",
          "GitHub Source Sync: ekyc_verification_and_fraud_detection",
          "Real-Time Audit Logs & Notifications Engine",
          "Automated Certified PDF Verification Reports & XAI",
        ],
      },
    ],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStreak));
      return defaultStreak;
    }
    const parsed = JSON.parse(raw) as UserStreak;
    if (parsed.currentStreak < 2 || !parsed.workedAug29 || !parsed.workedAug30) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStreak));
      return defaultStreak;
    }
    return parsed;
  } catch {
    return defaultStreak;
  }
};

export const recordDailyActivity = (): UserStreak => {
  const current = getDeveloperStreak();
  current.workedAug30 = true;
  current.currentStreak = Math.max(2, current.currentStreak);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
};