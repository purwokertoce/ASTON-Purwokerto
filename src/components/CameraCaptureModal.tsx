import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { compressAndWatermarkPhoto } from '../utils/photoCompressor';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (photoDataUrl: string) => void;
  equipmentName: string;
  inspectorName: string;
  photoTypeLabel?: string;
  checklistId?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  equipmentName,
  inspectorName,
  photoTypeLabel = 'Kondisi Unit',
  checklistId,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start live webcam if supported
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Browser tidak mendukung akses kamera langsung. Silakan gunakan tombol Upload Foto / Kamera Bawaan.');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // prefer rear camera on smartphone
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Live camera error or permission denied:', err);
      setCameraError('Kamera tidak dapat diakses langsung. Silakan gunakan tombol Ambil Foto via Galeri/Kamera HP.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedPreview) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, capturedPreview]);

  if (!isOpen) return null;

  // Take photo from video stream
  const handleCaptureFromVideo = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const watermarked = await compressAndWatermarkPhoto(blob, {
              equipmentName,
              inspectorName,
              photoType: photoTypeLabel,
              checklistId,
            });
            setCapturedPreview(watermarked);
          }
          setIsProcessing(false);
          stopCamera();
        }, 'image/jpeg', 0.85);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Handle native mobile file input capture
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const watermarked = await compressAndWatermarkPhoto(file, {
        equipmentName,
        inspectorName,
        photoType: photoTypeLabel,
        checklistId,
      });
      setCapturedPreview(watermarked);
    } catch (err) {
      console.error('File compression error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPhoto = () => {
    if (capturedPreview) {
      onPhotoCaptured(capturedPreview);
      handleClose();
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPreview(null);
    setCameraError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="min-w-0 pr-2">
            <h3 className="text-base font-bold text-white truncate flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Foto: {equipmentName}</span>
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {photoTypeLabel} · Inspector: {inspectorName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector (Take Photo vs Upload Photo) */}
        {!capturedPreview && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('camera')}
              className={`py-2.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'camera'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Kamera Langsung</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                fileInputRef.current?.click();
              }}
              className={`py-2.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload / Galeri</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[300px]">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm font-medium text-slate-300">Memproses dan mengompresi foto...</p>
              <p className="text-xs text-slate-500">Menerapkan watermark inspeksi & optimasi ukuran</p>
            </div>
          ) : capturedPreview ? (
            /* Preview Captured Photo */
            <div className="w-full flex flex-col items-center gap-3">
              <div className="relative w-full aspect-4/3 bg-black rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                <img
                  src={capturedPreview}
                  alt="Preview Inspeksi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-full bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Watermark tanggal, waktu, inspektor, dan peralatan berhasil disematkan.</span>
              </div>
            </div>
          ) : activeTab === 'camera' && !cameraError ? (
            /* Live Camera Feed */
            <div className="relative w-full aspect-4/3 bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE CAMERA
              </div>
            </div>
          ) : (
            /* Upload / Fallback Mode */
            <div className="w-full flex flex-col items-center justify-center py-6 px-4 text-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/40">
              {cameraError ? (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-left flex items-start gap-2 max-w-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>{cameraError}</span>
                </div>
              ) : null}

              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Pilih Foto dari Galeri atau Kamera Smartphone
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Foto akan otomatis dikompresi dan distempel tanggal, jam, dan nama inspektor.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                {/* Native Smartphone Camera Direct */}
                <label className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md">
                  <Camera className="w-4 h-4" />
                  <span>Kamera Smartphone</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {/* File Upload from Files/Gallery */}
                <label className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700">
                  <Upload className="w-4 h-4" />
                  <span>Pilih Berkas</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-2">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ambil Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-950 min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Foto</span>
              </button>
            </>
          ) : activeTab === 'camera' && !cameraError ? (
            <div className="w-full flex items-center justify-center py-1">
              <button
                type="button"
                onClick={handleCaptureFromVideo}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 border-4 border-white text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                title="Ambil Foto"
              >
                <Camera className="w-7 h-7" />
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium min-h-[44px]"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
