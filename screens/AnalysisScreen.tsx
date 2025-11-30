import React from 'react';
import { ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { IOSButton } from '../components/ui/IOSButton';

interface AnalysisScreenProps {
  result: string | null;
  isAnalyzing: boolean;
  onBack: () => void;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ result, isAnalyzing, onBack }) => {
  
  if (isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute w-64 h-64 bg-ios-blue/30 rounded-full blur-[100px] top-1/4 -left-10 animate-pulse-slow" />
        <div className="absolute w-64 h-64 bg-purple-500/30 rounded-full blur-[100px] bottom-1/4 -right-10 animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 mb-8 relative">
                <div className="absolute inset-0 border-4 border-ios-blue/30 rounded-full" />
                <div className="absolute inset-0 border-t-4 border-ios-blue rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-white animate-pulse" />
                </div>
            </div>
            <h2 className="text-2xl font-light text-white mb-2">正在分析差異</h2>
            <p className="text-gray-400 text-center max-w-xs">AI 正在比對文件集之間的結構、內容與視覺元素差異。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="pt-12 px-6 pb-6 border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
        <button onClick={onBack} className="p-2 bg-ios-surface rounded-full text-white">
          <ArrowLeft size={24} />
        </button>
        <span className="text-lg font-semibold">分析報告</span>
        <button className="p-2 text-ios-blue">
            <Share2 size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose prose-invert prose-sm max-w-none">
          {/* Simple Markdown Rendering */}
          {result ? (
            result.split('\n').map((line, index) => {
              if (line.startsWith('###')) return <h3 key={index} className="text-lg font-bold text-white mt-6 mb-2">{line.replace('###', '')}</h3>;
              if (line.startsWith('##')) return <h2 key={index} className="text-xl font-bold text-ios-blue mt-8 mb-4">{line.replace('##', '')}</h2>;
              if (line.startsWith('**')) return <strong key={index} className="block mt-4 text-white">{line.replace(/\*\*/g, '')}</strong>;
              if (line.startsWith('- ')) return <li key={index} className="ml-4 text-gray-300 list-disc my-1">{line.replace('- ', '')}</li>;
              return <p key={index} className="text-gray-400 leading-relaxed my-2">{line}</p>;
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>無分析結果。</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 bg-black border-t border-gray-800">
        <IOSButton onClick={onBack} variant="secondary">完成</IOSButton>
      </div>
    </div>
  );
};