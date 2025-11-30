import React from 'react';
import { Camera, Upload, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { IOSButton } from '../components/ui/IOSButton';
import { DocItem } from '../types';

interface HomeScreenProps {
  set1: DocItem[];
  set2: DocItem[];
  onCameraClick: () => void;
  onUploadClick: () => void;
  onAnalyze: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  set1,
  set2,
  onCameraClick,
  onUploadClick,
  onAnalyze
}) => {
  const hasFiles = set1.length > 0 && set2.length > 0;

  return (
    <div className="h-full flex flex-col pt-14 px-6 relative z-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
      
      {/* Header Area */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-4xl font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
          DiffLens
        </h1>
        <p className="text-gray-400 mt-2 text-sm tracking-wide uppercase">AI 智能比對引擎</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-ios-surface/50 backdrop-blur-md border border-ios-glassBorder rounded-3xl p-5 flex flex-col justify-between h-40 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-start">
            <span className="text-gray-400 font-medium text-xs uppercase">第一份資料</span>
            {set1.length > 0 ? <CheckCircle2 size={16} className="text-ios-green" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
          </div>
          <div>
            <span className="text-3xl font-light">{set1.length}</span>
            <p className="text-xs text-gray-500 mt-1">個檔案已就緒</p>
          </div>
        </div>
        <div className="bg-ios-surface/50 backdrop-blur-md border border-ios-glassBorder rounded-3xl p-5 flex flex-col justify-between h-40 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-start">
            <span className="text-gray-400 font-medium text-xs uppercase">第二份資料</span>
            {set2.length > 0 ? <CheckCircle2 size={16} className="text-ios-green" /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
          </div>
          <div>
            <span className="text-3xl font-light">{set2.length}</span>
            <p className="text-xs text-gray-500 mt-1">個檔案已就緒</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-1 flex flex-col justify-end gap-4">
        {hasFiles && (
          <div className="mb-4 animate-pulse-slow">
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="text-indigo-400" size={20} />
              <p className="text-sm text-indigo-100">已準備好進行 AI 分析</p>
            </div>
          </div>
        )}

        <IOSButton 
          onClick={onCameraClick} 
          variant="glass" 
          className="h-20 text-lg rounded-3xl group"
          icon={<Camera size={24} className="group-hover:scale-110 transition-transform" />}
        >
          拍照上傳
        </IOSButton>

        <IOSButton 
          onClick={onUploadClick} 
          variant="glass" 
          className="h-20 text-lg rounded-3xl group"
          icon={<Upload size={24} className="group-hover:scale-110 transition-transform" />}
        >
          上傳檔案
        </IOSButton>

        {hasFiles && (
          <IOSButton 
            onClick={onAnalyze} 
            variant="primary" 
            className="h-20 text-xl font-bold rounded-3xl mt-4 shadow-[0_0_40px_rgba(10,132,255,0.3)]"
            icon={<Layers size={24} />}
          >
            開始比對分析
          </IOSButton>
        )}
      </div>
    </div>
  );
};