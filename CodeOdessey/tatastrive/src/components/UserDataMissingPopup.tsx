'use client';

import React from 'react';
import { UserRole } from '@/types/auth';

interface UserDataMissingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteProfile: (role: UserRole) => void;
}

export default function UserDataMissingPopup({ 
  isOpen, 
  onClose, 
  onCompleteProfile 
}: UserDataMissingPopupProps) {
  if (!isOpen) return null;

  const roles: { value: UserRole; label: string; description: string }[] = [
    { 
      value: 'entrepreneurs', 
      label: 'Entrepreneurs', 
      description: 'Create and develop business ideas, access storyboard and planning tools' 
    },
    { 
      value: 'mentors', 
      label: 'Mentors', 
      description: 'Guide entrepreneurs, access mentor dashboard and provide feedback' 
    },
    { 
      value: 'stakeholders', 
      label: 'Stakeholders', 
      description: 'Invest in and support business ventures, access stakeholder dashboard' 
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">
            We need some additional information to set up your account properly.
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => onCompleteProfile(role.value)}
              className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">{role.label}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
