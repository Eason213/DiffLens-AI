export enum AppScreen {
  HOME = 'HOME',
  API_KEY_INPUT = 'API_KEY_INPUT',
  CAMERA_SELECTION = 'CAMERA_SELECTION',
  CAMERA_CAPTURE = 'CAMERA_CAPTURE',
  UPLOAD_SELECTION = 'UPLOAD_SELECTION',
  UPLOAD_FILE = 'UPLOAD_FILE',
  ANALYSIS_RESULT = 'ANALYSIS_RESULT'
}

export enum SetType {
  SET_1 = '第一份資料',
  SET_2 = '第二份資料',
  NONE = '無'
}

export interface DocItem {
  id: string;
  type: 'image' | 'text' | 'file'; // 'file' handles PDF, Word, Excel as DataURL
  content: string; // Base64 for images/files, string for text
  name: string;
  timestamp: number;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: string | null;
  error: string | null;
}