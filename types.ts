
export interface UnpackedCraft {
  context: string;
  role: string;
  action: string;
  format: string;
  target: string;
}

export interface Feedback {
  context: string;
  role: string;
  action: string;
  format: string;
  target: string;
  overall: string;
}

export interface AnalysisResult {
  score: number;
  unpacked: UnpackedCraft;
  feedback: Feedback;
  improvedPrompt: string;
  promptClassification: string;
  classificationFeedback: string;
}

export interface AttachedFile {
  name: string;
  mimeType: string;
  data: string; // base64 encoded data
}