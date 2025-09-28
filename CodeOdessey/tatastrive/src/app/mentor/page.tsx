'use client';

import { useState, useEffect } from 'react';
import { MentorDashboard } from '@/components/MentorDashboard';
import RoleGuard from '@/components/RoleGuard';

export default function MentorPage() {
  return (
    <RoleGuard allowedRoles={['mentors']}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Review and prioritize entrepreneur business plan submissions
            </p>
          </div>
          
          <MentorDashboard />
        </div>
      </div>
    </RoleGuard>
  );
}
