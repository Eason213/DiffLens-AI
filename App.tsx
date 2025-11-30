import React, { useState, useEffect } from 'react';
import { AppScreen, SetType, DocItem, AnalysisState } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { CameraScreen } from './screens/CameraScreen';
import { UploadScreen } from './screens/UploadScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { ApiKeyScreen } from './screens/ApiKeyScreen';
import { analyzeDocuments } from './services/geminiService';
import { X } from 'lucide-react';

const STORAGE_KEY = 'gemini_api_key';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.HOME);
  const [selectedSet, setSelectedSet] = useState<SetType>(SetType.NONE);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // Data State
  const [set1Items, setSet1Items] = useState<DocItem[]>([]);
  const [set2Items, setSet2Items] = useState<DocItem[]>([]);
  
  // Analysis State
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null
  });

  // Init: Check local storage for API Key
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
        setApiKey(storedKey);
        setCurrentScreen(AppScreen.HOME);
    } else {
        setCurrentScreen(AppScreen.API_KEY_INPUT);
    }
  }, []);

  // Handlers for API Key
  const handleSaveKey = (key: string) => {
      localStorage.setItem(STORAGE_KEY, key);
      setApiKey(key);
      setCurrentScreen(AppScreen.HOME);
  };

  const handleResetKey = () => {
      if (confirm("確定要重設 API Key 嗎？")) {
          localStorage.removeItem(STORAGE_KEY);
          setApiKey(null);
          setCurrentScreen(AppScreen.API_KEY_INPUT);
      }
  };

  // Navigation Handlers
  const goHome = () => setCurrentScreen(AppScreen.HOME);
  
  const handleSetSelection = (targetScreen: AppScreen, set: SetType) => {
    setSelectedSet(set);
    setCurrentScreen(targetScreen);
  };

  const handleSaveItems = (items: DocItem[]) => {
    if (selectedSet === SetType.SET_1) {
      setSet1Items(prev => [...prev, ...items]);
    } else if (selectedSet === SetType.SET_2) {
      setSet2Items(prev => [...prev, ...items]);
    }
    goHome();
  };

  const startAnalysis = async () => {
    if (!apiKey) {
        alert("API Key 遺失，請重新設定");
        setCurrentScreen(AppScreen.API_KEY_INPUT);
        return;
    }

    setCurrentScreen(AppScreen.ANALYSIS_RESULT);
    setAnalysis({ isAnalyzing: true, result: null, error: null });

    try {
      // Pass the stored API Key to the service
      const result = await analyzeDocuments(set1Items, set2Items, apiKey);
      setAnalysis({ isAnalyzing: false, result, error: null });
    } catch (error) {
      setAnalysis({ isAnalyzing: false, result: null, error: (error as Error).message || "發生未知錯誤" });
    }
  };

  const handleAnalysisComplete = () => {
    setSet1Items([]);
    setSet2Items([]);
    setAnalysis({
      isAnalyzing: false,
      result: null,
      error: null
    });
    goHome();
  };

  // Selection Overlay Component
  const SelectionOverlay = ({ onSelect, onClose }: { onSelect: (s: SetType) => void, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in pb-safe-b">
      <div className="w-full max-w-md bg-ios-surface border border-ios-glassBorder rounded-3xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
           <X size={24} />
        </button>
        <h3 className="text-2xl font-light text-white mb-6 text-center">選擇目標文件集</h3>
        <div className="space-y-4">
          <button 
            onClick={() => onSelect(SetType.SET_1)}
            className="w-full p-6 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-ios-blue transition-all flex justify-between items-center group"
          >
            <div className="text-left">
                <span className="block text-white font-medium text-lg group-hover:text-ios-blue transition-colors">第一份資料</span>
                <span className="text-sm text-gray-500">目前有 {set1Items.length} 個項目</span>
            </div>
            <div className="w-4 h-4 rounded-full border-2 border-gray-600 group-hover:border-ios-blue" />
          </button>

          <button 
            onClick={() => onSelect(SetType.SET_2)}
            className="w-full p-6 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 hover:border-ios-blue transition-all flex justify-between items-center group"
          >
            <div className="text-left">
                <span className="block text-white font-medium text-lg group-hover:text-ios-blue transition-colors">第二份資料</span>
                <span className="text-sm text-gray-500">目前有 {set2Items.length} 個項目</span>
            </div>
             <div className="w-4 h-4 rounded-full border-2 border-gray-600 group-hover:border-ios-blue" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-black text-white overflow-hidden font-sans">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/40 rounded-full blur-[120px]" />
      </div>

      {currentScreen === AppScreen.API_KEY_INPUT && (
        <ApiKeyScreen onSave={handleSaveKey} />
      )}

      {currentScreen === AppScreen.HOME && (
        <HomeScreen 
          set1={set1Items}
          set2={set2Items}
          onCameraClick={() => setCurrentScreen(AppScreen.CAMERA_SELECTION)}
          onUploadClick={() => setCurrentScreen(AppScreen.UPLOAD_SELECTION)}
          onAnalyze={startAnalysis}
          onSettingsClick={handleResetKey}
        />
      )}

      {currentScreen === AppScreen.CAMERA_SELECTION && (
        <SelectionOverlay 
          onSelect={(set) => handleSetSelection(AppScreen.CAMERA_CAPTURE, set)} 
          onClose={goHome} 
        />
      )}

      {currentScreen === AppScreen.UPLOAD_SELECTION && (
        <SelectionOverlay 
          onSelect={(set) => handleSetSelection(AppScreen.UPLOAD_FILE, set)} 
          onClose={goHome} 
        />
      )}

      {currentScreen === AppScreen.CAMERA_CAPTURE && (
        <CameraScreen 
          currentSet={selectedSet}
          onBack={goHome}
          onSave={handleSaveItems}
        />
      )}

      {currentScreen === AppScreen.UPLOAD_FILE && (
        <UploadScreen 
          currentSet={selectedSet}
          onBack={goHome}
          onSave={handleSaveItems}
        />
      )}

      {currentScreen === AppScreen.ANALYSIS_RESULT && (
        <AnalysisScreen 
          result={analysis.result}
          error={analysis.error}
          isAnalyzing={analysis.isAnalyzing}
          onBack={handleAnalysisComplete}
        />
      )}
    </div>
  );
};

export default App;