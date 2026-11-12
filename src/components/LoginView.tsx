import React, { useState } from 'react';
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  UserCheck,
  Wrench,
  CheckCircle,
  Building,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginViewProps {
  users: User[];
  onLogin: (email: string, name?: string, role?: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('technician');
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Silakan masukkan alamat email akun engineering Anda.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Format email tidak valid. Gunakan alamat email aktif.');
      return;
    }

    onLogin(cleanEmail, isRegisteringNew ? customName : undefined, isRegisteringNew ? customRole : undefined);
  };

  const handleQuickSelect = (userEmail: string) => {
    setEmail(userEmail);
    onLogin(userEmail);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'supervisor':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      default:
        return <Wrench className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Chief Engineer (Admin)';
      case 'supervisor':
        return 'Supervisor MEP';
      default:
        return 'Duty Technician';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#fc156c] text-white font-extrabold text-xl shadow-lg shadow-pink-900/40 mx-auto mb-1">
            EC
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Engineering Rooftop
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Sistem Inspeksi & Approval Laporan Checklist Rooftop
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Login dengan Email User</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Masuk untuk melakukan checklist lapangan atau persetujuan laporan
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2 animate-shake">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alamat Email Pengguna:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.user@astonhotelsinternational.com"
                  autoFocus
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {isRegisteringNew && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Teknisi / Engineer:
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role / Jabatan:
                  </label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as UserRole)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="technician">Duty Technician (Pelaksana Checklist)</option>
                    <option value="supervisor">Supervisor MEP (Verifikator Lapangan)</option>
                    <option value="admin">Chief Engineer (Admin / Approval Akhir)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setIsRegisteringNew(!isRegisteringNew)}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {isRegisteringNew ? '← Gunakan Akun Terdaftar' : '+ Daftarkan Email Tim Baru'}
              </button>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Building className="w-3 h-3" />
                Hotel Engineering
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-colors"
            >
              <span>Masuk ke Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login for Registered Engineering Accounts */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Atau Pilih Akun Tim Engineering
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="space-y-2 mt-2">
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const isSpv = u.role === 'supervisor';

                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickSelect(u.email)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-850 flex items-center justify-center shrink-0 border border-slate-700/60">
                        {getRoleIcon(u.role)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {u.name}
                          </p>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              isAdmin
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/80'
                                : isSpv
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-800/80'
                                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                            }`}
                          >
                            {getRoleLabel(u.role)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 group-hover:text-blue-400 font-semibold shrink-0">
                      Masuk →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>Aston Hotel Engineering & Maintenance Department</p>
          <p className="text-[11px] text-slate-600">
            Tingkat persetujuan berjenjang: Pelaksana (Teknisi) · Verifikasi (Supervisor) · Mengetahui (Chief Engineer)
          </p>
        </div>
      </div>
    </div>
  );
};
