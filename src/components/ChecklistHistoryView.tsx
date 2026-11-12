import React, { useState, useMemo } from 'react';
import {
  Calendar,
  User,
  Search,
  Filter,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Checklist, User as UserType } from '../types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface ChecklistHistoryViewProps {
  checklists: Checklist[];
  currentUser: UserType;
  onViewDetail: (checklist: Checklist) => void;
  onViewReport: (checklistId: string) => void;
  onDeleteChecklist: (id: string) => void;
  onStartNewChecklist: () => void;
}

export const ChecklistHistoryView: React.FC<ChecklistHistoryViewProps> = ({
  checklists,
  currentUser,
  onViewDetail,
  onViewReport,
  onDeleteChecklist,
  onStartNewChecklist,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedInspector, setSelectedInspector] = useState<string>('all');
  const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Extract unique inspectors
  const inspectors = useMemo(() => {
    const set = new Set<string>();
    checklists.forEach((c) => {
      if (c.inspector_name) set.add(c.inspector_name);
    });
    return Array.from(set);
  }, [checklists]);

  // Filter checklists
  const filteredChecklists = useMemo(() => {
    return checklists.filter((c) => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDate = c.checklist_date.includes(term);
        const matchesInspector = c.inspector_name.toLowerCase().includes(term);
        const matchesRemark = (c.overall_remark || '').toLowerCase().includes(term);
        const matchesEquipment = c.items.some((i) => i.equipment_name.toLowerCase().includes(term));
        if (!matchesDate && !matchesInspector && !matchesRemark && !matchesEquipment) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'trouble' && c.status !== 'trouble') return false;
        if (selectedStatus === 'warning' && c.status !== 'warning') return false;
        if (selectedStatus === 'completed' && c.status !== 'completed') return false;
      }

      // Approval filter
      if (selectedApproval !== 'all') {
        if (selectedApproval === 'pending_spv' && c.supervisor_approved) return false;
        if (selectedApproval === 'pending_admin' && c.admin_approved) return false;
        if (selectedApproval === 'all_approved' && (!c.supervisor_approved || !c.admin_approved)) return false;
      }

      // Date range filter
      if (startDate && c.checklist_date < startDate) return false;
      if (endDate && c.checklist_date > endDate) return false;

      // Inspector filter
      if (selectedInspector !== 'all' && c.inspector_name !== selectedInspector) return false;

      return true;
    });
  }, [checklists, searchTerm, selectedStatus, selectedApproval, startDate, endDate, selectedInspector]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Riwayat Pemeriksaan Checklist</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Arsip digital checklist harian engineering area rooftop hotel.
          </p>
        </div>
        <button
          onClick={onStartNewChecklist}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-colors self-start sm:self-center"
        >
          <span>Buat Checklist Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tanggal, nama inspektor, alat (Chiller, Heat Pump, Tank)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Status Hasil:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Normal / Selesai (🟢)</option>
              <option value="warning">Ada Warning (🟠)</option>
              <option value="trouble">Ada Trouble (🔴)</option>
            </select>
          </div>

          {/* Approval Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Status Approval:</label>
            <select
              value={selectedApproval}
              onChange={(e) => setSelectedApproval(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="all">Semua Approval</option>
              <option value="pending_spv">Menunggu SPV</option>
              <option value="pending_admin">Menunggu Chief Engineer</option>
              <option value="all_approved">Lengkap (SPV & Chief)</option>
            </select>
          </div>

          {/* Inspector Filter */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Inspektor:</label>
            <select
              value={selectedInspector}
              onChange={(e) => setSelectedInspector(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="all">Semua Inspektor</option>
              {inspectors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Dari Tanggal:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Sampai Tanggal:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>
        </div>

        {(searchTerm || selectedStatus !== 'all' || selectedApproval !== 'all' || startDate || endDate || selectedInspector !== 'all') && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedApproval('all');
                setStartDate('');
                setEndDate('');
                setSelectedInspector('all');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Checklist List */}
      <div className="space-y-3">
        {filteredChecklists.length === 0 ? (
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-300 mb-1">Tidak ada riwayat checklist ditemukan</p>
            <p className="text-xs">Coba ubah kriteria filter atau buat inspeksi baru.</p>
          </div>
        ) : (
          filteredChecklists.map((chk) => {
            const hasTrouble = chk.status === 'trouble' || chk.summary.trouble_count > 0;
            const hasWarning = chk.status === 'warning' || chk.summary.warning_count > 0;

            const dateFormatted = new Date(chk.checklist_date).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div
                key={chk.id}
                className="bg-slate-850 hover:bg-slate-800/90 border border-slate-800 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-white">{dateFormatted}</span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {chk.checklist_time} WIB
                    </span>
                    {hasTrouble ? (
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                        🔴 Ada Trouble
                      </span>
                    ) : hasWarning ? (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        🟠 Ada Warning
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        🟢 Normal Selesai
                      </span>
                    )}
                    {chk.supervisor_approved ? (
                      <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full font-medium">
                        ✓ SPV Disetujui
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full font-medium">
                        ⏳ SPV Pending
                      </span>
                    )}
                    {chk.admin_approved ? (
                      <span className="text-[10px] text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2 py-0.5 rounded-full font-medium">
                        ✓ Chief Diketahui
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full font-medium">
                        ⏳ Chief Pending
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Inspector: <strong>{chk.inspector_name}</strong> ({chk.inspector_employee_id})
                    </span>
                    <span>·</span>
                    <span>Area: <strong>{chk.area_name}</strong></span>
                  </div>

                  {/* Counters per Section 20 of brief */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <span className="font-semibold text-slate-200">
                      {chk.summary.total_equipment} Equipment
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-emerald-400">
                      {chk.summary.checked_count} Checked
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-blue-400">
                      {chk.summary.active_count} Active
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-400">
                      {chk.summary.mati_count} Mati
                    </span>
                    {chk.summary.warning_count > 0 && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-amber-400">
                          {chk.summary.warning_count} Warning
                        </span>
                      </>
                    )}
                    {chk.summary.trouble_count > 0 && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-red-400 font-bold">
                          {chk.summary.trouble_count} Trouble
                        </span>
                      </>
                    )}
                  </div>

                  {chk.overall_remark && (
                    <p className="text-xs text-slate-400 truncate max-w-2xl mt-1">
                      Catatan: {chk.overall_remark}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => onViewDetail(chk)}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 min-h-[40px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>

                  <button
                    onClick={() => onViewReport(chk.id)}
                    className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-900/30 min-h-[40px]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Laporan</span>
                  </button>

                  <button
                    onClick={() => setChecklistToDelete(chk)}
                    className="py-2 px-2.5 text-slate-400 hover:text-red-300 hover:bg-red-950/60 border border-slate-700/60 hover:border-red-800/80 rounded-xl transition-colors flex items-center gap-1.5 text-xs min-h-[40px]"
                    title="Hapus checklist ini"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span className="text-[11px] font-semibold text-red-400">Hapus</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reusable Delete Confirmation Modal (Reliable in Iframe) */}
      <DeleteConfirmationModal
        isOpen={Boolean(checklistToDelete)}
        checklist={checklistToDelete}
        currentUser={currentUser}
        onClose={() => setChecklistToDelete(null)}
        onConfirm={() => {
          if (checklistToDelete) {
            onDeleteChecklist(checklistToDelete.id);
            setToastMessage(`Checklist tanggal ${checklistToDelete.checklist_date} berhasil dihapus.`);
            setTimeout(() => setToastMessage(''), 4000);
          }
        }}
      />

      {/* Floating Success Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
