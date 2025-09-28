'use client';

import { useState, useEffect } from 'react';
import { analyticsService, ReportData } from '@/services/analyticsService';

export function AnalyticsDashboard() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalyticsReport();
  }, [selectedPeriod]);

  const loadAnalyticsReport = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const analyticsReport = await analyticsService.generateReport({
        start: startDate,
        end: endDate
      });
      
      setReport(analyticsReport);
    } catch (error) {
      console.error('Failed to load analytics report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      const data = await analyticsService.exportAnalyticsData(format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      if (typeof window !== 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_report_${selectedPeriod}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportData('json')}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExportData('csv')}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">User Engagement</h3>
          <div className="text-3xl font-bold text-blue-600">{report.kpis.userEngagement}%</div>
          <p className="text-sm text-gray-600 mt-1">Retention Rate</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Plan Completion</h3>
          <div className="text-3xl font-bold text-green-600">{report.kpis.planCompletion}%</div>
          <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Mentor Efficiency</h3>
          <div className="text-3xl font-bold text-purple-600">{report.kpis.mentorEfficiency}%</div>
          <p className="text-sm text-gray-600 mt-1">Efficiency Score</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Platform Health</h3>
          <div className="text-3xl font-bold text-orange-600">{report.kpis.platformHealth}%</div>
          <p className="text-sm text-gray-600 mt-1">Overall Health</p>
        </div>
      </div>

      {/* Charts and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Plans by Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Plans by Status</h3>
          <div className="space-y-3">
            {Object.entries(report.analytics.businessPlans.plansByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / report.analytics.businessPlans.totalPlans) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Plans by Sector */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Plans by Sector</h3>
          <div className="space-y-3">
            {Object.entries(report.analytics.businessPlans.plansBySector).map(([sector, count]) => (
              <div key={sector} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{sector}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / report.analytics.businessPlans.totalPlans) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score Distribution</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(report.analytics.qualityMetrics.qualityDistribution).map(([range, count]) => (
            <div key={range} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <ul className="space-y-2">
            {report.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Export Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{report.analytics.exportMetrics.totalExports}</div>
            <div className="text-sm text-gray-600">Total Exports</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{report.analytics.exportMetrics.averageExportSize} KB</div>
            <div className="text-sm text-gray-600">Average File Size</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {Object.values(report.analytics.exportMetrics.exportsByFormat).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-sm text-gray-600">Exports This Period</div>
          </div>
        </div>
      </div>
    </div>
  );
}
