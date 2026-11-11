import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sliders,
  Edit2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  PowerOff,
  Activity,
  Layers,
  Droplets,
  Thermometer,
  Gauge,
  Wind,
  Info,
} from 'lucide-react';
import { Equipment, EquipmentCategory, EquipmentOperatingStatus, User } from '../types';

interface EquipmentMasterViewProps {
  equipmentList: Equipment[];
  currentUser: User;
  onUpdateEquipment: (eq: Equipment) => void;
  onStartNewChecklist: () => void;
  initialFilterStatus?: string;
}

export const EquipmentMasterView: React.FC<EquipmentMasterViewProps> = ({
  equipmentList,
  currentUser,
  onUpdateEquipment,
  onStartNewChecklist,
  initialFilterStatus = 'all',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilterStatus);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const filteredList = useMemo(() => {
    return equipmentList.filter((eq) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = eq.equipment_name.toLowerCase().includes(term);
        const matchesDesc = (eq.description || '').toLowerCase().includes(term);
        const matchesSpec = (eq.capacity_spec || '').toLowerCase().includes(term);
        const matchesLoc = (eq.location_detail || '').toLowerCase().includes(term);
        if (!matchesName && !matchesDesc && !matchesSpec && !matchesLoc) return false;
      }

      // Category
      if (selectedCategory !== 'all' && eq.equipment_type !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && eq.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [equipmentList, searchTerm, selectedCategory, selectedStatus]);

  const getCategoryIcon = (cat: EquipmentCategory) => {
    switch (cat) {
      case 'water_tank':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'heat_pump':
        return <Thermometer className="w-4 h-4 text-amber-400" />;
      case 'booster_pump_cold':
      case 'booster_pump_hp':
      case 'return_pump':
        return <Gauge className="w-4 h-4 text-blue-400" />;
      case 'screw_chiller':
      case 'chwp':
        return <Wind className="w-4 h-4 text-sky-400" />;
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipment) {
      onUpdateEquipment(editingEquipment);
      setEditingEquipment(null);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
            <span>MASTER EQUIPMENT · ROOFTOP AREA</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Daftar 23 Unit Peralatan Engineering
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Database spesifikasi teknis, lokasi, dan status operasional peralatan rooftop.
          </p>
        </div>

        <button
          onClick={onStartNewChecklist}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-colors self-start sm:self-center"
        >
          <span>Mulai Checklist</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama alat (Screw Chiller, Heat Pump, Tank, Booster Pump, CHWP)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filter buttons / tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          {/* Status Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 mr-1 font-semibold">Status:</span>
            {[
              { id: 'all', label: 'Semua (23)' },
              { id: 'active', label: '🟢 Active' },
              { id: 'mati', label: '⚫ Mati' },
              { id: 'rusak', label: '🔴 Rusak' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedStatus(btn.id)}
                className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
                  selectedStatus === btn.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white"
            >
              <option value="all">Semua Kategori</option>
              <option value="water_tank">Tangki Air (2)</option>
              <option value="heat_pump">Heat Pump (3)</option>
              <option value="booster_pump_cold">Booster Pump Cold (3)</option>
              <option value="booster_pump_hp">Booster Pump Heat Pump (6)</option>
              <option value="return_pump">Return Pump (2)</option>
              <option value="screw_chiller">Screw Chiller (3)</option>
              <option value="chwp">CHWP (4)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredList.map((eq, index) => {
          const isActive = eq.status === 'active';
          const isMati = eq.status === 'mati';
          const isRusak = eq.status === 'rusak';

          return (
            <div
              key={eq.id}
              className={`rounded-2xl border p-4 transition-all shadow-md flex flex-col justify-between ${
                isRusak
                  ? 'bg-red-950/20 border-red-800'
                  : 'bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(eq.equipment_type)}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {eq.equipment_name}
                      </h3>
                      {eq.parent_equipment && (
                        <p className="text-[11px] text-blue-400 font-medium mt-0.5">
                          {eq.parent_equipment}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold shrink-0 ${
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

                {/* Specs and Description */}
                <div className="text-xs text-slate-300 space-y-1.5 my-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {eq.capacity_spec && (
                    <p className="flex justify-between">
                      <span className="text-slate-400">Spesifikasi:</span>
                      <strong className="text-white text-right max-w-[170px] truncate">
                        {eq.capacity_spec}
                      </strong>
                    </p>
                  )}
                  {eq.location_detail && (
                    <p className="flex justify-between">
                      <span className="text-slate-400">Lokasi:</span>
                      <span className="text-slate-300 text-right">{eq.location_detail}</span>
                    </p>
                  )}
                  {eq.description && (
                    <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                      {eq.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">ID: {eq.id}</span>
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={() => setEditingEquipment(eq)}
                    className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit (Admin)</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500">Rooftop Area</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Equipment Modal (Admin Role) */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit Master Equipment</h3>
              <button
                type="button"
                onClick={() => setEditingEquipment(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama Equipment:</label>
                <input
                  type="text"
                  value={editingEquipment.equipment_name}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, equipment_name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Status Operasional:</label>
                <select
                  value={editingEquipment.status}
                  onChange={(e) =>
                    setEditingEquipment({
                      ...editingEquipment,
                      status: e.target.value as EquipmentOperatingStatus,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="active">Active (🟢 Beroperasi)</option>
                  <option value="mati">Mati (⚫ Standby)</option>
                  <option value="rusak">Rusak (🔴 Butuh Perbaikan)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Spesifikasi Kapasitas:</label>
                <input
                  type="text"
                  value={editingEquipment.capacity_spec || ''}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, capacity_spec: e.target.value })
                  }
                  placeholder="Kapasitas 40,000 Liter / 180 TR..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Lokasi Detail di Rooftop:</label>
                <input
                  type="text"
                  value={editingEquipment.location_detail || ''}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, location_detail: e.target.value })
                  }
                  placeholder="Ruang Pompa / Yard Chiller..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Deskripsi / Catatan:</label>
                <textarea
                  rows={2}
                  value={editingEquipment.description || ''}
                  onChange={(e) =>
                    setEditingEquipment({ ...editingEquipment, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingEquipment(null)}
                className="py-2 px-4 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
