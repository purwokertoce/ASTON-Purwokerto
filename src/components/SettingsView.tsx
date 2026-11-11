import React, { useState } from 'react';
import {
  Settings,
  Database,
  RotateCcw,
  Download,
  Upload,
  Check,
  AlertCircle,
  Shield,
  Sliders,
} from 'lucide-react';
import { exportAllDataJson, importAllDataJson, resetToDemoData } from '../utils/storage';
import { User } from '../types';

interface SettingsViewProps {
  currentUser: User;
  onDataReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onDataReset }) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3500);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Engineering_Rooftop_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Backup data berhasil diunduh');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importAllDataJson(text);
        if (ok) {
          showNotification('Data inspeksi berhasil dipulihkan dari file backup!');
          onDataReset();
        } else {
          showNotification('Format berkas JSON tidak sesuai.', true);
        }
      } catch (err) {
        showNotification('Gagal membaca berkas backup.', true);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (confirm('Kembalikan semua data ke setelan awal demo? Semua data inspeksi baru akan direset.')) {
      resetToDemoData();
      showNotification('Data telah berhasil direset ke setelan demo.');
      onDataReset();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-12">
      {/* Title */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <h1 className="text-xl font-bold text-white tracking-tight">Pengaturan & Manajemen Sistem</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Konfigurasi batas parameter, cadangan data, dan informasi aplikasi Engineering Checklist.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Standard Threshold Reference */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Standar Batas Operasional (SOP MEP Rooftop)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Parameter evaluasi otomatis untuk mendeteksi status normal, warning, atau trouble.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="font-semibold text-cyan-400">Tangki Air (Cold & Hot Water Tank)</span>
            <p className="text-slate-300">Level Aman: <strong>20% – 100%</strong></p>
            <p className="text-[11px] text-slate-400">Trigger Warning: Level &lt; 20% (Kritis air tekor)</p>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="font-semibold text-amber-400">Heat Pump Air Panas</span>
            <p className="text-slate-300">Temperatur Normal: <strong>45°C – 60°C</strong></p>
            <p className="text-[11px] text-slate-400">Trigger Warning: Temp &lt; 40°C atau &gt; 65°C</p>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="font-semibold text-blue-400">Booster Pump Cold & Hot Water</span>
            <p className="text-slate-300">Tekanan Operasional: <strong>3.0 – 5.5 bar</strong></p>
            <p className="text-[11px] text-slate-400">Trigger Warning: Tekanan &lt; 3.0 bar atau &gt; 6.0 bar</p>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="font-semibold text-sky-400">Screw Chiller HVAC</span>
            <p className="text-slate-300">Temp Water: <strong>5.0°C – 10.0°C</strong> | Temp Oil: <strong>35°C – 65°C</strong></p>
            <p className="text-[11px] text-slate-400">Trigger Warning: Signal Fan OFF saat unit aktif</p>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Cadangan & Pemulihan Data (Backup & Restore)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Simpan seluruh arsip pemeriksaan dan master peralatan ke file JSON lokal, atau pulihkan dari file backup sebelumnya.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Unduh Cadangan (Export JSON)</span>
          </button>

          <label className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Pulihkan Data (Import JSON)</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone: Reset Demo */}
      <div className="bg-slate-850 border border-red-950/60 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Reset ke Data Awal Demo</span>
        </h3>
        <p className="text-xs text-slate-400">
          Mengembalikan semua master peralatan, data riwayat inspeksi, dan profil ke data demo awal hotel.
        </p>

        <button
          onClick={handleResetDemo}
          className="py-2.5 px-4 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-bold border border-red-800 transition-colors"
        >
          Reset Seluruh Data ke Demo Awal
        </button>
      </div>

      {/* App Info Footer */}
      <div className="text-center text-xs text-slate-500 space-y-1 pt-4">
        <p className="font-semibold text-slate-400">Engineering Rooftop Checklist v1.0.0</p>
        <p>Hotel Engineering Daily Inspection & Monitoring System</p>
        <p>© 2026 Hotel Engineering Department</p>
      </div>
    </div>
  );
};
