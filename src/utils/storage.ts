import { User, Equipment, Area, Checklist, ChecklistItem } from '../types';
import { INITIAL_USERS, INITIAL_AREA, INITIAL_EQUIPMENT, INITIAL_CHECKLISTS } from '../data/initialData';

const KEYS = {
  USERS: 'eng_rooftop_users',
  CURRENT_USER_ID: 'eng_rooftop_current_user_id',
  AUTH_SESSION: 'eng_rooftop_auth_session',
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
    // Default to Chief Engineer / Admin
    localStorage.setItem(KEYS.CURRENT_USER_ID, 'user-001');
  }
  if (!localStorage.getItem(KEYS.AUTH_SESSION)) {
    localStorage.setItem(KEYS.AUTH_SESSION, 'true');
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
  const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID) || 'user-001';
  return users.find((u) => u.id === currentId) || users[0];
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
  localStorage.setItem(KEYS.AUTH_SESSION, 'true');
}

export function isUserAuthenticated(): boolean {
  return localStorage.getItem(KEYS.AUTH_SESSION) === 'true';
}

export function getUserByEmail(email: string): User | undefined {
  const users = getUsers();
  const cleanEmail = email.trim().toLowerCase();
  return users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
}

export function loginWithEmail(email: string, customName?: string, customRole?: 'admin' | 'supervisor' | 'technician'): User {
  const cleanEmail = email.trim().toLowerCase();
  const users = getUsers();
  let user = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);

  if (!user) {
    // Create new registered user
    const newId = `user-${Date.now().toString(36)}`;
    const randomNum = Math.floor(100 + Math.random() * 900);
    const assignedRole = customRole || (cleanEmail.includes('ce') || cleanEmail.includes('chief') || cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('spv') || cleanEmail.includes('super') ? 'supervisor' : 'technician');
    const assignedName = customName || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
    user = {
      id: newId,
      name: assignedName,
      employee_id: `ENG-${randomNum}`,
      role: assignedRole,
      email: email.trim(),
      department: assignedRole === 'admin' ? 'Engineering & Maintenance' : assignedRole === 'supervisor' ? 'Engineering MEP' : 'Shift Engineering',
      created_at: new Date().toISOString(),
    };

    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  localStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
  localStorage.setItem(KEYS.AUTH_SESSION, 'true');
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(KEYS.AUTH_SESSION);
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
