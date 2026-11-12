import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { Checklist, User } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  checklist: Checklist | null;
  currentUser: User;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  checklist,
  currentUser,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !checklist) return null;

  const isSupervisorApproved = Boolean(checklist.supervisor_approved);
  const isAdminApproved = Boolean(checklist.admin_approved);
  const isAdmin = currentUser.role === 'admin';

  // If approved by supervisor but user is not admin, prevent deletion
  const canDelete = isAdmin || !isSupervisorApproved;

  const formattedDate = new Date(checklist.checklist_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isSupervisorApproved ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Konfirmasi Hapus Checklist
              </h3>
              <p className="text-xs text-slate-400">
                Pemeriksaan Rooftop Engineering
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Checklist Item Information Card */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Tanggal & Waktu:</span>
            <span className="font-bold text-white font-mono">
              {formattedDate} · {checklist.checklist_time} WIB
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Inspector Lapangan:</span>
            <span className="font-semibold text-white">
              {checklist.inspector_name} ({checklist.inspector_employee_id})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Peralatan:</span>
            <span className="font-mono text-emerald-400">
              {checklist.summary.checked_count}/{checklist.summary.total_equipment} Unit Terperiksa
            </span>
          </div>
          {checklist.overall_remark && (
            <div className="pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Catatan: </span>
              <span className="text-slate-300 italic">"{checklist.overall_remark}"</span>
            </div>
          )}
        </div>

        {/* Special Warnings for Supervisor / Admin Approved Checklists */}
        {isSupervisorApproved && (
          <div className="p-3.5 bg-red-950/40 border border-red-800/70 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Status: Sudah Disetujui Supervisor</span>
            </div>
            <p className="text-red-200/90 text-[11px] leading-relaxed">
              Checklist ini telah diverifikasi dan disetujui oleh Supervisor MEP{' '}
              <strong>{checklist.supervisor_name || 'Tri Abidin Suyono'}</strong>
              {checklist.supervisor_approved_at && (
                <span> pada {new Date(checklist.supervisor_approved_at).toLocaleDateString('id-ID')}</span>
              )}.
            </p>
            {isAdmin ? (
              <p className="text-purple-300 font-semibold text-[11px] pt-1 border-t border-red-900/60">
                👑 Sebagai Chief Engineer / Admin, Anda memiliki hak wewenang penuh untuk menghapus data checklist ini.
              </p>
            ) : (
              <p className="text-amber-300 font-semibold text-[11px] pt-1 border-t border-red-900/60">
                🔒 Hanya pengguna dengan role Admin (Chief Engineer) yang berwenang menghapus checklist yang sudah disetujui.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Batal
          </button>

          {canDelete ? (
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Ya, Hapus Checklist</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="py-2.5 px-4 bg-slate-800 text-slate-500 rounded-xl text-xs font-semibold cursor-not-allowed"
            >
              Tidak Memiliki Izin Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
