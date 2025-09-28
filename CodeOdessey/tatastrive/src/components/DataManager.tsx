'use client';

import { useState } from 'react';
import { offlineStorage } from '@/services/offlineStorage';

export default function DataManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await offlineStorage.exportData();
      
      // Create and download file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      if (typeof window !== 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `tatastrive-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setIsImporting(true);
      const text = await importFile.text();
      await offlineStorage.importData(text);
      alert('Data imported successfully! Please refresh the page to see your imported data.');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    } else {
      alert('Please select a valid JSON file.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Data Management
      </h3>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
          <p className="text-sm text-gray-600 mt-1">
            Download all your business plans as a backup file
          </p>
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="text-sm text-gray-600"
            />
            <button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isImporting ? 'Importing...' : 'Import Data'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Import previously exported business plan data
          </p>
        </div>
      </div>
    </div>
  );
}
