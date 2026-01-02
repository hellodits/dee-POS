import { useEffect, useState } from 'react';
import { Menu, Calendar, Download, RefreshCw } from 'lucide-react';
import { ReportTab } from '../types';
import { ReportCharts } from './ReportCharts';
import { ReportTable } from './ReportTable';
import { useReports } from '../hooks/useReports';

interface ReportsPageProps {
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export function ReportsPage({ isSidebarCollapsed, isMobile, onToggleSidebar }: ReportsPageProps) {
  const {
    activeTab,
    dateRange,
    isLoading,
    error,
    reportData,
    setActiveTab,
    setDateRange,
    generateReport,
    exportReport,
    getReportSummary,
    updateOrderFilters,
  } = useReports();

  const [exportLoading, setExportLoading] = useState(false);

  const tabs = [
    { id: 'revenue' as const, label: 'Revenue Report', icon: '💰' },
    { id: 'orders' as const, label: 'Orders Report', icon: '📋' },
    { id: 'reservation' as const, label: 'Reservation Report', icon: '📅' },
    { id: 'staff' as const, label: 'Staff Report', icon: '👥' }
  ];

  // Load report on mount and when tab/date changes
  useEffect(() => {
    generateReport(activeTab, dateRange);
  }, [activeTab, generateReport]);

  const handleGenerateReport = () => {
    generateReport(activeTab, dateRange);
  };

  const handleExportReport = async () => {
    setExportLoading(true);
    try {
      const result = await exportReport(activeTab, 'excel');
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.error || 'Gagal export report');
      }
    } catch (error) {
      alert('Gagal export report');
    } finally {
      setExportLoading(false);
    }
  };

  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
  };

  const summary = getReportSummary(activeTab);

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate comprehensive reports for your restaurant operations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
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
              disabled={exportLoading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exportLoading ? 'Exporting...' : 'Export Excel'}</span>
            </button>
          </div>

          {/* Date Range and Generate Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Loading...' : 'Generate Report'}</span>
              </button>
            </div>
          </div>

          {/* Orders Filters */}
          {activeTab === 'orders' && (
            <div className="flex flex-wrap gap-3 mt-4">
              <select
                value={reportData.orders.filters.status}
                onChange={(e) => updateOrderFilters({ status: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COOKING">Cooking</option>
                <option value="READY">Ready</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              
              <select
                value={reportData.orders.filters.payment_status}
                onChange={(e) => updateOrderFilters({ payment_status: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Semua Pembayaran</option>
                <option value="UNPAID">Belum Bayar</option>
                <option value="PAID">Sudah Bayar</option>
                <option value="REFUNDED">Refund</option>
              </select>
              
              <select
                value={reportData.orders.filters.order_source}
                onChange={(e) => updateOrderFilters({ order_source: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Semua Sumber</option>
                <option value="POS">Kasir</option>
                <option value="WEB">Online</option>
              </select>
              
              <button
                onClick={() => generateReport(activeTab, dateRange)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Apply Filter
              </button>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <ReportCharts 
          activeTab={activeTab} 
          reportData={reportData}
          isLoading={isLoading}
        />

        {/* Table Section */}
        <ReportTable 
          activeTab={activeTab} 
          reportData={reportData}
          isLoading={isLoading}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTab === 'revenue' ? 'Total Orders' : 
                   activeTab === 'orders' ? 'Total Orders' :
                   activeTab === 'reservation' ? 'Total Reservations' : 'Total Staff'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {summary.totalRecords.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTab === 'revenue' ? 'Total Revenue' : 
                   activeTab === 'orders' ? 'Total Revenue' :
                   activeTab === 'reservation' ? 'Total Guests' : 'Total Hours'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {activeTab === 'revenue' ? summary.totalValue : 
                   activeTab === 'orders' ? summary.totalValue :
                   activeTab === 'reservation' ? summary.totalValue :
                   (summary as { totalHours?: string }).totalHours || '0h'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💹</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeTab === 'revenue' ? 'Avg Order Value' : 
                   activeTab === 'orders' ? 'Avg Order Value' :
                   activeTab === 'reservation' ? 'Confirmed' : 'Total Sales'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {activeTab === 'revenue' ? (summary as { averageValue?: string }).averageValue || '$0' : 
                   activeTab === 'orders' ? (summary as { averageValue?: string }).averageValue || 'Rp0' :
                   activeTab === 'reservation' ? (summary as { confirmed?: number }).confirmed || 0 :
                   (summary as { totalSales?: string }).totalSales || '$0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
