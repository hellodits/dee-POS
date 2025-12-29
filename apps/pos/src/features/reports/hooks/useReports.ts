import { useState } from 'react';
import { ReportTab, DateRange } from '../types';
import { getReportData } from '../data/reportData';

export function useReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });
  const [isLoading, setIsLoading] = useState(false);

  const generateReport = async (tab: ReportTab, range: DateRange) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would fetch data from API
      const data = getReportData(tab);
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to generate report' };
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (tab: ReportTab, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    try {
      // Simulate export functionality
      console.log(`Exporting ${tab} report as ${format}`);
      
      // In a real app, this would trigger download
      return { success: true, message: `Report exported as ${format.toUpperCase()}` };
    } catch (error) {
      return { success: false, error: 'Failed to export report' };
    }
  };

  const getReportSummary = (tab: ReportTab) => {
    const data = getReportData(tab);
    
    switch (tab) {
      case 'revenue':
        return {
          totalRecords: data.tableData.length,
          totalValue: data.totalValue,
          averageValue: '$156.80',
          growthRate: '+15.3%'
        };
      case 'reservation':
        return {
          totalRecords: data.tableData.length,
          totalValue: data.totalValue,
          averageValue: '$125.50',
          growthRate: '+12.8%'
        };
      case 'staff':
        return {
          totalRecords: data.tableData.length,
          totalValue: data.totalValue,
          averageValue: '168h',
          growthRate: '+8.5%'
        };
      default:
        return {
          totalRecords: 0,
          totalValue: '0',
          averageValue: '0',
          growthRate: '0%'
        };
    }
  };

  return {
    // State
    activeTab,
    dateRange,
    isLoading,
    
    // Actions
    setActiveTab,
    setDateRange,
    generateReport,
    exportReport,
    getReportSummary,
    
    // Data
    getCurrentReportData: () => getReportData(activeTab),
  };
}