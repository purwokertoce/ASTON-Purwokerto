import React from 'react';
import { X, Calendar, User, Tag } from 'lucide-react';
import { InspectionPhoto } from '../types';

interface PhotoViewerModalProps {
  photo: InspectionPhoto | null;
  onClose: () => void;
  equipmentName?: string;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photo,
  onClose,
  equipmentName,
}) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {equipmentName || 'Dokumentasi Inspeksi'}
            </h3>
            <p className="text-xs text-slate-400 capitalize">
              Tipe Foto: {photo.photo_type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo View */}
        <div className="flex-1 bg-black overflow-hidden flex items-center justify-center p-2 min-h-[250px] max-h-[70vh]">
          <img
            src={photo.photo_url}
            alt="Dokumentasi Inspeksi"
            className="max-w-full max-h-[68vh] object-contain rounded-lg"
          />
        </div>

        {/* Footer Info */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{new Date(photo.captured_at).toLocaleString('id-ID')}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>{photo.uploaded_by}</span>
            </span>
            {photo.caption && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{photo.caption}</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
