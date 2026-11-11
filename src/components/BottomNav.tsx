import React from 'react';
import { LayoutDashboard, PlusCircle, History, Sliders, FileText } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-checklist', label: 'Checklist', icon: PlusCircle, isPrimary: true },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'equipment', label: 'Alat (23)', icon: Sliders },
    { id: 'report', label: 'Laporan', icon: FileText },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 pb-safe md:hidden no-print">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 text-center -mt-3 group focus:outline-none"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-blue-600/40'
                      : 'bg-blue-600/90 text-white hover:bg-blue-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-tight mt-1 truncate max-w-[58px] ${
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] py-1 text-center transition-colors focus:outline-none"
            >
              <div
                className={`transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 truncate max-w-[58px] ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
