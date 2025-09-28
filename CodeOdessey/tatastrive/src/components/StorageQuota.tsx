'use client';

import { useState, useEffect } from 'react';
import { offlineStorage } from '@/services/offlineStorage';

export default function StorageQuota() {
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    quota: number;
    percentage: number;
  }>({ used: 0, quota: 0, percentage: 0 });

  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        const info = await offlineStorage.getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('Failed to load storage info:', error);
      }
    };

    loadStorageInfo();
    
    // Update storage info every 30 seconds
    const interval = setInterval(loadStorageInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getQuotaColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQuotaBarColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (storageInfo.quota === 0) {
    return (
      <div className="text-sm text-gray-500">
        Storage info unavailable
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-600">Storage Used</span>
        <span className={getQuotaColor(storageInfo.percentage)}>
          {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getQuotaBarColor(storageInfo.percentage)}`}
          style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-500 mt-1">
        {storageInfo.percentage.toFixed(1)}% used
      </div>
    </div>
  );
}
