export type Urgency = "routine" | "monitor" | "urgent" | "emergency";

export const URGENCY_LEVELS: Urgency[] = ["routine", "monitor", "urgent", "emergency"];

export type SymptomItem = { name: string; severity: number };

export type EntryAnalysis = {
  summary: string;
  patterns: string[];
  urgency: Urgency;
  urgencyReason: string;
  questions: string[];
  generatedAt: string;
};

export type BriefContent = {
  title: string;
  overview: string;
  timeline: { period: string; description: string; peakSeverity: number | null }[];
  symptomSummary: { symptom: string; frequency: string; severityRange: string; bodyAreas: string }[];
  patterns: string[];
  lifestyleCorrelations: string[];
  medications: string[];
  urgencyNote: string;
  questions: string[];
  generatedAt: string;
};

export type BriefStats = {
  entryCount: number;
  avgSeverity: number;
  peakSeverity: number;
  peakDate: string | null;
  avgSleep: number;
  avgMood: number;
  avgStress: number;
  avgEnergy: number;
  topSymptoms: { name: string; count: number; avgSeverity: number }[];
};

export const MEDICAL_DISCLAIMER =
  "MediLog is a personal record-keeping and information tool. It does not diagnose, treat, or prevent any condition and is not a substitute for professional medical advice. AI-generated content may be incomplete or inaccurate. Always consult a qualified healthcare professional about your symptoms. If you think you may be having a medical emergency, call your local emergency number immediately.";

export const BODY_PARTS = [
  "Head",
  "Eyes",
  "Ears",
  "Throat",
  "Neck",
  "Chest",
  "Heart area",
  "Stomach",
  "Abdomen",
  "Upper back",
  "Lower back",
  "Shoulders",
  "Arms",
  "Hands",
  "Hips",
  "Legs",
  "Knees",
  "Feet",
  "Joints",
  "Skin",
  "Whole body",
];

export const COMMON_TRIGGERS = [
  "Stress",
  "Lack of sleep",
  "Certain foods",
  "Exercise",
  "Weather change",
  "Caffeine",
  "Alcohol",
  "Screen time",
  "Skipped meal",
  "Dehydration",
];
