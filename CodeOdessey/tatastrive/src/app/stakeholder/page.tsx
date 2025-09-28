'use client';

import RoleGuard from '@/components/RoleGuard';

export default function StakeholderPage() {
  return (
    <RoleGuard allowedRoles={['stakeholders']}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Stakeholder Dashboard</h1>
            <p className="text-gray-600 mt-2">
              View and analyze business plans, track investment opportunities, and monitor platform metrics
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Investment Opportunities</h3>
              <p className="text-gray-600 mb-4">
                Browse and evaluate business plans from entrepreneurs
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Plans
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Portfolio Overview</h3>
              <p className="text-gray-600 mb-4">
                Track your investments and their performance
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                View Portfolio
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Market Analytics</h3>
              <p className="text-gray-600 mb-4">
                Access market trends and investment insights
              </p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
