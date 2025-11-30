import React, { useState } from 'react';
import { ArrowLeft, FileText, UploadCloud, X } from 'lucide-react';
import { IOSButton } from '../components/ui/IOSButton';
import { DocItem, SetType } from '../types';

interface UploadScreenProps {
  currentSet: SetType | null;
  onBack: () => void;
  onSave: (items: DocItem[]) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ currentSet, onBack, onSave }) => {
  const [selectedFiles, setSelectedFiles] = useState<DocItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files) as File[];
      const newItems: DocItem[] = [];

      for (const file of files) {
        const reader = new FileReader();
        const isText = file.type.startsWith('text/') || file.name.endsWith('.txt');
        
        const item: DocItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : (isText ? 'text' : 'file'),
          content: '',
          timestamp: Date.now()
        };

        const content = await new Promise<string>((resolve) => {
          if (isText) {
            reader.readAsText(file);
          } else {
            // Read PDF, Images, Word, Excel as DataURL to preserve binary data
            reader.readAsDataURL(file);
          }
          reader.onload = (e) => resolve(e.target?.result as string);
        });

        item.content = content;
        newItems.push(item);
      }
      setSelectedFiles(prev => [...prev, ...newItems]);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleFinish = () => {
    onSave(selectedFiles);
  };

  return (
    <div className="h-full flex flex-col pt-12 px-6 bg-black">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 bg-ios-surface rounded-full text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-medium tracking-wide">上傳至 {currentSet}</h2>
        <div className="w-10" />
      </div>

      {/* Upload Area */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div 
          className={`
            border-2 border-dashed rounded-3xl p-8 text-center transition-all mb-6
            ${isDragging ? 'border-ios-blue bg-ios-blue/10' : 'border-gray-700 bg-ios-surface/30'}
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
        >
          <input 
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden" 
            id="file-upload"
          />
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center h-full cursor-pointer">
            <div className="w-16 h-16 bg-ios-blue/20 rounded-full flex items-center justify-center mb-4 text-ios-blue">
               <UploadCloud size={32} />
            </div>
            <p className="text-lg font-medium text-white">點擊選擇檔案</p>
            <p className="text-sm text-gray-500 mt-2">支援 PDF, Word, Excel, 圖片</p>
          </label>
        </div>

        {/* File List */}
        <div className="space-y-3">
          {selectedFiles.map((file, idx) => (
            <div key={file.id} className="bg-ios-surface border border-ios-glassBorder rounded-2xl p-4 flex items-center gap-4 animate-slide-in">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {file.type === 'image' ? (
                  <img src={file.content} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <FileText size={20} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-gray-500 text-xs">{(file.content.length / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => removeFile(file.id)} className="text-gray-500 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Action - Fixed Bottom with Safe Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <IOSButton onClick={handleFinish} disabled={selectedFiles.length === 0} variant="primary">
          確認上傳 ({selectedFiles.length})
        </IOSButton>
      </div>
    </div>
  );
};