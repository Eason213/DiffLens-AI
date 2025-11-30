import React, { useState } from 'react';
import { Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { IOSButton } from '../components/ui/IOSButton';

interface ApiKeyScreenProps {
  onSave: (key: string) => void;
}

export const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onSave }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSave = () => {
    if (inputKey.trim().length > 0) {
      onSave(inputKey.trim());
    }
  };

  return (
    <div className="h-full flex flex-col pt-14 px-6 relative z-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] bg-black">
      
      {/* Header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          歡迎使用 DiffLens
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          為了啟用 AI 分析功能，請輸入您的 Google Gemini API Key。您的金鑰僅會儲存在您的裝置上。
        </p>
      </div>

      {/* Input Section */}
      <div className="flex-1 flex flex-col gap-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        
        <div className="bg-ios-surface border border-ios-glassBorder rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-ios-blue">
                <Key size={24} />
                <span className="font-medium">API Key 設定</span>
            </div>
            
            <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="貼上您的 API Key"
                className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue transition-all"
            />
        </div>

        <div className="bg-ios-surface/50 border border-ios-glassBorder rounded-2xl p-6">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-ios-green" />
                如何取得 Key?
            </h3>
            <ol className="text-gray-400 text-sm space-y-3 list-decimal list-inside ml-1">
                <li>前往 <span className="text-white">Google AI Studio</span></li>
                <li>登入您的 Google 帳號</li>
                <li>點擊 "Get API key"</li>
                <li>複製並貼上至上方欄位</li>
            </ol>
            
            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-ios-blue text-sm font-medium hover:underline"
            >
                前往取得 API Key <ExternalLink size={14} />
            </a>
        </div>

      </div>

      {/* Action */}
      <div className="mt-auto animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <IOSButton 
            onClick={handleSave} 
            disabled={inputKey.length < 10}
            variant="primary"
            className="w-full shadow-lg shadow-ios-blue/20"
        >
            開始使用
        </IOSButton>
        <p className="text-center text-xs text-gray-600 mt-4">
            點擊開始即代表您同意使用條款
        </p>
      </div>
    </div>
  );
};