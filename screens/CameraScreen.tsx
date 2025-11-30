import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, Image as ImageIcon } from 'lucide-react';
import { DocItem, SetType } from '../types';

interface CameraScreenProps {
  currentSet: SetType | null;
  onBack: () => void;
  onSave: (items: DocItem[]) => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ currentSet, onBack, onSave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null); // Ref for the capture box
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedItems, setCapturedItems] = useState<DocItem[]>([]);
  const [flash, setFlash] = useState(false);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            // Request high resolution for better OCR/analysis
            width: { ideal: 4096 },
            height: { ideal: 2160 } 
          }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("無法存取相機，請檢查權限設定。");
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current && overlayRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 150);

        // --- CROP LOGIC START ---
        // 1. Calculate how the video is rendered (imitating object-fit: cover)
        const containerRect = video.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();

        const videoW = video.videoWidth;
        const videoH = video.videoHeight;
        const containerW = containerRect.width;
        const containerH = containerRect.height;

        // Calculate the scale factor used by object-fit: cover
        const scale = Math.max(containerW / videoW, containerH / videoH);

        // Calculate the actual rendered dimensions of the video content
        const renderW = videoW * scale;
        const renderH = videoH * scale;

        // Calculate offsets (parts of video hidden by overflow)
        // Since object-position is usually center (50% 50%)
        const offsetX = (renderW - containerW) / 2;
        const offsetY = (renderH - containerH) / 2;

        // 2. Map overlay coordinates relative to the rendered video content
        // Overlay position relative to the container
        const overlayRelX = overlayRect.left - containerRect.left;
        const overlayRelY = overlayRect.top - containerRect.top;

        // Overlay position relative to the start of the video content (including hidden parts)
        const overlayVideoX = overlayRelX + offsetX;
        const overlayVideoY = overlayRelY + offsetY;

        // 3. Map back to source video coordinates
        const sourceX = overlayVideoX / scale;
        const sourceY = overlayVideoY / scale;
        const sourceW = overlayRect.width / scale;
        const sourceH = overlayRect.height / scale;

        // 4. Set canvas to the size of the cropped area (to maintain quality)
        canvas.width = sourceW;
        canvas.height = sourceH;

        // 5. Draw only the cropped area
        context.drawImage(
            video, 
            sourceX, sourceY, sourceW, sourceH, // Source (crop)
            0, 0, sourceW, sourceH              // Destination (full canvas)
        );
        // --- CROP LOGIC END ---

        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        const newItem: DocItem = {
          id: Date.now().toString(),
          type: 'image',
          content: imageData,
          name: `照片 ${capturedItems.length + 1}`,
          timestamp: Date.now()
        };

        setCapturedItems(prev => [...prev, newItem]);
      }
    }
  }, [capturedItems.length]);

  const handleFinish = () => {
    onSave(capturedItems);
  };

  return (
    <div className="h-full bg-black relative flex flex-col">
      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Viewfinder */}
      <div className="relative flex-1 overflow-hidden rounded-b-[3rem]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Guide with Ref */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-10">
            {/* The Green Box - This is what we crop to */}
            <div 
                ref={overlayRef}
                className="w-full h-3/4 border border-white/40 rounded-3xl relative animate-pulse-slow shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
            >
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-ios-green rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-ios-green rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-ios-green rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-ios-green rounded-br-xl" />
                
                {/* Labels */}
                <div className="absolute -top-10 w-full text-center">
                    <span className="text-white font-bold text-shadow-md tracking-wider">
                        {currentSet}
                    </span>
                </div>

                <div className="absolute -bottom-12 w-full text-center flex flex-col gap-1">
                    <span className="text-white/90 text-sm font-medium bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md inline-block mx-auto">
                        將文件對齊於此框內
                    </span>
                    <span className="text-ios-green text-xs font-bold tracking-wide">
                         (只分析此框內範圍)
                    </span>
                </div>
            </div>
        </div>

        {/* Flash Overlay */}
        {flash && <div className="absolute inset-0 bg-white z-50 animate-fade-out pointer-events-none" />}
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-6 flex justify-between items-center z-20">
          <button onClick={onBack} className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Controls Area */}
      <div className="bg-black flex flex-col justify-center px-8 relative z-10 pt-6 pb-safe-b">
        <div className="flex justify-between items-center">
            {/* Thumbnail / Count */}
            <div className="w-14 h-14 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 flex items-center justify-center relative">
                {capturedItems.length > 0 ? (
                   <img src={capturedItems[capturedItems.length - 1].content} className="w-full h-full object-cover" alt="last" />
                ) : (
                    <ImageIcon className="text-gray-600" />
                )}
                <div className="absolute -top-2 -right-2 bg-ios-blue text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {capturedItems.length}
                </div>
            </div>

            {/* Shutter Button */}
            <button 
                onClick={takePhoto}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform duration-200"
            >
                <div className="w-16 h-16 bg-white rounded-full" />
            </button>

            {/* Done Button */}
            <button 
                onClick={handleFinish}
                disabled={capturedItems.length === 0}
                className="w-14 h-14 bg-ios-green/20 text-ios-green rounded-full flex items-center justify-center disabled:opacity-30 disabled:bg-gray-900/50"
            >
                <Check size={28} />
            </button>
        </div>
        
        <div className="text-center mt-4 h-5">
             <p className="text-gray-500 text-xs uppercase tracking-widest">
                 {capturedItems.length === 0 ? "準備拍攝" : "AI 自動排序啟用中"}
             </p>
        </div>
      </div>
    </div>
  );
};