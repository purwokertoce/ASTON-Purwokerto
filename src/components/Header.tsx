import React from 'react';
import { User, ClipboardList, Shield, ChevronDown, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenProfile: () => void;
  onStartNewChecklist: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenProfile,
  onStartNewChecklist,
  onLogout,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Chief Engineer';
      case 'supervisor':
        return 'Supervisor MEP';
      default:
        return 'Duty Technician';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-left group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#fc156c] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-900/30">
              EC
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors whitespace-nowrap">
                Engineering Rooftop Checklist
              </span>
              <span className="hidden lg:block text-[11px] text-slate-400 font-medium">
                Hotel Engineering Daily Inspection
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links (Hidden on mobile, handled by bottom nav) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-850'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('new-checklist')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'new-checklist'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-850'
            }`}
          >
            New Checklist
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-850'
            }`}
          >
            Riwayat
          </button>
          <button
            onClick={() => onSelectTab('equipment')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'equipment'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-850'
            }`}
          >
            Equipment (23)
          </button>
          <button
            onClick={() => onSelectTab('report')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-850'
            }`}
          >
            Laporan
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-850'
            }`}
          >
            Pengaturan
          </button>
        </nav>

        {/* Zone 3: Actions & User Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onStartNewChecklist}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-900/30 transition-colors whitespace-nowrap min-h-[40px]"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Mulai Checklist</span>
          </button>

          {/* User selector / profile trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors text-left min-h-[40px]"
            title="Ganti Pengguna / Profil"
          >
            <div className="w-7 h-7 rounded-md bg-slate-700 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white truncate max-w-[130px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <span className="font-medium text-blue-400">{getRoleBadge(currentUser.role)}</span>
              </p>
              <p className="text-[9px] text-slate-500 font-mono truncate max-w-[130px]">
                {currentUser.email}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
          </button>

          {/* Logout Action */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 border border-slate-700 hover:border-red-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px]"
              title="Keluar / Logout Akun"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
