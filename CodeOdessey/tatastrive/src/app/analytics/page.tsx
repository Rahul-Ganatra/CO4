'use client';

import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import RoleGuard from '@/components/RoleGuard';

export default function AnalyticsPage() {
  return (
    <RoleGuard allowedRoles={['stakeholders']}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
            <p className="text-gray-600 mt-2">
              Track platform performance, user engagement, and business plan quality metrics
            </p>
          </div>
          
          <AnalyticsDashboard />
        </div>
      </div>
    </RoleGuard>
  );
}
