import React from 'react';
import { X, Check, Shield, Wrench, UserCheck, Mail, IdCard, Building, LogOut } from 'lucide-react';
import { User, UserRole } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSwitchUser,
  onLogout,
}) => {
  if (!isOpen) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'supervisor':
        return <UserCheck className="w-5 h-5 text-blue-400" />;
      case 'technician':
        return <Wrench className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Chief Engineer (Admin)';
      case 'supervisor':
        return 'Supervisor MEP';
      case 'technician':
        return 'Duty Technician';
    }
  };

  const getRolePermissions = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return [
          'Kelola Master Peralatan & Area',
          'Akses & Edit Seluruh Checklist',
          'Persetujuan Akhir Laporan & Ekspor PDF',
          'Pengaturan Batas Parameter & Sistem',
        ];
      case 'supervisor':
        return [
          'Review & Verifikasi Hasil Checklist Lapangan',
          'Memberikan Tanda Tangan & Catatan Approval',
          'Monitoring Warning & Status Peralatan Rooftop',
          'Cetak Laporan Harian Engineering',
        ];
      case 'technician':
        return [
          'Melakukan Inspeksi & Checklist Harian Lapangan',
          'Input Nilai Parameter & Pengambilan Foto',
          'Melaporkan Kerusakan & Remark Kondisi Aktual',
          'Melihat Riwayat Pemeriksaan',
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-white">Profil & Pergantian User</h3>
            <p className="text-xs text-slate-400">Pilih role untuk menguji alur kerja teknisi, supervisor, atau chief</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Active User Card */}
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                {getRoleIcon(currentUser.role)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide">
                  Sedang Aktif
                </span>
                <h4 className="text-base font-bold text-white truncate">{currentUser.name}</h4>
                <p className="text-xs text-slate-300">{getRoleLabel(currentUser.role)}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>ID Karyawan: {currentUser.employee_id}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentUser.department}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentUser.email}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/60">
              <p className="text-xs font-semibold text-slate-300 mb-1.5">Hak Akses Role:</p>
              <ul className="space-y-1 text-xs text-slate-400">
                {getRolePermissions(currentUser.role).map((perm, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Switch User List */}
          <div>
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Pilih Akun Lain (Switch Role)
            </h5>
            <div className="space-y-2">
              {users.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        {getRoleIcon(u.role)}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold truncate text-white">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {getRoleLabel(u.role)} · {u.employee_id}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 px-2 py-1 bg-slate-800 rounded-md">
                        Pilih
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          {onLogout ? (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="py-2 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
