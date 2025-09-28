'use client';

import { useState, useEffect } from 'react';
import { syncService, SyncStatus as SyncStatusType } from '@/services/syncService';

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(syncService.getSyncStatus());

  useEffect(() => {
    const unsubscribe = syncService.addStatusListener(setSyncStatus);
    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500';
    if (syncStatus.isSyncing) return 'text-blue-500';
    if (syncStatus.syncErrors.length > 0) return 'text-yellow-500';
    if (syncStatus.lastSyncTime) return 'text-green-500';
    return 'text-gray-500';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.syncErrors.length > 0) return `${syncStatus.syncErrors.length} sync errors`;
    if (syncStatus.lastSyncTime) return `Last sync: ${syncStatus.lastSyncTime.toLocaleTimeString()}`;
    return 'Never synced';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return '🔴';
    if (syncStatus.isSyncing) return '🔄';
    if (syncStatus.syncErrors.length > 0) return '⚠️';
    if (syncStatus.lastSyncTime) return '✅';
    return '⚪';
  };

  const handleSyncClick = async () => {
    if (syncStatus.isOnline && !syncStatus.isSyncing) {
      try {
        await syncService.forceSync();
      } catch (error) {
        console.error('Manual sync failed:', error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        <span className="text-xs">{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
      </div>
      
      {syncStatus.pendingChanges > 0 && (
        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
          {syncStatus.pendingChanges} pending
        </span>
      )}
      
      {syncStatus.isOnline && !syncStatus.isSyncing && (
        <button
          onClick={handleSyncClick}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Sync now
        </button>
      )}
    </div>
  );
}
