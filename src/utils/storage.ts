import { User, Equipment, Area, Checklist, ChecklistItem } from '../types';
import { INITIAL_USERS, INITIAL_AREA, INITIAL_EQUIPMENT, INITIAL_CHECKLISTS } from '../data/initialData';

const KEYS = {
  USERS: 'eng_rooftop_users',
  CURRENT_USER_ID: 'eng_rooftop_current_user_id',
  AREAS: 'eng_rooftop_areas',
  EQUIPMENT: 'eng_rooftop_equipment',
  CHECKLISTS: 'eng_rooftop_checklists',
  DRAFT_CHECKLIST: 'eng_rooftop_draft_checklist',
};

// Safe JSON parse
function safeParse<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Error parsing ${key} from storage:`, e);
    return fallback;
  }
}

// Initialization check
export function initializeStorage(): void {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER_ID)) {
    // Default to technician (Agus Prasetyo) for duty inspection flow
    localStorage.setItem(KEYS.CURRENT_USER_ID, 'user-003');
  }
  if (!localStorage.getItem(KEYS.AREAS)) {
    localStorage.setItem(KEYS.AREAS, JSON.stringify([INITIAL_AREA]));
  }
  if (!localStorage.getItem(KEYS.EQUIPMENT)) {
    localStorage.setItem(KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
  }
  if (!localStorage.getItem(KEYS.CHECKLISTS)) {
    localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(INITIAL_CHECKLISTS));
  }
}

// Users
export function getUsers(): User[] {
  return safeParse<User[]>(KEYS.USERS, INITIAL_USERS);
}

export function getCurrentUser(): User {
  const users = getUsers();
  const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID) || 'user-003';
  return users.find((u) => u.id === currentId) || users[0];
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
}

// Equipment
export function getEquipmentList(): Equipment[] {
  return safeParse<Equipment[]>(KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
}

export function updateEquipmentItem(equipment: Equipment): void {
  const list = getEquipmentList();
  const index = list.findIndex((e) => e.id === equipment.id);
  if (index >= 0) {
    list[index] = equipment;
  } else {
    list.push(equipment);
  }
  localStorage.setItem(KEYS.EQUIPMENT, JSON.stringify(list));
}

// Checklists
export function getChecklists(): Checklist[] {
  return safeParse<Checklist[]>(KEYS.CHECKLISTS, INITIAL_CHECKLISTS);
}

export function getChecklistById(id: string): Checklist | undefined {
  const list = getChecklists();
  return list.find((c) => c.id === id);
}

export function saveChecklist(checklist: Checklist): void {
  const list = getChecklists();
  const index = list.findIndex((c) => c.id === checklist.id);
  if (index >= 0) {
    list[index] = checklist;
  } else {
    list.unshift(checklist); // newest first
  }
  localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(list));

  // Update current operational status of equipment in master list
  const equipmentList = getEquipmentList();
  checklist.items.forEach((item) => {
    const eq = equipmentList.find((e) => e.id === item.equipment_id);
    if (eq) {
      eq.status = item.operating_status;
    }
  });
  localStorage.setItem(KEYS.EQUIPMENT, JSON.stringify(equipmentList));
}

export function deleteChecklist(id: string): void {
  const list = getChecklists().filter((c) => c.id !== id);
  localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(list));
}

// Draft Checklist (Auto-save)
export function getDraftChecklist(): Partial<Checklist> | null {
  return safeParse<Partial<Checklist> | null>(KEYS.DRAFT_CHECKLIST, null);
}

export function saveDraftChecklist(draft: Partial<Checklist>): void {
  localStorage.setItem(KEYS.DRAFT_CHECKLIST, JSON.stringify(draft));
}

export function clearDraftChecklist(): void {
  localStorage.removeItem(KEYS.DRAFT_CHECKLIST);
}

// Reset data
export function resetToDemoData(): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(KEYS.CURRENT_USER_ID, 'user-003');
  localStorage.setItem(KEYS.AREAS, JSON.stringify([INITIAL_AREA]));
  localStorage.setItem(KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
  localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(INITIAL_CHECKLISTS));
  localStorage.removeItem(KEYS.DRAFT_CHECKLIST);
}

// Export / Import
export function exportAllDataJson(): string {
  const exportData = {
    app: 'Engineering Rooftop Checklist',
    version: '1.0',
    exported_at: new Date().toISOString(),
    users: getUsers(),
    areas: safeParse(KEYS.AREAS, [INITIAL_AREA]),
    equipment: getEquipmentList(),
    checklists: getChecklists(),
  };
  return JSON.stringify(exportData, null, 2);
}

export function importAllDataJson(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.equipment && Array.isArray(data.equipment)) {
      localStorage.setItem(KEYS.EQUIPMENT, JSON.stringify(data.equipment));
    }
    if (data.checklists && Array.isArray(data.checklists)) {
      localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(data.checklists));
    }
    if (data.users && Array.isArray(data.users)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(data.users));
    }
    return true;
  } catch (e) {
    console.error('Import error', e);
    return false;
  }
}
