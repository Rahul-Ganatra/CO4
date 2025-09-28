'use client';

import Link from 'next/link';
import SyncStatus from './SyncStatus';
import StorageQuota from './StorageQuota';
import UserProfile from './UserProfile';
import LanguageSelector from './LanguageSelector';
import RoleBasedNavigation from './RoleBasedNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function Navigation() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            TataStrive
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <RoleBasedNavigation />
            ) : (
              <div className="flex space-x-6">
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {t('nav.home')}
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {t('nav.about')}
                </Link>
              </div>
            )}
            
            <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
              <LanguageSelector />
              <SyncStatus />
              <StorageQuota />
              
              {user ? (
                <UserProfile />
              ) : (
                <Link
                  href="/auth"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
