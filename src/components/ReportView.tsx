import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Calendar,
  User,
  ShieldCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Layers,
  Clock,
  ChevronDown,
  X,
  Trash2,
} from 'lucide-react';
import { Checklist, User as UserType } from '../types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface ReportViewProps {
  checklists: Checklist[];
  selectedChecklistId?: string;
  currentUser: UserType;
  onBack: () => void;
  onApproveChecklist?: (checklistId: string, supervisorNotes: string) => void;
  onAdminApproveChecklist?: (checklistId: string, adminNotes: string) => void;
  onDeleteChecklist?: (id: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  checklists,
  selectedChecklistId,
  currentUser,
  onBack,
  onApproveChecklist,
  onAdminApproveChecklist,
  onDeleteChecklist,
}) => {
  const [activeChecklistId, setActiveChecklistId] = useState<string>(
    selectedChecklistId || (checklists[0] ? checklists[0].id : '')
  );
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');
  const [spvNotesInput, setSpvNotesInput] = useState<string>('');
  const [showAdminApprovalModal, setShowAdminApprovalModal] = useState<boolean>(false);
  const [showSpvApprovalModal, setShowSpvApprovalModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const activeChecklist = useMemo(() => {
    return checklists.find((c) => c.id === activeChecklistId) || checklists[0];
  }, [checklists, activeChecklistId]);

  if (!activeChecklist) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-slate-400">
        <p>Belum ada data checklist untuk dicetak ke dalam laporan.</p>
      </div>
    );
  }

  const dateFormatted = new Date(activeChecklist.checklist_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  // CSV export
  const handleExportCsv = () => {
    const headers = [
      'No',
      'Equipment Name',
      'Category',
      'Status Operasional',
      'Parameter',
      'Catatan / Remark',
    ];

    const rows = activeChecklist.items.map((item, idx) => {
      let paramStr = '';
      if (item.parameters.level_percent !== undefined) {
        paramStr = `Level: ${item.parameters.level_percent}%`;
      } else if (item.parameters.temperature !== undefined) {
        paramStr = `Temp: ${item.parameters.temperature} °C`;
      } else if (item.parameters.pressure_bar !== undefined) {
        paramStr = `Pressure: ${item.parameters.pressure_bar} bar`;
      } else if (item.parameters.chiller) {
        paramStr = `Water: ${item.parameters.chiller.temp_water}°C, Oil: ${item.parameters.chiller.temp_oil}°C, Evap: ${item.parameters.chiller.evap_press} bar, Fan: ${item.parameters.chiller.signal_fan_running}`;
      }

      return [
        idx + 1,
        `"${item.equipment_name}"`,
        `"${item.equipment_type}"`,
        `"${item.operating_status.toUpperCase()}"`,
        `"${paramStr}"`,
        `"${(item.remark || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `DAILY ENGINEERING ROOFTOP CHECKLIST`,
        `Tanggal,${activeChecklist.checklist_date} ${activeChecklist.checklist_time}`,
        `Inspector,${activeChecklist.inspector_name} (${activeChecklist.inspector_employee_id})`,
        `Area,${activeChecklist.area_name}`,
        '',
        headers.join(','),
        ...rows,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rooftop_Checklist_${activeChecklist.checklist_date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 md:pb-12">
      {/* Control Action Bar (Screen Only - Hidden in Print) */}
      <div className="no-print bg-slate-850 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-300">Pilih Tanggal Laporan:</label>
          <select
            value={activeChecklist.id}
            onChange={(e) => setActiveChecklistId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            {checklists.map((c) => (
              <option key={c.id} value={c.id}>
                {c.checklist_date} ({c.checklist_time}) - {c.inspector_name} {c.admin_approved ? '✓ Diketahui CE' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="py-2 px-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 min-h-[40px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-900/30 min-h-[40px]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Download PDF</span>
          </button>

          {onDeleteChecklist && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="py-2 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px]"
              title="Hapus laporan ini"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">Hapus Laporan</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Approval Notification Banners (Screen Only - for Admin & SPV) */}
      <div className="no-print space-y-3">
        {/* Chief Engineer / Admin Quick Approval Banner */}
        {currentUser.role === 'admin' && !activeChecklist.admin_approved && (
          <div className="p-4 bg-purple-950/40 border border-purple-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Persetujuan Mengetahui Chief Engineer (Admin)</span>
                  <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full uppercase font-mono">
                    Perlu Approval
                  </span>
                </h4>
                <p className="text-xs text-purple-200/80 mt-0.5">
                  Anda login sebagai Chief Engineer ({currentUser.name}). Berikan persetujuan mengetahui untuk mengesahkan laporan inspeksi rooftop ini.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAdminApprovalModal(true)}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-md shadow-purple-950 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Setujui Mengetahui Laporan</span>
            </button>
          </div>
        )}

        {/* Supervisor Quick Approval Banner */}
        {(currentUser.role === 'supervisor' || currentUser.role === 'admin') && !activeChecklist.supervisor_approved && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Verifikasi & Tanda Tangan Supervisor MEP</span>
                  <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-full uppercase font-mono">
                    Belum Diverifikasi
                  </span>
                </h4>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Periksa parameter dan berikan verifikasi hasil temuan checklist lapangan oleh teknisi.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSpvApprovalModal(true)}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-md shadow-emerald-950 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verifikasi & Setujui SPV</span>
            </button>
          </div>
        )}
      </div>

      {/* Printable Report Document (Styled for both Screen and High-Res Paper Print) */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-700 block">
              HOTEL ENGINEERING & MAINTENANCE DEPARTMENT
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              DAILY ENGINEERING ROOFTOP CHECKLIST
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Daily Engineering Inspection & Monitoring System
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 font-mono">
            <p>
              <strong className="text-slate-900">Form No:</strong> ENG-ROOF-CHKL-01
            </p>
            <p>
              <strong className="text-slate-900">Checklist ID:</strong> {activeChecklist.id}
            </p>
            <p>
              <strong className="text-slate-900">Area:</strong> {activeChecklist.area_name}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3.5 bg-slate-100 rounded-xl mb-6 text-xs text-slate-700">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Hari, Tanggal</span>
            <p className="font-bold text-slate-900">{dateFormatted}</p>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Waktu Inspeksi</span>
            <p className="font-bold text-slate-900 font-mono">{activeChecklist.checklist_time} WIB</p>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Duty Inspector</span>
            <p className="font-bold text-slate-900">{activeChecklist.inspector_name}</p>
            <p className="text-[11px] text-slate-500">{activeChecklist.inspector_employee_id}</p>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Verifikasi SPV</span>
            <p className={`font-bold ${activeChecklist.supervisor_approved ? 'text-emerald-700' : 'text-amber-600'}`}>
              {activeChecklist.supervisor_approved ? `✓ Disetujui (${activeChecklist.supervisor_name || 'SPV'})` : '⏳ Belum Verifikasi'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Mengetahui (Chief)</span>
            <p className={`font-bold ${activeChecklist.admin_approved ? 'text-purple-700' : 'text-amber-600'}`}>
              {activeChecklist.admin_approved ? `✓ Diketahui (${activeChecklist.admin_name || 'Chief'})` : '⏳ Menunggu Admin'}
            </p>
          </div>
        </div>

        {/* Summary Table per Section 22 */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Ringkasan Status Peralatan (Summary):
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Total Equipment</span>
              <strong className="text-base text-slate-900 font-mono">{activeChecklist.summary.total_equipment}</strong>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
              <span className="block text-[10px]">Active</span>
              <strong className="text-base font-mono">{activeChecklist.summary.active_count}</strong>
            </div>
            <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-slate-700">
              <span className="block text-[10px]">Mati / Standby</span>
              <strong className="text-base font-mono">{activeChecklist.summary.mati_count}</strong>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
              <span className="block text-[10px]">Warning</span>
              <strong className="text-base font-mono">{activeChecklist.summary.warning_count}</strong>
            </div>
            <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-red-800">
              <span className="block text-[10px]">Rusak / Trouble</span>
              <strong className="text-base font-mono">{activeChecklist.summary.rusak_count}</strong>
            </div>
          </div>
        </div>

        {/* Header Pressure Section if present */}
        {activeChecklist.header_pressures && (
          <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-800 block mb-1 uppercase tracking-wide">
              Tekanan Header Pipa Rooftop:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500">Cold Water Booster Pressure:</span>{' '}
                <strong className="font-mono text-slate-900">
                  {activeChecklist.header_pressures.cold_water_booster_pressure} bar
                </strong>
                <p className="text-[11px] text-slate-600">{activeChecklist.header_pressures.cold_water_remark}</p>
              </div>
              <div>
                <span className="text-slate-500">Hot Water Booster Pressure:</span>{' '}
                <strong className="font-mono text-slate-900">
                  {activeChecklist.header_pressures.hot_water_booster_pressure} bar
                </strong>
                <p className="text-[11px] text-slate-600">{activeChecklist.header_pressures.hot_water_remark}</p>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Equipment Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300 uppercase tracking-wide text-[11px]">
                <th className="p-2 border border-slate-300 w-8 text-center">No</th>
                <th className="p-2 border border-slate-300">Equipment</th>
                <th className="p-2 border border-slate-300 w-24 text-center">Status</th>
                <th className="p-2 border border-slate-300">Nilai Parameter</th>
                <th className="p-2 border border-slate-300">Foto Dokumentasi</th>
                <th className="p-2 border border-slate-300">Remark / Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {activeChecklist.items.map((item, idx) => {
                const isActive = item.operating_status === 'active';
                const isMati = item.operating_status === 'mati';
                const isRusak = item.operating_status === 'rusak';

                return (
                  <tr
                    key={item.id || idx}
                    className={`border-b border-slate-300 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    } ${isRusak ? 'bg-red-50 text-red-900' : ''}`}
                  >
                    <td className="p-2 border border-slate-300 text-center font-mono font-semibold">
                      {idx + 1}
                    </td>
                    <td className="p-2 border border-slate-300 font-semibold text-slate-900">
                      {item.equipment_name}
                      <span className="block text-[10px] text-slate-500 font-normal capitalize">
                        {item.equipment_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : isMati
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.operating_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 font-mono text-[11px]">
                      {item.parameters.level_percent !== undefined && (
                        <span>Level: <strong>{item.parameters.level_percent}%</strong></span>
                      )}
                      {item.parameters.temperature !== undefined && (
                        <span>Temp: <strong>{item.parameters.temperature} °C</strong></span>
                      )}
                      {item.parameters.pressure_bar !== undefined && (
                        <span>Press: <strong>{item.parameters.pressure_bar} bar</strong></span>
                      )}
                      {item.parameters.chiller && (
                        <div className="space-y-0.5 text-[10px]">
                          <div>Water: {item.parameters.chiller.temp_water}°C | Oil: {item.parameters.chiller.temp_oil}°C</div>
                          <div>Evap: {item.parameters.chiller.evap_press} bar | Fan: {item.parameters.chiller.signal_fan_running}</div>
                          {(item.parameters.chiller.lchtl || item.parameters.chiller.rchtl) && (
                            <div>LCHTL/RCHTL: {item.parameters.chiller.lchtl}/{item.parameters.chiller.rchtl}</div>
                          )}
                        </div>
                      )}
                      {!item.parameters.level_percent &&
                        !item.parameters.temperature &&
                        !item.parameters.pressure_bar &&
                        !item.parameters.chiller && (
                          <span className="text-slate-400">-</span>
                        )}
                    </td>
                    <td className="p-2 border border-slate-300 w-28">
                      {item.photos && item.photos.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {item.photos.map((p) => (
                            <img
                              key={p.id}
                              src={p.photo_url}
                              alt="Thumbnail"
                              className="w-12 h-9 object-cover rounded border border-slate-300 inline-block"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="p-2 border border-slate-300 text-slate-700">
                      {item.remark || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Overall Remark */}
        <div className="p-3 bg-slate-100 rounded-xl mb-8 text-xs">
          <span className="font-bold text-slate-900 block mb-1">Catatan Keseluruhan Inspeksi:</span>
          <p className="text-slate-700">{activeChecklist.overall_remark || '-'}</p>
        </div>

        {/* Signatures Section (3 Roles: Duty Technician, Supervisor, Chief Engineer) */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-slate-800 text-center text-xs">
          {/* 1. Duty Technician */}
          <div className="flex flex-col justify-between min-h-[140px]">
            <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wide">
              1. Dibuat Oleh (Technician)
            </span>
            <div className="my-2">
              <div className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-[9px] font-mono font-bold text-slate-700">
                ✓ SUBMITTED LAPANGAN
              </div>
            </div>
            <div>
              <div className="border-b border-slate-400 mx-4 mb-1.5"></div>
              <p className="font-bold text-slate-900">{activeChecklist.inspector_name}</p>
              <p className="text-[10px] text-slate-500 font-mono">ID: {activeChecklist.inspector_employee_id}</p>
            </div>
          </div>

          {/* 2. Supervisor MEP */}
          <div className="flex flex-col justify-between min-h-[140px]">
            <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wide">
              2. Diperiksa Oleh (Supervisor)
            </span>
            <div className="my-2">
              {activeChecklist.supervisor_approved ? (
                <div className="inline-block px-3 py-1 rounded border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                  <p className="tracking-wider">✓ VERIFIED & APPROVED</p>
                  <p className="text-[8px] font-mono text-emerald-700 font-normal">
                    {activeChecklist.supervisor_approved_at
                      ? new Date(activeChecklist.supervisor_approved_at).toLocaleDateString('id-ID')
                      : ''}
                  </p>
                </div>
              ) : (
                <div className="inline-block px-2 py-1 rounded bg-amber-50 border border-dashed border-amber-400 text-amber-700 text-[9px]">
                  (Belum Diverifikasi)
                </div>
              )}
            </div>
            <div>
              <div className="border-b border-slate-400 mx-4 mb-1.5"></div>
              <p className="font-bold text-slate-900">
                {activeChecklist.supervisor_name || 'Tri Abidin Suyono'}
              </p>
              <p className="text-[10px] text-slate-500">Supervisor MEP</p>
              {activeChecklist.supervisor_notes && (
                <p className="text-[9px] text-slate-500 italic mt-0.5 max-w-[180px] mx-auto truncate">
                  "{activeChecklist.supervisor_notes}"
                </p>
              )}
            </div>
          </div>

          {/* 3. Chief Engineer (Admin) */}
          <div className="flex flex-col justify-between min-h-[140px]">
            <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wide">
              3. Diketahui Oleh (Chief Engineer)
            </span>
            <div className="my-2">
              {activeChecklist.admin_approved ? (
                <div className="inline-block px-3 py-1 rounded border-2 border-purple-700 bg-purple-50 text-purple-900 text-[10px] font-bold">
                  <p className="tracking-wider">✓ APPROVED & ACKNOWLEDGED</p>
                  <p className="text-[8px] font-mono text-purple-700 font-normal">
                    {activeChecklist.admin_approved_at
                      ? new Date(activeChecklist.admin_approved_at).toLocaleDateString('id-ID')
                      : ''}
                  </p>
                </div>
              ) : (
                <div className="inline-block px-2 py-1 rounded bg-amber-50 border border-dashed border-amber-400 text-amber-700 text-[9px]">
                  (Menunggu Persetujuan Mengetahui)
                </div>
              )}
            </div>
            <div>
              <div className="border-b border-slate-400 mx-4 mb-1.5"></div>
              <p className="font-bold text-slate-900">
                {activeChecklist.admin_name || (currentUser.role === 'admin' ? currentUser.name : 'Surya Budhi')}
              </p>
              <p className="text-[10px] text-slate-500">Chief Engineer</p>
              {activeChecklist.admin_notes && (
                <p className="text-[9px] text-slate-500 italic mt-0.5 max-w-[180px] mx-auto truncate">
                  "{activeChecklist.admin_notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Approval Modal for Report */}
      {showAdminApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-md bg-slate-900 border border-purple-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Persetujuan Mengetahui Chief Engineer</h3>
              </div>
              <button
                onClick={() => setShowAdminApprovalModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>Laporan: <strong>{activeChecklist.checklist_date} ({activeChecklist.checklist_time} WIB)</strong></p>
              <p>Duty Inspector: <strong>{activeChecklist.inspector_name}</strong></p>
              <p>Chief Engineer: <strong className="text-purple-400">{currentUser.name}</strong></p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Catatan / Instruksi Tindak Lanjut Chief Engineer (Opsional):
              </label>
              <textarea
                rows={3}
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Contoh: Laporan telah diketahui dan disetujui. Jadwalkan servis rutin Heat Pump sesuai SOP..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAdminApprovalModal(false)}
                className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onAdminApproveChecklist) {
                    onAdminApproveChecklist(activeChecklist.id, adminNotesInput);
                  }
                  setShowAdminApprovalModal(false);
                }}
                className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-950"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Tandatangani Mengetahui Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Approval Modal for Report */}
      {showSpvApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Verifikasi & Approval Supervisor MEP</h3>
              </div>
              <button
                onClick={() => setShowSpvApprovalModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>Laporan: <strong>{activeChecklist.checklist_date} ({activeChecklist.checklist_time} WIB)</strong></p>
              <p>Duty Inspector: <strong>{activeChecklist.inspector_name}</strong></p>
              <p>Supervisor: <strong className="text-emerald-400">{currentUser.name}</strong></p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Catatan Verifikasi Supervisor (Opsional):
              </label>
              <textarea
                rows={3}
                value={spvNotesInput}
                onChange={(e) => setSpvNotesInput(e.target.value)}
                placeholder="Contoh: Parameter telah diperiksa dan sesuai toleransi standar operasional..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSpvApprovalModal(false)}
                className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onApproveChecklist) {
                    onApproveChecklist(activeChecklist.id, spvNotesInput);
                  }
                  setShowSpvApprovalModal(false);
                }}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verifikasi & Tandatangani Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        checklist={activeChecklist}
        currentUser={currentUser}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (onDeleteChecklist) {
            onDeleteChecklist(activeChecklist.id);
            onBack();
          }
        }}
      />
    </div>
  );
};
