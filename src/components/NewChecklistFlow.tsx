import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Save,
  Send,
  Eye,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Check,
  Power,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Thermometer,
  Gauge,
  Droplets,
  Wind,
} from 'lucide-react';
import {
  Equipment,
  User,
  Checklist,
  ChecklistItem,
  EquipmentOperatingStatus,
  InspectionPhoto,
  HeaderPressureChecks,
  PhotoType,
} from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { PhotoViewerModal } from './PhotoViewerModal';
import { evaluateItemStatus } from '../utils/validation';
import {
  saveChecklist,
  saveDraftChecklist,
  getDraftChecklist,
  clearDraftChecklist,
} from '../utils/storage';

interface NewChecklistFlowProps {
  equipmentList: Equipment[];
  currentUser: User;
  onChecklistCompleted: (newChecklist: Checklist) => void;
  onCancel: () => void;
}

export const NewChecklistFlow: React.FC<NewChecklistFlowProps> = ({
  equipmentList,
  currentUser,
  onChecklistCompleted,
  onCancel,
}) => {
  // Mode: 'list' (rapid checklist card view) or 'step' (one-by-one wizard)
  const [viewMode, setViewMode] = useState<'list' | 'step'>('list');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [autoSaveMessage, setAutoSaveMessage] = useState<string | null>(null);

  // General checklist header state
  const [checklistId] = useState<string>(() => `chk-${Date.now()}`);
  const [inspectionDate, setInspectionDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [inspectionTime, setInspectionTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [overallRemark, setOverallRemark] = useState<string>('');

  // Header pressures (Section 10 & 11)
  const [headerPressures, setHeaderPressures] = useState<HeaderPressureChecks>({
    cold_water_booster_pressure: '4.2',
    cold_water_gauge_photo: '',
    cold_water_remark: 'Normal',
    hot_water_booster_pressure: '4.0',
    hot_water_gauge_photo: '',
    hot_water_remark: 'Normal',
  });

  // Checklist items state mapped by equipment ID
  const [itemsMap, setItemsMap] = useState<Record<string, ChecklistItem>>(() => {
    // Check if there is a draft saved
    const draft = getDraftChecklist();
    if (draft && draft.items && draft.items.length === equipmentList.length) {
      const map: Record<string, ChecklistItem> = {};
      draft.items.forEach((item) => {
        map[item.equipment_id] = item;
      });
      return map;
    }

    // Default initialization
    const initialMap: Record<string, ChecklistItem> = {};
    equipmentList.forEach((eq) => {
      initialMap[eq.id] = {
        id: `item-${eq.id}-${Date.now()}`,
        checklist_id: checklistId,
        equipment_id: eq.id,
        equipment_name: eq.equipment_name,
        equipment_type: eq.equipment_type,
        operating_status: eq.status || 'active',
        status: 'not_checked',
        parameters: {
          level_percent: eq.equipment_type === 'water_tank' ? 75 : undefined,
          temperature: eq.equipment_type === 'heat_pump' ? 50 : undefined,
          pressure_bar: eq.equipment_type === 'booster_pump_cold' ? 4.0 : undefined,
          chiller:
            eq.equipment_type === 'screw_chiller'
              ? {
                  temp_water: 7.2,
                  temp_oil: 46.0,
                  evap_press: 4.5,
                  lchtl: 85,
                  rchtl: 80,
                  signal_fan_running: 'ON',
                }
              : undefined,
        },
        photos: [],
        remark: 'Kondisi operasional normal.',
        created_at: new Date().toISOString(),
      };
    });
    return initialMap;
  });

  // Photo modal state
  const [cameraModalConfig, setCameraModalConfig] = useState<{
    isOpen: boolean;
    equipmentId: string;
    equipmentName: string;
    photoType: PhotoType;
    photoTypeLabel: string;
    targetField?: 'cold_gauge' | 'hot_gauge';
  } | null>(null);

  const [viewingPhoto, setViewingPhoto] = useState<InspectionPhoto | null>(null);

  // Auto-save draft timer
  useEffect(() => {
    const timer = setTimeout(() => {
      const itemsArray = Object.values(itemsMap);
      saveDraftChecklist({
        id: checklistId,
        checklist_date: inspectionDate,
        checklist_time: inspectionTime,
        inspector_id: currentUser.id,
        inspector_name: currentUser.name,
        inspector_employee_id: currentUser.employee_id,
        area_id: 'area-rooftop-01',
        area_name: 'ROOFTOP AREA',
        header_pressures: headerPressures,
        items: itemsArray,
        overall_remark: overallRemark,
      });
      setAutoSaveMessage('Draft tersimpan otomatis');
      setTimeout(() => setAutoSaveMessage(null), 2500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [itemsMap, headerPressures, overallRemark, inspectionDate, inspectionTime, checklistId, currentUser]);

  // Total checked calculation
  const itemsList = equipmentList.map((eq) => itemsMap[eq.id]);
  const checkedItemsCount = itemsList.filter((i) => i && i.status !== 'not_checked').length;
  const progressPercent = Math.round((checkedItemsCount / equipmentList.length) * 100);

  // Helper to update a specific item
  const updateItem = (equipmentId: string, updates: Partial<ChecklistItem>) => {
    setItemsMap((prev) => {
      const current = prev[equipmentId];
      if (!current) return prev;

      const merged = { ...current, ...updates };

      // Re-evaluate item warning status
      const evalResult = evaluateItemStatus(
        merged.equipment_type,
        merged.operating_status,
        merged.parameters,
        merged.photos.length,
        merged.remark
      );

      // If user interacted with the card, mark as checked unless evaluated as trouble/warning
      merged.status = evalResult.status;
      merged.has_warning = evalResult.hasWarning;
      merged.warning_reason = evalResult.reasons.join('; ');

      return {
        ...prev,
        [equipmentId]: merged,
      };
    });
  };

  // Open camera modal for item
  const handleOpenPhotoCapture = (
    equipmentId: string,
    equipmentName: string,
    photoType: PhotoType,
    photoTypeLabel: string,
    targetField?: 'cold_gauge' | 'hot_gauge'
  ) => {
    setCameraModalConfig({
      isOpen: true,
      equipmentId,
      equipmentName,
      photoType,
      photoTypeLabel,
      targetField,
    });
  };

  // Callback when photo is captured & compressed
  const handlePhotoCaptured = (photoDataUrl: string) => {
    if (!cameraModalConfig) return;

    if (cameraModalConfig.targetField === 'cold_gauge') {
      setHeaderPressures((prev) => ({
        ...prev,
        cold_water_gauge_photo: photoDataUrl,
      }));
    } else if (cameraModalConfig.targetField === 'hot_gauge') {
      setHeaderPressures((prev) => ({
        ...prev,
        hot_water_gauge_photo: photoDataUrl,
      }));
    } else {
      const { equipmentId, photoType, photoTypeLabel } = cameraModalConfig;
      const newPhoto: InspectionPhoto = {
        id: `photo-${Date.now()}`,
        checklist_id: checklistId,
        equipment_id: equipmentId,
        photo_type: photoType,
        photo_url: photoDataUrl,
        captured_at: new Date().toISOString(),
        uploaded_by: currentUser.name,
        caption: photoTypeLabel,
      };

      const currentPhotos = itemsMap[equipmentId]?.photos || [];
      updateItem(equipmentId, {
        photos: [...currentPhotos, newPhoto],
      });
    }

    setCameraModalConfig(null);
  };

  // Delete a photo
  const handleDeletePhoto = (equipmentId: string, photoId: string) => {
    const current = itemsMap[equipmentId];
    if (!current) return;
    const filtered = current.photos.filter((p) => p.id !== photoId);
    updateItem(equipmentId, { photos: filtered });
  };

  // Quick action: Fill all normal defaults with 1 tap (Technicians love this in the field)
  const handleQuickFillNormal = () => {
    const newMap: Record<string, ChecklistItem> = {};
    equipmentList.forEach((eq) => {
      const existing = itemsMap[eq.id];
      const isMati = eq.status === 'mati';
      newMap[eq.id] = {
        ...existing,
        operating_status: isMati ? 'mati' : 'active',
        status: 'checked',
        remark: isMati ? 'Unit dalam kondisi standby normal.' : 'Kondisi operasional normal, tidak ada kelainan suara/vibrasi.',
        parameters: {
          level_percent: eq.equipment_type === 'water_tank' ? 80 : undefined,
          temperature: eq.equipment_type === 'heat_pump' ? (isMati ? 28 : 50) : undefined,
          pressure_bar: eq.equipment_type === 'booster_pump_cold' ? (isMati ? 0 : 4.2) : undefined,
          chiller:
            eq.equipment_type === 'screw_chiller'
              ? isMati
                ? undefined
                : {
                    temp_water: 7.2,
                    temp_oil: 46.0,
                    evap_press: 4.6,
                    lchtl: 85,
                    rchtl: 82,
                    signal_fan_running: 'ON',
                  }
              : undefined,
        },
      };
    });
    setItemsMap(newMap);
    setAutoSaveMessage('Semua 23 alat diisi nilai operasional normal');
  };

  // Submit final checklist
  const handleSubmitChecklist = () => {
    const itemsArray = Object.values(itemsMap);

    // Calculate summary statistics
    let activeCount = 0;
    let matiCount = 0;
    let rusakCount = 0;
    let warningCount = 0;
    let troubleCount = 0;
    let checkedCount = 0;

    itemsArray.forEach((i) => {
      if (i.operating_status === 'active') activeCount++;
      if (i.operating_status === 'mati') matiCount++;
      if (i.operating_status === 'rusak') rusakCount++;
      if (i.status === 'warning') warningCount++;
      if (i.status === 'trouble') troubleCount++;
      if (i.status !== 'not_checked') checkedCount++;
    });

    const overallStatus = troubleCount > 0 || rusakCount > 0 ? 'trouble' : warningCount > 0 ? 'warning' : 'completed';

    const finalChecklist: Checklist = {
      id: checklistId,
      checklist_date: inspectionDate,
      checklist_time: inspectionTime,
      inspector_id: currentUser.id,
      inspector_name: currentUser.name,
      inspector_employee_id: currentUser.employee_id,
      area_id: 'area-rooftop-01',
      area_name: 'ROOFTOP AREA',
      status: overallStatus,
      header_pressures: headerPressures,
      items: itemsArray,
      summary: {
        total_equipment: equipmentList.length,
        checked_count: checkedCount,
        active_count: activeCount,
        mati_count: matiCount,
        rusak_count: rusakCount,
        warning_count: warningCount,
        trouble_count: troubleCount,
      },
      overall_remark: overallRemark || 'Pemeriksaan rutin seluruh peralatan rooftop telah selesai.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveChecklist(finalChecklist);
    clearDraftChecklist();
    onChecklistCompleted(finalChecklist);
  };

  // Renders a single equipment form card
  const renderEquipmentCard = (eq: Equipment, index: number) => {
    const item = itemsMap[eq.id];
    if (!item) return null;

    const isRusak = item.operating_status === 'rusak';
    const isMati = item.operating_status === 'mati';
    const isActive = item.operating_status === 'active';

    const statusBadge = () => {
      switch (item.status) {
        case 'trouble':
          return <span className="text-xs font-bold text-red-400 flex items-center gap-1">🔴 Trouble</span>;
        case 'warning':
          return <span className="text-xs font-bold text-amber-400 flex items-center gap-1">🟠 Warning</span>;
        case 'checked':
          return <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">🟢 Selesai</span>;
        default:
          return <span className="text-xs font-medium text-slate-400">Belum Diperiksa</span>;
      }
    };

    return (
      <div
        key={eq.id}
        id={`card-${eq.id}`}
        className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
          isRusak
            ? 'bg-red-950/20 border-red-800 shadow-lg shadow-red-950/20'
            : item.has_warning
            ? 'bg-amber-950/20 border-amber-800'
            : item.status === 'checked'
            ? 'bg-slate-850 border-slate-700/80'
            : 'bg-slate-850/60 border-slate-800'
        }`}
      >
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-md bg-slate-800 text-blue-400 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
              {index + 1}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{eq.equipment_name}</h3>
              </div>
              <p className="text-xs text-slate-400">
                {eq.parent_equipment ? `Bagian dari: ${eq.parent_equipment} · ` : ''}
                {eq.location_detail || 'Rooftop Area'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {statusBadge()}
          </div>
        </div>

        {/* Operating Status Selector (Active / Mati / Rusak) */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
            Status Operasional Equipment:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateItem(eq.id, { operating_status: 'active' })}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] transition-colors border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Active</span>
            </button>

            <button
              type="button"
              onClick={() => updateItem(eq.id, { operating_status: 'mati' })}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] transition-colors border ${
                isMati
                  ? 'bg-slate-700 text-white border-slate-600 shadow-md'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span>Mati / Standby</span>
            </button>

            <button
              type="button"
              onClick={() => updateItem(eq.id, { operating_status: 'rusak' })}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] transition-colors border ${
                isRusak
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950 animate-pulse'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-red-400 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span>Rusak</span>
            </button>
          </div>
        </div>

        {/* Dynamic Parameter Inputs based on equipment category */}
        <div className="mt-4 space-y-3">
          {/* 1. Water Tanks (Sections 5 & 6) */}
          {eq.equipment_type === 'water_tank' && (
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>Level Tangki Air (0–100%) *</span>
                </label>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {item.parameters.level_percent || 0}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={item.parameters.level_percent || 0}
                  onChange={(e) =>
                    updateItem(eq.id, {
                      parameters: { ...item.parameters, level_percent: Number(e.target.value) },
                    })
                  }
                  className="flex-1 accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="w-20">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.parameters.level_percent ?? ''}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                      updateItem(eq.id, {
                        parameters: { ...item.parameters, level_percent: val },
                      });
                    }}
                    placeholder="0-100"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Heat Pumps (Sections 7 & 12) */}
          {eq.equipment_type === 'heat_pump' && (
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <span>Temperatur Heat Pump (°C)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={item.parameters.temperature ?? ''}
                  onChange={(e) =>
                    updateItem(eq.id, {
                      parameters: { ...item.parameters, temperature: e.target.value },
                    })
                  }
                  placeholder="Contoh: 50.5"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                />
                <span className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono">
                  °C
                </span>
              </div>
            </div>
          )}

          {/* 3. Booster Pump Cold Water (Section 8) */}
          {eq.equipment_type === 'booster_pump_cold' && (
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-blue-400" />
                <span>Tekanan Pompa (Pressure Gauge)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={item.parameters.pressure_bar ?? ''}
                  onChange={(e) =>
                    updateItem(eq.id, {
                      parameters: { ...item.parameters, pressure_bar: e.target.value },
                    })
                  }
                  placeholder="Contoh: 4.2"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                />
                <span className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono">
                  bar
                </span>
              </div>
            </div>
          )}

          {/* 4. Screw Chiller Parameters (Section 14) */}
          {eq.equipment_type === 'screw_chiller' && isActive && (
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Wind className="w-4 h-4" />
                  Parameter Operasional Chiller
                </span>
                <span className="text-[11px] text-slate-400">Unit Sedang Beroperasi</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Temp Water */}
                <div>
                  <label className="block text-slate-400 mb-1">Temp Water (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item.parameters.chiller?.temp_water ?? ''}
                    onChange={(e) =>
                      updateItem(eq.id, {
                        parameters: {
                          ...item.parameters,
                          chiller: { ...item.parameters.chiller, temp_water: e.target.value },
                        },
                      })
                    }
                    placeholder="7.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                {/* Temp Oil */}
                <div>
                  <label className="block text-slate-400 mb-1">Temp Oil (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item.parameters.chiller?.temp_oil ?? ''}
                    onChange={(e) =>
                      updateItem(eq.id, {
                        parameters: {
                          ...item.parameters,
                          chiller: { ...item.parameters.chiller, temp_oil: e.target.value },
                        },
                      })
                    }
                    placeholder="45.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                {/* Evap Press */}
                <div>
                  <label className="block text-slate-400 mb-1">Evap Press (bar):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item.parameters.chiller?.evap_press ?? ''}
                    onChange={(e) =>
                      updateItem(eq.id, {
                        parameters: {
                          ...item.parameters,
                          chiller: { ...item.parameters.chiller, evap_press: e.target.value },
                        },
                      })
                    }
                    placeholder="4.8"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                {/* Signal Fan Running */}
                <div>
                  <label className="block text-slate-400 mb-1">Signal Fan Running:</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(eq.id, {
                          parameters: {
                            ...item.parameters,
                            chiller: { ...item.parameters.chiller, signal_fan_running: 'ON' },
                          },
                        })
                      }
                      className={`py-2 rounded text-xs font-bold ${
                        item.parameters.chiller?.signal_fan_running === 'ON'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(eq.id, {
                          parameters: {
                            ...item.parameters,
                            chiller: { ...item.parameters.chiller, signal_fan_running: 'OFF' },
                          },
                        })
                      }
                      className={`py-2 rounded text-xs font-bold ${
                        item.parameters.chiller?.signal_fan_running === 'OFF'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      OFF
                    </button>
                  </div>
                </div>

                {/* LCHTL */}
                <div>
                  <label className="block text-slate-400 mb-1">LCHTL (%):</label>
                  <input
                    type="text"
                    value={item.parameters.chiller?.lchtl ?? ''}
                    onChange={(e) =>
                      updateItem(eq.id, {
                        parameters: {
                          ...item.parameters,
                          chiller: { ...item.parameters.chiller, lchtl: e.target.value },
                        },
                      })
                    }
                    placeholder="85"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                {/* RCHTL */}
                <div>
                  <label className="block text-slate-400 mb-1">RCHTL (%):</label>
                  <input
                    type="text"
                    value={item.parameters.chiller?.rchtl ?? ''}
                    onChange={(e) =>
                      updateItem(eq.id, {
                        parameters: {
                          ...item.parameters,
                          chiller: { ...item.parameters.chiller, rchtl: e.target.value },
                        },
                      })
                    }
                    placeholder="80"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photo Upload & Gallery Section (Section 16) */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              Dokumentasi Foto ({item.photos.length})
              {isRusak && item.photos.length === 0 && (
                <span className="text-red-400 ml-1 font-bold">*Wajib Foto Kerusakan</span>
              )}
            </span>

            {/* Take Photo Trigger */}
            <button
              type="button"
              onClick={() =>
                handleOpenPhotoCapture(
                  eq.id,
                  eq.equipment_name,
                  isRusak ? 'damage' : 'unit',
                  isRusak ? 'Kondisi Kerusakan' : 'Kondisi Aktual Unit'
                )
              }
              className="py-1.5 px-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Ambil Foto</span>
            </button>
          </div>

          {/* Photos Thumbnails Grid */}
          {item.photos.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {item.photos.map((p) => (
                <div
                  key={p.id}
                  className="group relative aspect-4/3 rounded-lg overflow-hidden border border-slate-700 bg-black"
                >
                  <img
                    src={p.photo_url}
                    alt={p.caption || 'Foto Inspeksi'}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setViewingPhoto(p)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setViewingPhoto(p)}
                      className="w-7 h-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-blue-600"
                      title="Lihat Foto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(eq.id, p.id)}
                      className="w-7 h-7 rounded-full bg-red-900/80 text-red-200 flex items-center justify-center hover:bg-red-600"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic py-1">Belum ada foto yang dilampirkan.</p>
          )}
        </div>

        {/* Remark / Penjelasan Kerusakan (Section 18) */}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Catatan / Remark {isRusak ? <span className="text-red-400">*Wajib Diisi</span> : ''}:
          </label>
          <textarea
            rows={2}
            value={item.remark || ''}
            onChange={(e) => updateItem(eq.id, { remark: e.target.value })}
            placeholder={
              isRusak
                ? 'Jelaskan kronologi atau bentuk kerusakan peralatan...'
                : 'Catatan kondisi fisik, vibrasi, suara, rembesan...'
            }
            className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-white focus:outline-none transition-colors ${
              isRusak && (!item.remark || item.remark.length < 3)
                ? 'border-red-500/80 bg-red-950/20'
                : 'border-slate-700 focus:border-blue-500'
            }`}
          />
        </div>

        {/* Warning Badge if any */}
        {item.has_warning && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>{item.warning_reason}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-32">
      {/* Sticky Progress & Actions Top Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Checklist Rooftop Area
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-semibold">
                {checkedItemsCount}/{equipmentList.length} Selesai
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspector: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.employee_id})
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {autoSaveMessage && (
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                {autoSaveMessage}
              </span>
            )}

            {/* Quick fill all normal */}
            <button
              type="button"
              onClick={handleQuickFillNormal}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-blue-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 min-h-[40px]"
              title="Isi seluruh peralatan dengan parameter normal standar"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Set Semua Normal</span>
              <span className="sm:hidden">Auto Fill</span>
            </button>

            {/* Submit / Review CTA */}
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-colors min-h-[40px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Review & Simpan</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Header Info Card (Date, Time, Inspector, Header Pressures) */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            Parameter Utama Rooftop & Header
          </h3>
          <span className="text-xs text-slate-400">Tahap 1 / Inspeksi Area</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Tanggal Inspeksi:</label>
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Jam Pemeriksaan:</label>
            <input
              type="time"
              value={inspectionTime}
              onChange={(e) => setInspectionTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 10: Tekanan Booster Pump Cold Water Header */}
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Cold Water Booster Pressure (Header Utama)
              </span>
              <p className="text-[11px] text-slate-400">Tekanan distribusi air bersih pipa header utama rooftop</p>
            </div>
            <button
              type="button"
              onClick={() =>
                handleOpenPhotoCapture(
                  'header-cold',
                  'Header Booster Cold Water',
                  'gauge',
                  'Pressure Gauge Cold Water Header',
                  'cold_gauge'
                )
              }
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center border border-slate-700"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{headerPressures.cold_water_gauge_photo ? 'Ganti Foto Gauge' : 'Foto Gauge'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={headerPressures.cold_water_booster_pressure ?? ''}
              onChange={(e) =>
                setHeaderPressures((prev) => ({
                  ...prev,
                  cold_water_booster_pressure: e.target.value,
                }))
              }
              placeholder="4.2"
              className="w-32 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
            />
            <span className="text-xs text-slate-400 font-mono">bar</span>

            {headerPressures.cold_water_gauge_photo && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Foto terlampir
              </span>
            )}
          </div>
        </div>

        {/* Section 11: Tekanan Booster Pump Hot Water Header */}
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-400" />
                Hot Water Booster Pressure (Header Utama)
              </span>
              <p className="text-[11px] text-slate-400">Tekanan sirkulasi air panas pipa header utama rooftop</p>
            </div>
            <button
              type="button"
              onClick={() =>
                handleOpenPhotoCapture(
                  'header-hot',
                  'Header Booster Hot Water',
                  'gauge',
                  'Pressure Gauge Hot Water Header',
                  'hot_gauge'
                )
              }
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center border border-slate-700"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{headerPressures.hot_water_gauge_photo ? 'Ganti Foto Gauge' : 'Foto Gauge'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={headerPressures.hot_water_booster_pressure ?? ''}
              onChange={(e) =>
                setHeaderPressures((prev) => ({
                  ...prev,
                  hot_water_booster_pressure: e.target.value,
                }))
              }
              placeholder="4.0"
              className="w-32 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
            />
            <span className="text-xs text-slate-400 font-mono">bar</span>

            {headerPressures.hot_water_gauge_photo && (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Foto terlampir
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Equipment List Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Daftar 23 Unit Peralatan Rooftop
          </h3>
          <span className="text-xs text-slate-400">Silakan periksa setiap unit</span>
        </div>

        {equipmentList.map((eq, index) => renderEquipmentCard(eq, index))}
      </div>

      {/* Overall Remarks / Catatan Akhir */}
      <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-2">
        <label className="block text-sm font-bold text-white">
          Catatan Keseluruhan Inspeksi Rooftop:
        </label>
        <textarea
          rows={3}
          value={overallRemark}
          onChange={(e) => setOverallRemark(e.target.value)}
          placeholder="Ringkasan kondisi umum area rooftop, kebersihan, kebocoran pipa, kondisi cuaca..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-40 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => setShowReviewModal(true)}
          className="flex-1 max-w-md py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition-colors min-h-[44px]"
        >
          <Send className="w-4 h-4" />
          <span>Review & Submit Checklist ({checkedItemsCount}/23)</span>
        </button>
      </div>

      {/* Confirmation & Review Modal (Section 17 & 26) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi & Submit Checklist</h3>
                <p className="text-xs text-slate-400">Verifikasi ringkasan inspeksi sebelum disimpan permanen</p>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Inspector:</span>
                  <p className="font-bold text-white">{currentUser.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Waktu:</span>
                  <p className="font-bold text-white">{inspectionDate} {inspectionTime}</p>
                </div>
              </div>

              {/* Counts summary */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Total</span>
                  <span className="text-base font-bold text-white">{equipmentList.length}</span>
                </div>
                <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800">
                  <span className="text-emerald-300 block text-[10px]">Active</span>
                  <span className="text-base font-bold text-emerald-400">
                    {itemsList.filter((i) => i.operating_status === 'active').length}
                  </span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Mati</span>
                  <span className="text-base font-bold text-slate-300">
                    {itemsList.filter((i) => i.operating_status === 'mati').length}
                  </span>
                </div>
                <div className="bg-red-950/40 p-2.5 rounded-xl border border-red-800">
                  <span className="text-red-300 block text-[10px]">Rusak</span>
                  <span className="text-base font-bold text-red-400">
                    {itemsList.filter((i) => i.operating_status === 'rusak').length}
                  </span>
                </div>
              </div>

              {/* Warning list if any */}
              {itemsList.some((i) => i.operating_status === 'rusak' || i.has_warning) && (
                <div className="p-3 bg-red-950/20 border border-red-900/60 rounded-xl space-y-1.5">
                  <span className="font-bold text-red-400 block">Peringatan / Catatan Kerusakan:</span>
                  {itemsList
                    .filter((i) => i.operating_status === 'rusak' || i.has_warning)
                    .map((item, idx) => (
                      <div key={idx} className="text-red-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                        <span>
                          <strong>{item.equipment_name}:</strong> {item.warning_reason || item.remark}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <p className="text-slate-400">
                Setelah disubmit, checklist akan masuk ke menu <strong>Riwayat</strong> dan siap untuk ditinjau oleh Supervisor MEP serta dicetak ke dalam laporan resmi.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
              >
                Kembali Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  handleSubmitChecklist();
                }}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Konfirmasi & Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {cameraModalConfig?.isOpen && (
        <CameraCaptureModal
          isOpen={cameraModalConfig.isOpen}
          onClose={() => setCameraModalConfig(null)}
          onPhotoCaptured={handlePhotoCaptured}
          equipmentName={cameraModalConfig.equipmentName}
          inspectorName={currentUser.name}
          photoTypeLabel={cameraModalConfig.photoTypeLabel}
          checklistId={checklistId}
        />
      )}

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <PhotoViewerModal
          photo={viewingPhoto}
          onClose={() => setViewingPhoto(null)}
          equipmentName="Dokumentasi Inspeksi Rooftop"
        />
      )}
    </div>
  );
};
