'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {user.name}
        </p>
        <p className="text-xs text-gray-500">
          {user.email}
        </p>
      </div>
      
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-gray-800 text-sm"
        title="Sign out"
      >
        Sign Out
      </button>
    </div>
  );
}
