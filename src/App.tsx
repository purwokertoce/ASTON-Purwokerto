/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  initializeStorage,
  getUsers,
  getCurrentUser,
  setCurrentUserId,
  getEquipmentList,
  updateEquipmentItem,
  getChecklists,
  saveChecklist,
  deleteChecklist,
} from './utils/storage';
import { User, Equipment, Checklist } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { NewChecklistFlow } from './components/NewChecklistFlow';
import { ChecklistHistoryView } from './components/ChecklistHistoryView';
import { ChecklistDetailModal } from './components/ChecklistDetailModal';
import { EquipmentMasterView } from './components/EquipmentMasterView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  // Initialize storage once on mount
  useEffect(() => {
    initializeStorage();
  }, []);

  const [users, setUsers] = useState<User[]>(() => {
    initializeStorage();
    return getUsers();
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    initializeStorage();
    return getCurrentUser();
  });

  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    initializeStorage();
    return getEquipmentList();
  });

  const [checklists, setChecklists] = useState<Checklist[]>(() => {
    initializeStorage();
    return getChecklists();
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [equipmentFilterStatus, setEquipmentFilterStatus] = useState<string>('all');
  const [selectedReportChecklistId, setSelectedReportChecklistId] = useState<string | undefined>(undefined);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [detailModalChecklist, setDetailModalChecklist] = useState<Checklist | null>(null);

  // Reload data helper
  const reloadData = () => {
    setUsers(getUsers());
    setCurrentUser(getCurrentUser());
    setEquipmentList(getEquipmentList());
    setChecklists(getChecklists());
  };

  // Switch active user
  const handleSwitchUser = (user: User) => {
    setCurrentUserId(user.id);
    setCurrentUser(user);
  };

  // Save new checklist
  const handleChecklistCompleted = (newChecklist: Checklist) => {
    setChecklists((prev) => [newChecklist, ...prev]);
    setEquipmentList(getEquipmentList()); // refresh master equipment statuses
    setSelectedReportChecklistId(newChecklist.id);
    setActiveTab('report');
  };

  // Delete checklist
  const handleDeleteChecklist = (id: string) => {
    deleteChecklist(id);
    setChecklists(getChecklists());
  };

  // Supervisor approve checklist
  const handleApproveChecklist = (checklistId: string, supervisorNotes: string) => {
    const chk = checklists.find((c) => c.id === checklistId);
    if (!chk) return;

    const updated: Checklist = {
      ...chk,
      supervisor_approved: true,
      supervisor_approved_at: new Date().toISOString(),
      supervisor_id: currentUser.id,
      supervisor_name: currentUser.name,
      supervisor_notes: supervisorNotes,
      updated_at: new Date().toISOString(),
    };

    saveChecklist(updated);
    setChecklists(getChecklists());
    setDetailModalChecklist(updated);
  };

  // Update master equipment item
  const handleUpdateEquipment = (eq: Equipment) => {
    updateEquipmentItem(eq);
    setEquipmentList(getEquipmentList());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenProfile={() => setShowProfileModal(true)}
        onStartNewChecklist={() => setActiveTab('new-checklist')}
      />

      {/* Main Body */}
      <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            checklists={checklists}
            equipmentList={equipmentList}
            currentUser={currentUser}
            onStartNewChecklist={() => setActiveTab('new-checklist')}
            onViewHistory={() => setActiveTab('history')}
            onViewReport={(chkId) => {
              setSelectedReportChecklistId(chkId);
              setActiveTab('report');
            }}
            onViewEquipment={(statusFilter) => {
              setEquipmentFilterStatus(statusFilter || 'all');
              setActiveTab('equipment');
            }}
            onViewChecklistDetail={(chk) => setDetailModalChecklist(chk)}
          />
        )}

        {activeTab === 'new-checklist' && (
          <NewChecklistFlow
            equipmentList={equipmentList}
            currentUser={currentUser}
            onChecklistCompleted={handleChecklistCompleted}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'history' && (
          <ChecklistHistoryView
            checklists={checklists}
            currentUser={currentUser}
            onViewDetail={(chk) => setDetailModalChecklist(chk)}
            onViewReport={(chkId) => {
              setSelectedReportChecklistId(chkId);
              setActiveTab('report');
            }}
            onDeleteChecklist={handleDeleteChecklist}
            onStartNewChecklist={() => setActiveTab('new-checklist')}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentMasterView
            equipmentList={equipmentList}
            currentUser={currentUser}
            onUpdateEquipment={handleUpdateEquipment}
            onStartNewChecklist={() => setActiveTab('new-checklist')}
            initialFilterStatus={equipmentFilterStatus}
          />
        )}

        {activeTab === 'report' && (
          <ReportView
            checklists={checklists}
            selectedChecklistId={selectedReportChecklistId}
            currentUser={currentUser}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            onDataReset={reloadData}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Profile & User Role Switcher Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        users={users}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
      />

      {/* Checklist Detail Modal */}
      {detailModalChecklist && (
        <ChecklistDetailModal
          checklist={detailModalChecklist}
          currentUser={currentUser}
          onClose={() => setDetailModalChecklist(null)}
          onViewReport={(chkId) => {
            setSelectedReportChecklistId(chkId);
            setActiveTab('report');
          }}
          onApproveChecklist={handleApproveChecklist}
        />
      )}
    </div>
  );
}
