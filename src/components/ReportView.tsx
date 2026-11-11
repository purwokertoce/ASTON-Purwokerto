import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Layers,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { Checklist, User as UserType } from '../types';

interface ReportViewProps {
  checklists: Checklist[];
  selectedChecklistId?: string;
  currentUser: UserType;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  checklists,
  selectedChecklistId,
  currentUser,
  onBack,
}) => {
  const [activeChecklistId, setActiveChecklistId] = useState<string>(
    selectedChecklistId || (checklists[0] ? checklists[0].id : '')
  );

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
                {c.checklist_date} ({c.checklist_time}) - {c.inspector_name}
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
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-100 rounded-xl mb-6 text-xs text-slate-700">
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
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Verifikasi</span>
            <p className="font-bold text-emerald-700">
              {activeChecklist.supervisor_approved ? 'Disetujui SPV' : 'Pemeriksaan Lapangan'}
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
          <div className="space-y-12">
            <span className="text-slate-500 font-semibold block text-[11px]">Dibuat Oleh (Technician)</span>
            <div className="border-b border-slate-400 mx-6"></div>
            <div>
              <p className="font-bold text-slate-900">{activeChecklist.inspector_name}</p>
              <p className="text-[10px] text-slate-500">ID: {activeChecklist.inspector_employee_id}</p>
            </div>
          </div>

          <div className="space-y-12">
            <span className="text-slate-500 font-semibold block text-[11px]">Diperiksa Oleh (Supervisor)</span>
            <div className="border-b border-slate-400 mx-6"></div>
            <div>
              <p className="font-bold text-slate-900">
                {activeChecklist.supervisor_name || 'Hendra Wijaya'}
              </p>
              <p className="text-[10px] text-slate-500">Supervisor MEP</p>
            </div>
          </div>

          <div className="space-y-12">
            <span className="text-slate-500 font-semibold block text-[11px]">Diketahui Oleh (Chief Engineer)</span>
            <div className="border-b border-slate-400 mx-6"></div>
            <div>
              <p className="font-bold text-slate-900">Ir. Bambang Setyawan, MT</p>
              <p className="text-[10px] text-slate-500">Chief Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
