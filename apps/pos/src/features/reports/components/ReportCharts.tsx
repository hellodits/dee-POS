import { useState } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ReportTab, ChartFilter, RevenueChartData, ReservationChartData, StaffReportData, SalesReportData, ReservationReportData } from '../types';

interface ReportState {
  revenue: {
    sales: SalesReportData | null;
    topProducts: { product_id: string; name: string; qty_sold: number; revenue: number; profit: number }[];
    dailyTrend: { date: string; total: number; orders: number }[];
    chartData: RevenueChartData[];
  };
  reservation: {
    data: ReservationReportData | null;
    chartData: ReservationChartData[];
  };
  staff: {
    data: StaffReportData | null;
  };
}

interface ReportChartsProps {
  activeTab: ReportTab;
  reportData: ReportState;
  isLoading: boolean;
}

export function ReportCharts({ activeTab, reportData, isLoading }: ReportChartsProps) {
  const [chartFilter, setChartFilter] = useState<ChartFilter>({
    confirmed: true,
    pending: true,
    cancelled: true,
  });

  const getFilterButtons = () => {
    if (activeTab === 'reservation') {
      return [
        { key: 'confirmed', label: 'Confirmed', color: '#10B981' },
        { key: 'pending', label: 'Pending', color: '#F59E0B' },
        { key: 'cancelled', label: 'Cancelled', color: '#EF4444' },
      ];
    }
    return [];
  };

  const toggleFilter = (key: string) => {
    setChartFilter(prev => ({
      ...prev,
      [key]: !prev[key as keyof ChartFilter]
    }));
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{`${label}`}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Revenue Chart Data
  const getRevenueChartData = () => {
    if (activeTab === 'revenue') {
      return reportData.revenue.chartData.map(item => ({
        month: item.month,
        total: item.total,
        orders: item.orders,
      }));
    }
    return [];
  };

  // Reservation Chart Data
  const getReservationChartData = () => {
    if (activeTab === 'reservation') {
      return reportData.reservation.chartData.map(item => {
        const filteredItem: { month: string; confirmed?: number; pending?: number; cancelled?: number } = { month: item.month };
        if (chartFilter.confirmed) filteredItem.confirmed = item.confirmed;
        if (chartFilter.pending) filteredItem.pending = item.pending;
        if (chartFilter.cancelled) filteredItem.cancelled = item.cancelled;
        return filteredItem;
      });
    }
    return [];
  };

  // Staff Chart Data (Bar chart for performance)
  const getStaffChartData = () => {
    if (activeTab === 'staff' && reportData.staff.data) {
      return reportData.staff.data.staff.slice(0, 10).map(s => ({
        name: s.username,
        sales: s.performance.total_sales,
        orders: s.performance.total_orders,
        hours: s.attendance.total_hours,
      }));
    }
    return [];
  };

  // Summary data for pie chart
  const getSummaryData = () => {
    switch (activeTab) {
      case 'revenue':
        if (reportData.revenue.sales?.by_payment_method) {
          return reportData.revenue.sales.by_payment_method.map((item, idx) => ({
            name: item.method || 'Unknown',
            value: item.total,
            color: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'][idx % 4],
          }));
        }
        return [];
      case 'reservation':
        if (reportData.reservation.data?.summary) {
          const s = reportData.reservation.data.summary;
          return [
            { name: 'Confirmed', value: s.confirmed, color: '#10B981' },
            { name: 'Pending', value: s.pending, color: '#F59E0B' },
            { name: 'Cancelled', value: s.cancelled, color: '#EF4444' },
          ];
        }
        return [];
      case 'staff':
        if (reportData.staff.data?.summary) {
          const s = reportData.staff.data.summary;
          return [
            { name: 'Total Staff', value: s.total_staff, color: '#3B82F6' },
            { name: 'Total Orders', value: s.total_orders, color: '#10B981' },
          ];
        }
        return [];
      default:
        return [];
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

  const getTotalValue = () => {
    switch (activeTab) {
      case 'revenue':
        return formatRupiah(reportData.revenue.sales?.total_sales || 0);
      case 'reservation':
        return `${reportData.reservation.data?.summary.total || 0}`;
      case 'staff':
        return `${reportData.staff.data?.summary.total_staff || 0}`;
      default:
        return '0';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  const summaryData = getSummaryData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Donut Chart */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {activeTab === 'revenue' ? 'By Payment Method' : activeTab === 'reservation' ? 'By Status' : 'Summary'}
          </h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={summaryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : value, '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Value */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalValue()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {summaryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Area/Bar Chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === 'revenue' ? 'Revenue Trend' : activeTab === 'reservation' ? 'Reservation Trend' : 'Staff Performance'}
            </h3>
            
            {/* Filter Buttons */}
            {getFilterButtons().length > 0 && (
              <div className="flex space-x-2">
                {getFilterButtons().map((button) => (
                  <button
                    key={button.key}
                    onClick={() => toggleFilter(button.key)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      chartFilter[button.key as keyof ChartFilter]
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    style={{
                      backgroundColor: chartFilter[button.key as keyof ChartFilter] 
                        ? button.color 
                        : undefined
                    }}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            {activeTab === 'revenue' ? (
              <AreaChart data={getRevenueChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Revenue" />
              </AreaChart>
            ) : activeTab === 'reservation' ? (
              <AreaChart data={getReservationChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                {chartFilter.confirmed && <Area type="monotone" dataKey="confirmed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />}
                {chartFilter.pending && <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />}
                {chartFilter.cancelled && <Area type="monotone" dataKey="cancelled" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />}
              </AreaChart>
            ) : (
              <BarChart data={getStaffChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="#10B981" name="Sales ($)" />
                <Bar dataKey="orders" fill="#3B82F6" name="Orders" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
