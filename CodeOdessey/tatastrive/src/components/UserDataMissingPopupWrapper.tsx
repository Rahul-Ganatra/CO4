'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserDataMissingPopup from './UserDataMissingPopup';

export default function UserDataMissingPopupWrapper() {
  const { 
    showUserDataMissingPopup, 
    completeUserProfile, 
    closeUserDataMissingPopup 
  } = useAuth();

  return (
    <UserDataMissingPopup
      isOpen={showUserDataMissingPopup}
      onClose={closeUserDataMissingPopup}
      onCompleteProfile={completeUserProfile}
    />
  );
}
