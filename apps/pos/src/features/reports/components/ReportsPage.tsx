import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';
import { ReportTab, DateRange } from '../types';
import { ReportCharts } from './ReportCharts';
import { ReportTable } from './ReportTable';

interface ReportsPageProps {
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export function ReportsPage({ isSidebarCollapsed, isMobile, onToggleSidebar }: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const tabs = [
    { id: 'revenue' as const, label: 'Revenue Report', icon: '💰' },
    { id: 'reservation' as const, label: 'Reservation Report', icon: '📅' },
    { id: 'staff' as const, label: 'Staff Report', icon: '👥' }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
  };

  const handleExportReport = () => {
    // Simulate export functionality
    console.log(`Exporting ${activeTab} report for ${dateRange.startDate} to ${dateRange.endDate}`);
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">
              Generate comprehensive reports for your restaurant operations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Controls Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportReport}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          {/* Date Range and Generate Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <ReportCharts activeTab={activeTab} />

        {/* Table Section */}
        <ReportTable activeTab={activeTab} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeTab === 'revenue' ? '2,450' : activeTab === 'reservation' ? '1,984' : '15'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">↗ +12.5%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeTab === 'revenue' ? '$156.80' : activeTab === 'reservation' ? '$125.50' : '168h'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💹</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">↗ +8.2%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-semibold text-gray-900">+15.3%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">↗ +2.1%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}