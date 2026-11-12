import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  Printer,
  ShieldCheck,
  Shield,
  Eye,
  Droplets,
  Thermometer,
  Gauge,
  Wind,
  Trash2,
} from 'lucide-react';
import { Checklist, ChecklistItem, InspectionPhoto, User as UserType } from '../types';
import { PhotoViewerModal } from './PhotoViewerModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface ChecklistDetailModalProps {
  checklist: Checklist | null;
  currentUser: UserType;
  onClose: () => void;
  onViewReport: (checklistId: string) => void;
  onApproveChecklist?: (checklistId: string, supervisorNotes: string) => void;
  onAdminApproveChecklist?: (checklistId: string, adminNotes: string) => void;
  onDeleteChecklist?: (id: string) => void;
}

export const ChecklistDetailModal: React.FC<ChecklistDetailModalProps> = ({
  checklist,
  currentUser,
  onClose,
  onViewReport,
  onApproveChecklist,
  onAdminApproveChecklist,
  onDeleteChecklist,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<InspectionPhoto | null>(null);
  const [supervisorNotes, setSupervisorNotes] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  if (!checklist) return null;

  const dateFormatted = new Date(checklist.checklist_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleApprove = () => {
    if (onApproveChecklist) {
      onApproveChecklist(checklist.id, supervisorNotes);
    }
  };

  const handleAdminApprove = () => {
    if (onAdminApproveChecklist) {
      onAdminApproveChecklist(checklist.id, adminNotes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950">
          <div>
            <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">
              Detail Pemeriksaan
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {dateFormatted} · {checklist.checklist_time} WIB
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewReport(checklist.id);
              }}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Metadata Card */}
          <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Tanggal & Jam:</span>
              <p className="font-bold text-white font-mono">{checklist.checklist_date} {checklist.checklist_time}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Inspector:</span>
              <p className="font-bold text-white">{checklist.inspector_name}</p>
              <span className="text-[11px] text-slate-400 font-mono">{checklist.inspector_employee_id}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Area Pemeriksaan:</span>
              <p className="font-bold text-white">{checklist.area_name}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Status Ringkasan:</span>
              <span className="font-bold font-mono text-emerald-400">
                {checklist.summary.checked_count}/{checklist.summary.total_equipment} Checked
              </span>
            </div>
          </div>

          {/* Header Pressures if exists */}
          {checklist.header_pressures && (
            <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-blue-400" />
                Tekanan Header Pipa Rooftop
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Cold Water Booster Pressure:</span>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {checklist.header_pressures.cold_water_booster_pressure} bar
                    </p>
                    <p className="text-[11px] text-slate-400">{checklist.header_pressures.cold_water_remark}</p>
                  </div>
                  {checklist.header_pressures.cold_water_gauge_photo && (
                    <button
                      onClick={() =>
                        setSelectedPhoto({
                          id: 'h-cold',
                          checklist_id: checklist.id,
                          equipment_id: 'header-cold',
                          photo_type: 'gauge',
                          photo_url: checklist.header_pressures!.cold_water_gauge_photo!,
                          captured_at: checklist.created_at,
                          uploaded_by: checklist.inspector_name,
                          caption: 'Pressure Gauge Cold Water Header',
                        })
                      }
                      className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Foto</span>
                    </button>
                  )}
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Hot Water Booster Pressure:</span>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      {checklist.header_pressures.hot_water_booster_pressure} bar
                    </p>
                    <p className="text-[11px] text-slate-400">{checklist.header_pressures.hot_water_remark}</p>
                  </div>
                  {checklist.header_pressures.hot_water_gauge_photo && (
                    <button
                      onClick={() =>
                        setSelectedPhoto({
                          id: 'h-hot',
                          checklist_id: checklist.id,
                          equipment_id: 'header-hot',
                          photo_type: 'gauge',
                          photo_url: checklist.header_pressures!.hot_water_gauge_photo!,
                          captured_at: checklist.created_at,
                          uploaded_by: checklist.inspector_name,
                          caption: 'Pressure Gauge Hot Water Header',
                        })
                      }
                      className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* All 23 Equipment List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Daftar Peralatan & Hasil Pemeriksaan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checklist.items.map((item, idx) => {
                const isRusak = item.operating_status === 'rusak';
                const isMati = item.operating_status === 'mati';
                const isActive = item.operating_status === 'active';

                return (
                  <div
                    key={item.id || idx}
                    className={`p-3.5 rounded-xl border space-y-2 text-xs transition-colors ${
                      isRusak
                        ? 'bg-red-950/20 border-red-800'
                        : item.has_warning
                        ? 'bg-amber-950/20 border-amber-800'
                        : 'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <span className="font-bold text-white text-sm block">
                          {idx + 1}. {item.equipment_name}
                        </span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          Tipe: {item.equipment_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isActive
                            ? 'text-emerald-400'
                            : isMati
                            ? 'text-slate-400'
                            : 'text-red-400'
                        }`}
                      >
                        {isActive ? '🟢 Active' : isMati ? '⚫ Mati' : '🔴 Rusak'}
                      </span>
                    </div>

                    {/* Parameters View */}
                    <div className="space-y-1 text-slate-300">
                      {item.parameters.level_percent !== undefined && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Level Tangki:</span>
                          <strong className="text-cyan-400 font-mono">{item.parameters.level_percent}%</strong>
                        </p>
                      )}

                      {item.parameters.temperature !== undefined && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Temperatur Heat Pump:</span>
                          <strong className="text-amber-400 font-mono">{item.parameters.temperature} °C</strong>
                        </p>
                      )}

                      {item.parameters.pressure_bar !== undefined && (
                        <p className="flex justify-between">
                          <span className="text-slate-400">Tekanan Pompa:</span>
                          <strong className="text-blue-400 font-mono">{item.parameters.pressure_bar} bar</strong>
                        </p>
                      )}

                      {item.parameters.chiller && (
                        <div className="p-2 bg-slate-900 rounded-lg space-y-0.5 text-[11px]">
                          <p className="flex justify-between">
                            <span className="text-slate-400">Temp Water:</span>
                            <span className="text-white font-mono">{item.parameters.chiller.temp_water || '-'} °C</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Temp Oil:</span>
                            <span className="text-white font-mono">{item.parameters.chiller.temp_oil || '-'} °C</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Evap Press:</span>
                            <span className="text-white font-mono">{item.parameters.chiller.evap_press || '-'} bar</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Fan Running:</span>
                            <span className={`font-bold font-mono ${item.parameters.chiller.signal_fan_running === 'ON' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {item.parameters.chiller.signal_fan_running || '-'}
                            </span>
                          </p>
                          {(item.parameters.chiller.lchtl || item.parameters.chiller.rchtl) && (
                            <p className="flex justify-between">
                              <span className="text-slate-400">LCHTL / RCHTL:</span>
                              <span className="text-white font-mono">
                                {item.parameters.chiller.lchtl || '-'} / {item.parameters.chiller.rchtl || '-'}
                              </span>
                            </p>
                          )}
                        </div>
                      )}

                      <p className="pt-1">
                        <span className="text-slate-400">Remark: </span>
                        <span>{item.remark || '-'}</span>
                      </p>
                    </div>

                    {/* Photos View Trigger */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Foto:</span>
                        <div className="flex gap-1.5 overflow-x-auto">
                          {item.photos.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setSelectedPhoto(p)}
                              className="w-12 h-9 rounded-md overflow-hidden border border-slate-700 relative shrink-0 hover:opacity-80"
                            >
                              <img src={p.photo_url} alt="Thumbnail" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1. Supervisor Approval & Sign-off Section */}
          <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                1. Verifikasi & Approval Supervisor MEP
              </h4>
              {checklist.supervisor_approved ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  Disetujui: {checklist.supervisor_name}
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-medium bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-full">
                  Menunggu Verifikasi SPV
                </span>
              )}
            </div>

            {checklist.supervisor_approved ? (
              <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-1 border border-slate-800/80">
                <p className="text-slate-300">
                  <span className="text-slate-400">Verifikator: </span>
                  <strong className="text-white">{checklist.supervisor_name}</strong>
                  <span className="text-slate-500 font-mono"> (Supervisor MEP)</span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-400">Disetujui pada: </span>
                  <span className="text-emerald-400 font-mono">
                    {checklist.supervisor_approved_at
                      ? new Date(checklist.supervisor_approved_at).toLocaleString('id-ID')
                      : '-'}
                  </span>
                </p>
                {checklist.supervisor_notes && (
                  <p className="text-slate-300 pt-1 border-t border-slate-800 mt-1">
                    <span className="text-slate-400">Catatan SPV: </span>
                    <span className="italic">"{checklist.supervisor_notes}"</span>
                  </p>
                )}
              </div>
            ) : (currentUser.role === 'supervisor' || currentUser.role === 'admin') ? (
              <div className="space-y-2 text-xs">
                <textarea
                  rows={2}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="Beri catatan review hasil checklist teknisi lapangan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleApprove}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Setujui & Tandatangani (Supervisor)</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Hanya Supervisor MEP atau Chief Engineer yang dapat menandatangani verifikasi checklist ini.
              </p>
            )}
          </div>

          {/* 2. Chief Engineer (Admin) Acknowledgment & Approval Section */}
          <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-400" />
                2. Persetujuan Mengetahui Chief Engineer (Admin)
              </h4>
              {checklist.admin_approved ? (
                <span className="text-xs text-purple-300 font-bold flex items-center gap-1 bg-purple-950/60 border border-purple-800/80 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Diketahui: {checklist.admin_name}
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-medium bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-full">
                  Menunggu Persetujuan Admin
                </span>
              )}
            </div>

            {checklist.admin_approved ? (
              <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-1 border border-purple-900/30">
                <p className="text-slate-300">
                  <span className="text-slate-400">Chief Engineer: </span>
                  <strong className="text-white">{checklist.admin_name}</strong>
                  <span className="text-purple-400 font-mono"> (Admin Department Head)</span>
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-400">Disetujui Mengetahui pada: </span>
                  <span className="text-purple-300 font-mono">
                    {checklist.admin_approved_at
                      ? new Date(checklist.admin_approved_at).toLocaleString('id-ID')
                      : '-'}
                  </span>
                </p>
                {checklist.admin_notes && (
                  <p className="text-slate-300 pt-1 border-t border-slate-800 mt-1">
                    <span className="text-slate-400">Instruksi / Catatan Chief Engineer: </span>
                    <span className="italic">"{checklist.admin_notes}"</span>
                  </p>
                )}
              </div>
            ) : currentUser.role === 'admin' ? (
              <div className="space-y-2 text-xs">
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Beri catatan / instruksi tindak lanjut dari Chief Engineer..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAdminApprove}
                    className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-950 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Setujui Mengetahui Laporan (Chief Engineer)</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Menunggu login sebagai Chief Engineer (Admin) untuk memberikan tanda tangan persetujuan mengetahui pada laporan ini.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewReport(checklist.id);
              }}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Format Cetak PDF</span>
            </button>

            {onDeleteChecklist && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="py-2 px-3 bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Hapus checklist ini"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Hapus Checklist</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        checklist={checklist}
        currentUser={currentUser}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (onDeleteChecklist) {
            onDeleteChecklist(checklist.id);
            onClose();
          }
        }}
      />

      {/* Photo Viewer */}
      {selectedPhoto && (
        <PhotoViewerModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          equipmentName="Dokumentasi Inspeksi Rooftop"
        />
      )}
    </div>
  );
};
