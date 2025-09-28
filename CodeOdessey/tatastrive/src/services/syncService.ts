import { offlineStorage } from './offlineStorage';
import { StoryboardData } from '@/types/storyboard';
import { BusinessPlan } from '@/types/mentor';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncErrors: string[];
}

export interface SyncConflict {
  id: string;
  type: 'storyboard' | 'business_plan';
  localVersion: any;
  remoteVersion: any;
  conflictType: 'content' | 'metadata' | 'deletion';
  timestamp: Date;
}

export class SyncService {
  private static instance: SyncService;
  private syncStatus: SyncStatus = {
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0,
    syncErrors: []
  };
  private listeners: ((status: SyncStatus) => void)[] = [];
  private syncQueue: string[] = [];
  private conflictResolution: 'local' | 'remote' | 'manual' = 'manual';

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private setupEventListeners() {
    // Only set up event listeners in browser environment
    if (typeof window === 'undefined') return;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      // Don't auto-sync on online event since APIs don't exist yet
      // this.syncAll();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });

    // Listen for visibility change to sync when user returns
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.syncStatus.isOnline) {
        this.syncAll();
      }
    });
  }

  private startPeriodicSync() {
    // Only start periodic sync in browser environment
    if (typeof window === 'undefined') return;

    // Sync every 30 minutes when online (reduced frequency since APIs don't exist yet)
    setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
        this.syncAll();
      }
    }, 30 * 60 * 1000);
  }

  addStatusListener(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  async syncAll(): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing) {
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.syncErrors = [];
    this.notifyListeners();

    try {
      // Sync storyboards
      await this.syncStoryboards();
      
      // Sync business plans
      await this.syncBusinessPlans();
      
      // Update sync status
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.pendingChanges = 0;
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatus.syncErrors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async syncStoryboards(): Promise<void> {
    try {
      // Get local storyboards
      const localStoryboards = await offlineStorage.getAllStoryboards();
      
      // Get remote storyboards (mock API call)
      const remoteStoryboards = await this.fetchRemoteStoryboards();
      
      // Merge and resolve conflicts
      const mergedStoryboards = await this.mergeData(localStoryboards, remoteStoryboards, 'storyboard');
      
      // Save merged data locally
      for (const storyboard of mergedStoryboards) {
        await offlineStorage.saveStoryboard(storyboard);
      }
      
      // Upload local changes to remote
      await this.uploadLocalChanges(localStoryboards, 'storyboard');
      
    } catch (error) {
      console.error('Storyboard sync failed:', error);
      throw error;
    }
  }

  private async syncBusinessPlans(): Promise<void> {
    try {
      // Get local business plans
      const localBusinessPlans = await offlineStorage.getAllBusinessPlans();
      
      // Get remote business plans (mock API call)
      const remoteBusinessPlans = await this.fetchRemoteBusinessPlans();
      
      // Merge and resolve conflicts
      const mergedBusinessPlans = await this.mergeData(localBusinessPlans, remoteBusinessPlans, 'business_plan');
      
      // Save merged data locally
      for (const businessPlan of mergedBusinessPlans) {
        await offlineStorage.saveBusinessPlan(businessPlan);
      }
      
      // Upload local changes to remote
      await this.uploadLocalChanges(localBusinessPlans, 'business_plan');
      
    } catch (error) {
      console.error('Business plan sync failed:', error);
      throw error;
    }
  }

  private async mergeData(
    localData: any[], 
    remoteData: any[], 
    type: 'storyboard' | 'business_plan'
  ): Promise<any[]> {
    const merged: any[] = [];
    const processedIds = new Set<string>();

    // Process local data
    for (const localItem of localData) {
      const remoteItem = remoteData.find(r => r.id === localItem.id);
      
      if (remoteItem) {
        // Both local and remote exist - check for conflicts
        const conflict = this.detectConflict(localItem, remoteItem);
        
        if (conflict) {
          const resolved = await this.resolveConflict(conflict);
          merged.push(resolved);
        } else {
          // No conflict - use the most recently updated version
          merged.push(
            new Date(localItem.updatedAt) > new Date(remoteItem.updatedAt) 
              ? localItem 
              : remoteItem
          );
        }
      } else {
        // Only local exists - add to merged
        merged.push(localItem);
      }
      
      processedIds.add(localItem.id);
    }

    // Process remote data that doesn't exist locally
    for (const remoteItem of remoteData) {
      if (!processedIds.has(remoteItem.id)) {
        merged.push(remoteItem);
      }
    }

    return merged;
  }

  private detectConflict(localItem: any, remoteItem: any): SyncConflict | null {
    // Check if content has changed in both local and remote
    const localUpdated = new Date(localItem.updatedAt);
    const remoteUpdated = new Date(remoteItem.updatedAt);
    
    // If both were updated after last sync, there's a conflict
    if (localUpdated.getTime() !== remoteUpdated.getTime()) {
      return {
        id: localItem.id,
        type: 'storyboard', // This would be determined by the data type
        localVersion: localItem,
        remoteVersion: remoteItem,
        conflictType: 'content',
        timestamp: new Date()
      };
    }
    
    return null;
  }

  private async resolveConflict(conflict: SyncConflict): Promise<any> {
    switch (this.conflictResolution) {
      case 'local':
        return conflict.localVersion;
      case 'remote':
        return conflict.remoteVersion;
      case 'manual':
        // For now, use local version and log the conflict
        console.warn('Manual conflict resolution needed:', conflict);
        return conflict.localVersion;
      default:
        return conflict.localVersion;
    }
  }

  private async fetchRemoteStoryboards(): Promise<StoryboardData[]> {
    // Mock API call - in real implementation, this would call your backend
    try {
      const response = await fetch('/api/storyboards', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch remote storyboards: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch remote storyboards:', error);
      return [];
    }
  }

  private async fetchRemoteBusinessPlans(): Promise<BusinessPlan[]> {
    // Mock API call - in real implementation, this would call your backend
    try {
      const response = await fetch('/api/business-plans', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch remote business plans: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch remote business plans:', error);
      return [];
    }
  }

  private async uploadLocalChanges(localData: any[], type: string): Promise<void> {
    // Mock API call - in real implementation, this would upload to your backend
    try {
      // Convert type to correct API endpoint format
      const endpoint = type === 'business_plan' ? 'business-plans' : `${type}s`;
      const url = `/api/${endpoint}`;
      console.log(`[${new Date().toISOString()}] Uploading to endpoint: ${url} (type: ${type})`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(localData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload local changes: ${response.statusText}`);
      }
      
      console.log(`Upload successful to ${url}`);
    } catch (error) {
      console.error('Failed to upload local changes:', error);
      throw error;
    }
  }

  private getAuthToken(): string {
    // Get auth token from localStorage or auth context
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('authToken') || '';
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  // Public methods for manual sync control
  async forceSync(): Promise<void> {
    await this.syncAll();
  }

  async syncItem(id: string, type: 'storyboard' | 'business_plan'): Promise<void> {
    if (!this.syncStatus.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    this.syncStatus.isSyncing = true;
    this.notifyListeners();

    try {
      if (type === 'storyboard') {
        const storyboard = await offlineStorage.getStoryboard(id);
        if (storyboard) {
          await this.uploadLocalChanges([storyboard], 'storyboard');
        }
      } else {
        const businessPlan = await offlineStorage.getBusinessPlan(id);
        if (businessPlan) {
          await this.uploadLocalChanges([businessPlan], 'business_plan');
        }
      }
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  setConflictResolution(strategy: 'local' | 'remote' | 'manual') {
    this.conflictResolution = strategy;
  }

  async clearSyncErrors(): Promise<void> {
    this.syncStatus.syncErrors = [];
    this.notifyListeners();
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
