import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PowerOff,
  Activity,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  Layers,
  Thermometer,
  Gauge,
  Droplets,
  Wind,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Checklist, ChecklistItem, Equipment, User } from '../types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface DashboardViewProps {
  checklists: Checklist[];
  equipmentList: Equipment[];
  currentUser: User;
  onStartNewChecklist: () => void;
  onViewHistory: () => void;
  onViewReport: (checklistId?: string) => void;
  onViewEquipment: (filterStatus?: string) => void;
  onViewChecklistDetail: (checklist: Checklist) => void;
  onDeleteChecklist?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  checklists,
  equipmentList,
  currentUser,
  onStartNewChecklist,
  onViewHistory,
  onViewReport,
  onViewEquipment,
  onViewChecklistDetail,
  onDeleteChecklist,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Find today's latest checklist
  const todayChecklists = checklists.filter(
    (c) => c.checklist_date === todayStr || c.id.startsWith(`chk-${todayStr.replace(/-/g, '')}`)
  );
  const latestToday = todayChecklists[0] || checklists[0];

  // Metrics calculation
  const totalEquipment = equipmentList.length;
  const activeCount = equipmentList.filter((e) => e.status === 'active').length;
  const matiCount = equipmentList.filter((e) => e.status === 'mati').length;
  const rusakCount = equipmentList.filter((e) => e.status === 'rusak').length;

  // Checklist completion today
  const hasCompletedToday = todayChecklists.length > 0;
  const checkedCount = latestToday ? latestToday.items.filter((i) => i.status !== 'not_checked').length : 0;
  const completionPercentage = Math.min(100, Math.round((checkedCount / totalEquipment) * 100));

  // Attention required equipment
  const attentionItems = latestToday
    ? latestToday.items.filter((i) => i.status === 'trouble' || i.status === 'warning' || i.operating_status === 'rusak')
    : equipmentList.filter((e) => e.status === 'rusak');

  // Pending admin approval checklists
  const pendingAdminApprovalChecklists = checklists.filter((c) => !c.admin_approved);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Top Welcome / Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              ROOFTOP AREA · HOTEL ENGINEERING
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Dashboard Inspeksi Rooftop
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Monitoring real-time kondisi sistem pendingin (Chiller, CHWP), pemanas air (Heat Pump, Tank, Booster), dan plumbing rooftop hotel.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onStartNewChecklist}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Checklist Baru</span>
            </button>
            {latestToday && (
              <button
                onClick={() => onViewReport(latestToday.id)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-slate-700 min-h-[44px]"
              >
                Laporan Hari Ini
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Attention Banner: Checklists Pending Chief Engineer Approval */}
      {currentUser.role === 'admin' && pendingAdminApprovalChecklists.length > 0 && (
        <div className="bg-purple-950/40 border border-purple-800/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Perlu Persetujuan Mengetahui Chief Engineer</span>
                <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                  {pendingAdminApprovalChecklists.length} Laporan Pending
                </span>
              </h3>
              <p className="text-xs text-purple-200/80 mt-0.5">
                Ada {pendingAdminApprovalChecklists.length} laporan hasil inspeksi teknisi rooftop yang menunggu persetujuan mengetahui dari Chief Engineer ({currentUser.name}).
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const pending = pendingAdminApprovalChecklists[0];
              if (pending) onViewReport(pending.id);
            }}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-md shadow-purple-950 shrink-0 self-start sm:self-center min-h-[40px]"
          >
            <span>Tinjau Laporan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Checklist Progress Bar Today */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Rooftop Checklist Today</h2>
              <p className="text-xs text-slate-400">
                {hasCompletedToday
                  ? `Selesai ${checkedCount} dari ${totalEquipment} unit peralatan`
                  : 'Checklist rutin hari ini belum diselesaikan'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs text-slate-400 font-mono">
              {checkedCount}/{totalEquipment} Unit
            </span>
            <span className="text-sm font-extrabold text-blue-400 font-mono">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-3.5 p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completionPercentage === 100
                ? 'bg-emerald-500'
                : completionPercentage >= 50
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {/* Sub text status */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span>Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Selesai: {checkedCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              <span>Belum: {totalEquipment - checkedCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Equipment Status Cards (Color Indicators per brief) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Equipment */}
        <div
          onClick={() => onViewEquipment('all')}
          className="bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Equipment</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">{totalEquipment}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Rooftop Area</span>
        </div>

        {/* Active / Normal (🟢 Green) */}
        <div
          onClick={() => onViewEquipment('active')}
          className="bg-slate-850 hover:bg-slate-800 border border-emerald-900/40 rounded-2xl p-4 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Active / Normal
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{activeCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Beroperasi normal</span>
        </div>

        {/* Mati / Off (⚫ Black/Slate) */}
        <div
          onClick={() => onViewEquipment('mati')}
          className="bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Mati / Standby
            </span>
            <PowerOff className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-300 font-mono">{matiCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Unit cadangan/off</span>
        </div>

        {/* Rusak / Trouble (🔴 Red) */}
        <div
          onClick={() => onViewEquipment('rusak')}
          className={`rounded-2xl p-4 transition-colors cursor-pointer border ${
            rusakCount > 0
              ? 'bg-red-950/30 border-red-800/80 hover:bg-red-950/40'
              : 'bg-slate-850 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Rusak / Trouble
            </span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-400 font-mono">{rusakCount}</p>
          <span className="text-[11px] text-red-300/80 mt-1 block">
            {rusakCount > 0 ? 'Butuh perhatian segera' : 'Nol kerusakan terdeteksi'}
          </span>
        </div>
      </div>

      {/* ATTENTION REQUIRED SECTION (Section 23 of brief) */}
      {attentionItems.length > 0 ? (
        <div className="bg-red-950/20 border border-red-800/60 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <span>🔴 ATTENTION REQUIRED</span>
                  <span className="text-xs px-2 py-0.5 bg-red-900/60 text-red-200 rounded-full font-mono">
                    {attentionItems.length} Unit
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Peralatan berikut membutuhkan tindak lanjut atau perbaikan teknisi MEP
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {attentionItems.map((item: ChecklistItem | Equipment, idx: number) => {
              const name = item.equipment_name;
              const reason =
                'warning_reason' in item && item.warning_reason
                  ? item.warning_reason
                  : 'Status Rusak / Parameter abnormal';
              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-900/80 border border-red-900/40 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{name}</p>
                    <p className="text-red-300/90 truncate mt-0.5">{reason}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-red-900/50 text-red-200 font-semibold shrink-0">
                    Trouble
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-850/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Semua Peralatan Normal</h4>
            <p className="text-xs text-slate-400">
              Tidak ada alarm gangguan atau equipment bermasalah pada pemeriksaan terkini.
            </p>
          </div>
        </div>
      )}

      {/* System Categories Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Kategori Peralatan Rooftop</h3>
            <p className="text-xs text-slate-400">Peta distribusi 23 unit equipment per sistem kerja</p>
          </div>
          <button
            onClick={() => onViewEquipment('all')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Semua Alat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Water Tanks */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Tangki Air Rooftop
              </span>
              <span className="text-xs font-mono text-slate-400">2 Unit</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Cold Water Tank (40kL) & Hot Water Tank (15kL)</p>
            <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2 rounded-lg">
              <div className="flex justify-between">
                <span>Tank Roof Cold Water</span>
                <span className="text-emerald-400 font-mono">Level 78%</span>
              </div>
              <div className="flex justify-between">
                <span>Tank Roof Hot Water</span>
                <span className="text-emerald-400 font-mono">Level 85%</span>
              </div>
            </div>
          </div>

          {/* Heat Pumps */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-400" />
                Heat Pump System
              </span>
              <span className="text-xs font-mono text-slate-400">3 Unit HP + 6 Pompa</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Air to Water Heat Pump 85 kW & Pompa Sirkulasi</p>
            <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2 rounded-lg">
              <div className="flex justify-between">
                <span>Heat Pump 01</span>
                <span className="text-emerald-400 font-mono">52°C · Active</span>
              </div>
              <div className="flex justify-between">
                <span>Heat Pump 02</span>
                <span className="text-emerald-400 font-mono">50°C · Active</span>
              </div>
              <div className="flex justify-between">
                <span>Heat Pump 03</span>
                <span className="text-slate-400 font-mono">Standby</span>
              </div>
            </div>
          </div>

          {/* Screw Chillers */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-blue-400" />
                Screw Chiller HVAC
              </span>
              <span className="text-xs font-mono text-slate-400">3 Chiller + 4 CHWP</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Air Cooled Screw Chiller 180 TR & CHWP</p>
            <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-2 rounded-lg">
              <div className="flex justify-between">
                <span>Screw Chiller 01</span>
                <span className="text-emerald-400 font-mono">7.2°C · Fan ON</span>
              </div>
              <div className="flex justify-between">
                <span>Screw Chiller 02</span>
                <span className="text-emerald-400 font-mono">7.0°C · Fan ON</span>
              </div>
              <div className="flex justify-between">
                <span>Screw Chiller 03</span>
                <span className="text-slate-400 font-mono">Standby</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Checklist Summary & Action */}
      {latestToday && (
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide">
                Inspeksi Terakhir Disimpan
              </span>
              <h3 className="text-sm font-bold text-white">
                {latestToday.checklist_date} · Jam {latestToday.checklist_time} WIB
              </h3>
              <p className="text-xs text-slate-400">
                Inspector: {latestToday.inspector_name} ({latestToday.inspector_employee_id})
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    latestToday.supervisor_approved
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  }`}
                >
                  SPV: {latestToday.supervisor_approved ? `✓ Disetujui (${latestToday.supervisor_name || 'SPV'})` : '⏳ Belum Verifikasi'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    latestToday.admin_approved
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  }`}
                >
                  Chief: {latestToday.admin_approved ? `✓ Diketahui (${latestToday.admin_name || 'Admin'})` : '⏳ Menunggu Approval'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewChecklistDetail(latestToday)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
              >
                Detail Lengkap
              </button>
              <button
                onClick={() => onViewReport(latestToday.id)}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Cetak Laporan
              </button>
              {onDeleteChecklist && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="py-2 px-2.5 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 rounded-lg text-xs font-semibold transition-colors border border-slate-700 hover:border-red-800/80"
                  title="Hapus checklist ini"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-900/70 rounded-xl text-xs text-slate-300 border border-slate-800">
            <span className="font-semibold text-slate-400">Catatan Teknisi: </span>
            {latestToday.overall_remark || 'Tidak ada catatan khusus.'}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Dashboard */}
      {latestToday && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          checklist={latestToday}
          currentUser={currentUser}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (onDeleteChecklist && latestToday) {
              onDeleteChecklist(latestToday.id);
            }
          }}
        />
      )}
    </div>
  );
};
