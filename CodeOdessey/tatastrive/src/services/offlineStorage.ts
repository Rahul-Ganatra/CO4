import { openDB, DBSchema, IDBPDatabase } from 'idb';
// @ts-ignore
import CryptoJS from 'crypto-js';
import { StoryboardData } from '@/types/storyboard';
import { BusinessPlan } from '@/types/mentor';

interface BusinessPlanDB extends DBSchema {
  storyboards: {
    key: string;
    value: StoryboardData & { encryptedData: string; lastModified: Date };
  };
  businessPlans: {
    key: string;
    value: BusinessPlan & { encryptedData: string; lastModified: Date };
  };
  user: {
    key: string;
    value: {
      id: string;
      name: string;
      email: string;
      lastSync: Date;
    };
  };
}

class OfflineStorageService {
  private db: IDBPDatabase<BusinessPlanDB> | null = null;
  private encryptionKey: string = 'tatastrive-default-key'; // In production, this should be user-specific

  async init(): Promise<void> {
    try {
      this.db = await openDB<BusinessPlanDB>('BusinessPlanDB', 2, {
        upgrade(db) {
          // Create storyboards store
          if (!db.objectStoreNames.contains('storyboards')) {
            const storyboardStore = db.createObjectStore('storyboards', { keyPath: 'id' });
            storyboardStore.createIndex('updatedAt', 'updatedAt');
          }
          
          // Create business plans store
          if (!db.objectStoreNames.contains('businessPlans')) {
            const businessPlanStore = db.createObjectStore('businessPlans', { keyPath: 'id' });
            businessPlanStore.createIndex('submissionDate', 'submissionDate');
            businessPlanStore.createIndex('status', 'status');
          }
          
          // Create user store
          if (!db.objectStoreNames.contains('user')) {
            db.createObjectStore('user', { keyPath: 'id' });
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw new Error('Offline storage initialization failed');
    }
  }

  private encrypt(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  async saveStoryboard(storyboard: StoryboardData): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      const encryptedData = this.encrypt(storyboard);
      const encryptedStoryboard = {
        ...storyboard,
        encryptedData,
        lastModified: new Date()
      };

      await this.db!.put('storyboards', encryptedStoryboard);
    } catch (error) {
      console.error('Failed to save storyboard:', error);
      throw new Error('Failed to save storyboard offline');
    }
  }

  async getStoryboard(id: string): Promise<StoryboardData | null> {
    if (!this.db) {
      await this.init();
    }

    try {
      const encryptedStoryboard = await this.db!.get('storyboards', id);
      if (!encryptedStoryboard) return null;

      return this.decrypt(encryptedStoryboard.encryptedData);
    } catch (error) {
      console.error('Failed to get storyboard:', error);
      return null;
    }
  }

  async getAllStoryboards(): Promise<StoryboardData[]> {
    if (!this.db) {
      await this.init();
    }

    try {
      const encryptedStoryboards = await this.db!.getAll('storyboards');
      return encryptedStoryboards.map(storyboard => this.decrypt(storyboard.encryptedData));
    } catch (error) {
      console.error('Failed to get all storyboards:', error);
      return [];
    }
  }

  async deleteStoryboard(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      await this.db!.delete('storyboards', id);
    } catch (error) {
      console.error('Failed to delete storyboard:', error);
      throw new Error('Failed to delete storyboard');
    }
  }

  async getStorageInfo(): Promise<{ used: number; quota: number; percentage: number }> {
    if (!this.db) {
      await this.init();
    }

    try {
      if (typeof window !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;

        return { used, quota, percentage };
      }
      
      return { used: 0, quota: 0, percentage: 0 };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, quota: 0, percentage: 0 };
    }
  }

  // Business Plan Methods
  async saveBusinessPlan(businessPlan: BusinessPlan): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      const encryptedData = this.encrypt(businessPlan);
      const encryptedBusinessPlan = {
        ...businessPlan,
        encryptedData,
        lastModified: new Date()
      };

      await this.db!.put('businessPlans', encryptedBusinessPlan);
    } catch (error) {
      console.error('Failed to save business plan:', error);
      throw new Error('Failed to save business plan');
    }
  }

  async getBusinessPlan(id: string): Promise<BusinessPlan | null> {
    if (!this.db) {
      await this.init();
    }

    try {
      const stored = await this.db!.get('businessPlans', id);
      if (!stored) return null;

      return this.decrypt(stored.encryptedData);
    } catch (error) {
      console.error('Failed to get business plan:', error);
      return null;
    }
  }

  async getAllBusinessPlans(): Promise<BusinessPlan[]> {
    if (!this.db) {
      await this.init();
    }

    try {
      const allStored = await this.db!.getAll('businessPlans');
      return allStored.map(stored => this.decrypt(stored.encryptedData));
    } catch (error) {
      console.error('Failed to get all business plans:', error);
      return [];
    }
  }

  async deleteBusinessPlan(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      await this.db!.delete('businessPlans', id);
    } catch (error) {
      console.error('Failed to delete business plan:', error);
      throw new Error('Failed to delete business plan');
    }
  }

  async getBusinessPlansByStatus(status: string): Promise<BusinessPlan[]> {
    if (!this.db) {
      await this.init();
    }

    try {
      const allStored = await this.db!.getAllFromIndex('businessPlans', 'status', status);
      return allStored.map(stored => this.decrypt(stored.encryptedData));
    } catch (error) {
      console.error('Failed to get business plans by status:', error);
      return [];
    }
  }

  async exportData(): Promise<string> {
    try {
      const storyboards = await this.getAllStoryboards();
      const businessPlans = await this.getAllBusinessPlans();
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        storyboards,
        businessPlans,
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data');
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.storyboards && Array.isArray(importData.storyboards)) {
        for (const storyboard of importData.storyboards) {
          await this.saveStoryboard(storyboard);
        }
      }
      
      if (importData.businessPlans && Array.isArray(importData.businessPlans)) {
        for (const businessPlan of importData.businessPlans) {
          await this.saveBusinessPlan(businessPlan);
        }
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Failed to import data');
    }
  }
}

export const offlineStorage = new OfflineStorageService();
