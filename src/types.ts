/**
 * Types & Interfaces for Engineering Rooftop Checklist
 */

export type UserRole = 'admin' | 'supervisor' | 'technician';

export interface User {
  id: string;
  name: string;
  employee_id: string;
  role: UserRole;
  email: string;
  department: string;
  created_at: string;
}

export type EquipmentOperatingStatus = 'active' | 'mati' | 'rusak';

export type ChecklistItemStatus = 'not_checked' | 'checked' | 'warning' | 'trouble';

export type EquipmentCategory =
  | 'water_tank'
  | 'heat_pump'
  | 'booster_pump_cold'
  | 'booster_pump_hp'
  | 'return_pump'
  | 'screw_chiller'
  | 'chwp';

export interface Equipment {
  id: string;
  area_id: string;
  equipment_name: string;
  equipment_type: EquipmentCategory;
  equipment_number: string;
  status: EquipmentOperatingStatus;
  description: string;
  parent_equipment?: string; // e.g. Heat Pump 01 for Booster Pump Heat Pump 01
  location_detail?: string;
  capacity_spec?: string;
}

export interface Area {
  id: string;
  area_name: string;
  description: string;
}

export type PhotoType = 'unit' | 'display' | 'gauge' | 'damage';

export interface InspectionPhoto {
  id: string;
  checklist_id: string;
  equipment_id: string;
  photo_type: PhotoType;
  photo_url: string; // base64 compressed data url
  captured_at: string;
  uploaded_by: string;
  caption?: string;
}

export interface ScrewChillerParameters {
  temp_water?: number | string; // °C
  temp_oil?: number | string; // °C
  evap_press?: number | string; // bar
  lchtl?: number | string;
  rchtl?: number | string;
  signal_fan_running?: 'ON' | 'OFF';
}

export interface EquipmentParameters {
  // Water tank
  level_percent?: number | string; // 0-100%
  // Heat Pump
  temperature?: number | string; // °C
  // Booster pump
  pressure_bar?: number | string; // bar
  // Screw Chiller
  chiller?: ScrewChillerParameters;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  equipment_id: string;
  equipment_name: string;
  equipment_type: EquipmentCategory;
  operating_status: EquipmentOperatingStatus;
  status: ChecklistItemStatus;
  parameters: EquipmentParameters;
  photos: InspectionPhoto[];
  remark: string;
  has_warning?: boolean;
  warning_reason?: string;
  created_at: string;
}

export interface HeaderPressureChecks {
  cold_water_booster_pressure?: number | string; // bar
  cold_water_gauge_photo?: string;
  cold_water_remark?: string;
  hot_water_booster_pressure?: number | string; // bar
  hot_water_gauge_photo?: string;
  hot_water_remark?: string;
}

export interface Checklist {
  id: string;
  checklist_date: string; // YYYY-MM-DD
  checklist_time: string; // HH:mm
  inspector_id: string;
  inspector_name: string;
  inspector_employee_id: string;
  area_id: string;
  area_name: string;
  status: 'draft' | 'completed' | 'warning' | 'trouble';
  items: ChecklistItem[];
  header_pressures?: HeaderPressureChecks;
  summary: {
    total_equipment: number;
    checked_count: number;
    active_count: number;
    mati_count: number;
    rusak_count: number;
    warning_count: number;
    trouble_count: number;
  };
  overall_remark?: string;
  supervisor_approved?: boolean;
  supervisor_id?: string;
  supervisor_name?: string;
  supervisor_approved_at?: string;
  supervisor_notes?: string;
  admin_approved?: boolean;
  admin_id?: string;
  admin_name?: string;
  admin_approved_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WarningThresholds {
  tank_cold_min: number;
  tank_cold_max: number;
  tank_hot_min: number;
  tank_hot_max: number;
  hp_temp_min: number;
  hp_temp_max: number;
  bp_cold_pressure_min: number;
  bp_cold_pressure_max: number;
  bp_hot_pressure_min: number;
  bp_hot_pressure_max: number;
  chiller_temp_water_max: number;
  chiller_temp_oil_max: number;
  chiller_evap_press_min: number;
  chiller_evap_press_max: number;
}
