import { useState, useCallback } from 'react';
import { reportsApi } from '../../../lib/api';
import * as XLSX from 'xlsx';
import {
  ReportTab,
  DateRange,
  SalesReportData,
  TopProductData,
  DailyTrendData,
  RevenueChartData,
  ReservationReportData,
  ReservationChartData,
  StaffReportData,
  OrderReportData,
  OrderFilters,
} from '../types';

interface ReportState {
  revenue: {
    sales: SalesReportData | null;
    topProducts: TopProductData[];
    dailyTrend: DailyTrendData[];
    chartData: RevenueChartData[];
  };
  orders: {
    data: OrderReportData[];
    filters: OrderFilters;
  };
  reservation: {
    data: ReservationReportData | null;
    chartData: ReservationChartData[];
  };
  staff: {
    data: StaffReportData | null;
  };
}

export function useReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportState>({
    revenue: { sales: null, topProducts: [], dailyTrend: [], chartData: [] },
    orders: { data: [], filters: { status: 'all', payment_status: 'all', order_source: 'all' } },
    reservation: { data: null, chartData: [] },
    staff: { data: null },
  });

  const fetchRevenueReport = useCallback(async (range: DateRange) => {
    const params = { date_from: range.startDate, date_to: range.endDate };
    
    const [salesRes, topProductsRes, dailyTrendRes, chartRes] = await Promise.all([
      reportsApi.getSales(params),
      reportsApi.getTopProducts({ ...params, limit: 10 }),
      reportsApi.getDailyTrend(params),
      reportsApi.getRevenueChart(params),
    ]);

    return {
      sales: salesRes.data.data as SalesReportData,
      topProducts: (topProductsRes.data.data || []) as TopProductData[],
      dailyTrend: (dailyTrendRes.data.data || []) as DailyTrendData[],
      chartData: (chartRes.data.data || []) as RevenueChartData[],
    };
  }, []);

  const fetchOrdersReport = useCallback(async (range: DateRange, filters: OrderFilters) => {
    const params = { 
      date_from: range.startDate, 
      date_to: range.endDate,
      status: filters.status !== 'all' ? filters.status : undefined,
      payment_status: filters.payment_status !== 'all' ? filters.payment_status : undefined,
      order_source: filters.order_source !== 'all' ? filters.order_source : undefined,
    };
    
    const res = await reportsApi.exportOrders(params);
    return {
      data: (res.data.data || []) as OrderReportData[],
      filters,
    };
  }, []);
  const fetchReservationReport = useCallback(async (range: DateRange) => {
    const params = { date_from: range.startDate, date_to: range.endDate };
    
    const [reportRes, chartRes] = await Promise.all([
      reportsApi.getReservations(params),
      reportsApi.getReservationChart(params),
    ]);

    return {
      data: reportRes.data.data as ReservationReportData,
      chartData: (chartRes.data.data || []) as ReservationChartData[],
    };
  }, []);

  const fetchStaffReport = useCallback(async (range: DateRange) => {
    const params = { date_from: range.startDate, date_to: range.endDate };
    const res = await reportsApi.getStaff(params);
    return { data: res.data.data as StaffReportData };
  }, []);

  const generateReport = useCallback(async (tab: ReportTab, range: DateRange) => {
    setIsLoading(true);
    setError(null);

    try {
      switch (tab) {
        case 'revenue': {
          const data = await fetchRevenueReport(range);
          setReportData(prev => ({ ...prev, revenue: data }));
          break;
        }
        case 'orders': {
          const data = await fetchOrdersReport(range, reportData.orders.filters);
          setReportData(prev => ({ ...prev, orders: data }));
          break;
        }
        case 'reservation': {
          const data = await fetchReservationReport(range);
          setReportData(prev => ({ ...prev, reservation: data }));
          break;
        }
        case 'staff': {
          const data = await fetchStaffReport(range);
          setReportData(prev => ({ ...prev, staff: data }));
          break;
        }
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [fetchRevenueReport, fetchOrdersReport, fetchReservationReport, fetchStaffReport, reportData.orders.filters]);

  const exportReport = async (tab: ReportTab, format: 'pdf' | 'excel' | 'csv' = 'excel') => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (tab) {
        case 'orders':
          data = reportData.orders.data;
          filename = `Orders_Report_${dateRange.startDate}_to_${dateRange.endDate}`;
          break;
        case 'revenue':
          // Export top products for revenue
          data = reportData.revenue.topProducts.map(product => ({
            'Produk': product.name,
            'Qty Terjual': product.qty_sold,
            'Revenue': formatRupiah(product.revenue),
            'Profit': formatRupiah(product.profit),
          }));
          filename = `Revenue_Report_${dateRange.startDate}_to_${dateRange.endDate}`;
          break;
        case 'reservation':
          // Export recent reservations
          data = reportData.reservation.data?.recent_reservations.map(res => ({
            'Nama Tamu': res.guest_name,
            'WhatsApp': res.whatsapp,
            'Tanggal': res.date,
            'Waktu': res.time,
            'Jumlah Tamu': res.pax,
            'Status': res.status,
            'Dibuat': new Date(res.createdAt).toLocaleString('id-ID'),
          })) || [];
          filename = `Reservation_Report_${dateRange.startDate}_to_${dateRange.endDate}`;
          break;
        case 'staff':
          // Export staff performance
          data = reportData.staff.data?.staff.map(staff => ({
            'Username': staff.username,
            'Role': staff.role,
            'Total Hari': staff.attendance.total_days,
            'Hari Hadir': staff.attendance.present_days,
            'Hari Terlambat': staff.attendance.late_days,
            'Hari Tidak Hadir': staff.attendance.absent_days,
            'Total Jam': staff.attendance.total_hours.toFixed(1),
            'Total Order': staff.performance.total_orders,
            'Total Penjualan': formatRupiah(staff.performance.total_sales),
            'Rata-rata Transaksi': formatRupiah(staff.performance.avg_transaction),
          })) || [];
          filename = `Staff_Report_${dateRange.startDate}_to_${dateRange.endDate}`;
          break;
      }

      if (data.length === 0) {
        return { success: false, error: 'Tidak ada data untuk di-export' };
      }

      // Create Excel file
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      
      // Auto-size columns
      const colWidths = Object.keys(data[0]).map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;
      
      // Export file
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      return { success: true, message: `Report berhasil di-export sebagai ${filename}.xlsx` };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: 'Gagal export report' };
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getReportSummary = (tab: ReportTab) => {
    switch (tab) {
      case 'revenue':
        return {
          totalRecords: reportData.revenue.sales?.total_orders || 0,
          totalValue: formatRupiah(reportData.revenue.sales?.total_sales || 0),
          averageValue: formatRupiah(reportData.revenue.sales?.average_order_value || 0),
        };
      case 'orders':
        return {
          totalRecords: reportData.orders.data.length,
          totalValue: formatRupiah(reportData.orders.data.reduce((sum, order) => sum + order.Total, 0)),
          averageValue: reportData.orders.data.length > 0 ? formatRupiah(reportData.orders.data.reduce((sum, order) => sum + order.Total, 0) / reportData.orders.data.length) : formatRupiah(0),
        };
      case 'reservation':
        return {
          totalRecords: reportData.reservation.data?.summary.total || 0,
          totalValue: `${reportData.reservation.data?.summary.total_pax || 0} guests`,
          confirmed: reportData.reservation.data?.summary.confirmed || 0,
          pending: reportData.reservation.data?.summary.pending || 0,
          cancelled: reportData.reservation.data?.summary.cancelled || 0,
        };
      case 'staff':
        return {
          totalRecords: reportData.staff.data?.summary.total_staff || 0,
          totalHours: `${(reportData.staff.data?.summary.total_hours_worked || 0).toFixed(1)}h`,
          totalSales: formatRupiah(reportData.staff.data?.summary.total_sales || 0),
          totalOrders: reportData.staff.data?.summary.total_orders || 0,
        };
      default:
        return { totalRecords: 0, totalValue: '0' };
    }
  };

  const updateOrderFilters = useCallback((filters: Partial<OrderFilters>) => {
    setReportData(prev => ({
      ...prev,
      orders: {
        ...prev.orders,
        filters: { ...prev.orders.filters, ...filters }
      }
    }));
  }, []);

  return {
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
  };
}
