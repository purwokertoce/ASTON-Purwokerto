import { ChecklistItem, EquipmentParameters, EquipmentOperatingStatus, EquipmentCategory } from '../types';

export interface WarningCheckResult {
  hasWarning: boolean;
  status: 'checked' | 'warning' | 'trouble';
  reasons: string[];
}

export const DEFAULT_THRESHOLDS = {
  tank_cold_min: 25,
  tank_cold_max: 95,
  tank_hot_min: 25,
  tank_hot_max: 95,
  hp_temp_min: 42,
  hp_temp_max: 60,
  bp_cold_pressure_min: 3.0,
  bp_cold_pressure_max: 5.5,
  bp_hot_pressure_min: 3.0,
  bp_hot_pressure_max: 5.5,
  chiller_temp_water_max: 11.0,
  chiller_temp_oil_max: 68.0,
  chiller_evap_press_min: 3.5,
  chiller_evap_press_max: 5.8,
};

export function evaluateItemStatus(
  category: EquipmentCategory,
  operatingStatus: EquipmentOperatingStatus,
  params: EquipmentParameters,
  photosCount: number,
  remark: string
): WarningCheckResult {
  const reasons: string[] = [];

  // 1. If operating status is Rusak, it automatically triggers Trouble
  if (operatingStatus === 'rusak') {
    reasons.push('Status peralatan: RUSAK / TROUBLE');
    if (photosCount === 0) {
      reasons.push('Wajib melampirkan foto kondisi kerusakan');
    }
    if (!remark || remark.trim().length < 3) {
      reasons.push('Wajib mengisi keterangan/penjelasan kerusakan');
    }
    return {
      hasWarning: true,
      status: 'trouble',
      reasons,
    };
  }

  // If equipment is Mati (Off), it is logged as checked (normal off) unless specific note
  if (operatingStatus === 'mati') {
    return {
      hasWarning: false,
      status: 'checked',
      reasons: ['Peralatan dalam kondisi Mati / Standby'],
    };
  }

  // 2. Check parameter ranges for active equipment
  let hasTrouble = false;

  // Water Tanks
  if (category === 'water_tank' && params.level_percent !== undefined && params.level_percent !== '') {
    const lvl = Number(params.level_percent);
    if (!isNaN(lvl)) {
      if (lvl < 10) {
        reasons.push(`Level air sangat kritis: ${lvl}% (Batas aman min: 25%)`);
        hasTrouble = true;
      } else if (lvl < DEFAULT_THRESHOLDS.tank_cold_min) {
        reasons.push(`Level air rendah: ${lvl}% (Normal: 25-95%)`);
      } else if (lvl > DEFAULT_THRESHOLDS.tank_cold_max) {
        reasons.push(`Level air hampir meluap: ${lvl}% (Normal: 25-95%)`);
      }
    }
  }

  // Heat Pump
  if (category === 'heat_pump' && params.temperature !== undefined && params.temperature !== '') {
    const temp = Number(params.temperature);
    if (!isNaN(temp)) {
      if (temp > 65) {
        reasons.push(`Temperatur heat pump terlalu tinggi: ${temp}°C (Maks: 60°C)`);
        hasTrouble = true;
      } else if (temp < 38) {
        reasons.push(`Temperatur heat pump rendah: ${temp}°C (Min: 42°C)`);
      }
    }
  }

  // Booster Pump Cold
  if (category === 'booster_pump_cold' && params.pressure_bar !== undefined && params.pressure_bar !== '') {
    const press = Number(params.pressure_bar);
    if (!isNaN(press)) {
      if (press < 2.0) {
        reasons.push(`Tekanan pompa sangat rendah: ${press} bar (Min normal: 3.0 bar)`);
        hasTrouble = true;
      } else if (press < DEFAULT_THRESHOLDS.bp_cold_pressure_min) {
        reasons.push(`Tekanan pompa di bawah batas normal: ${press} bar`);
      } else if (press > DEFAULT_THRESHOLDS.bp_cold_pressure_max) {
        reasons.push(`Tekanan pompa berlebih: ${press} bar (Maks: 5.5 bar)`);
      }
    }
  }

  // Screw Chiller
  if (category === 'screw_chiller' && params.chiller) {
    const ch = params.chiller;
    if (ch.temp_water !== undefined && ch.temp_water !== '') {
      const tw = Number(ch.temp_water);
      if (!isNaN(tw) && tw > DEFAULT_THRESHOLDS.chiller_temp_water_max) {
        reasons.push(`Suhu air dingin chiller (Temp Water) tinggi: ${tw}°C (Maks: 11°C)`);
      }
    }
    if (ch.temp_oil !== undefined && ch.temp_oil !== '') {
      const to = Number(ch.temp_oil);
      if (!isNaN(to) && to > DEFAULT_THRESHOLDS.chiller_temp_oil_max) {
        reasons.push(`Suhu oli kompresor (Temp Oil) tinggi: ${to}°C (Maks: 68°C)`);
        hasTrouble = true;
      }
    }
    if (ch.evap_press !== undefined && ch.evap_press !== '') {
      const ep = Number(ch.evap_press);
      if (!isNaN(ep)) {
        if (ep < DEFAULT_THRESHOLDS.chiller_evap_press_min) {
          reasons.push(`Tekanan evaporator rendah: ${ep} bar`);
        } else if (ep > DEFAULT_THRESHOLDS.chiller_evap_press_max) {
          reasons.push(`Tekanan evaporator tinggi: ${ep} bar`);
        }
      }
    }
    if (ch.signal_fan_running === 'OFF' && operatingStatus === 'active') {
      reasons.push('Kipas pendingin (Fan Running) OFF saat unit beroperasi');
    }
  }

  if (hasTrouble) {
    return {
      hasWarning: true,
      status: 'trouble',
      reasons,
    };
  }

  if (reasons.length > 0) {
    return {
      hasWarning: true,
      status: 'warning',
      reasons,
    };
  }

  return {
    hasWarning: false,
    status: 'checked',
    reasons: [],
  };
}
