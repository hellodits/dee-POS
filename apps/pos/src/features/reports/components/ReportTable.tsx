import { ReportTab, SalesReportData, ReservationReportData, StaffReportData, TopProductData, OrderReportData } from '../types';

interface ReportState {
  revenue: {
    sales: SalesReportData | null;
    topProducts: TopProductData[];
    dailyTrend: { date: string; total: number; orders: number }[];
    chartData: { month: string; total: number; orders: number }[];
  };
  orders: {
    data: OrderReportData[];
  };
  reservation: {
    data: ReservationReportData | null;
    chartData: { month: string; confirmed: number; pending: number; cancelled: number; total: number }[];
  };
  staff: {
    data: StaffReportData | null;
  };
}

interface ReportTableProps {
  activeTab: ReportTab;
  reportData: ReportState;
  isLoading: boolean;
}

export function ReportTable({ activeTab, reportData, isLoading }: ReportTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-medium rounded-full";
    
    switch (status.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400`;
      case 'CANCELLED':
      case 'REJECTED':
        return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-medium rounded-full";
    
    switch (role.toLowerCase()) {
      case 'admin':
        return `${baseClasses} bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400`;
      case 'manager':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400`;
      case 'cashier':
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400`;
      case 'kitchen':
        return `${baseClasses} bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  const renderOrdersTable = () => {
    const orders = reportData.orders.data || [];
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">No. Order</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tanggal</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sumber</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Meja</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Tamu</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Pembayaran</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No orders found for the selected period
                </td>
              </tr>
            ) : (
              orders.slice(0, 50).map((order, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{order['No. Order']}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{order['Tanggal']} {order['Waktu']}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{order['Sumber']}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{order['Meja']}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{order['Tamu']}</td>
                  <td className="py-3 px-4">
                    <span className={getStatusBadge(order['Status Order'])}>
                      {order['Status Order']}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={getStatusBadge(order['Status Pembayaran'])}>
                      {order['Status Pembayaran']}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(order['Total'])}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {orders.length > 50 && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing first 50 orders. Export to Excel to see all {orders.length} orders.
          </div>
        )}
      </div>
    );
  };
  const renderRevenueTable = () => {
    const topProducts = reportData.revenue.topProducts || [];
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">No</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Product Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Qty Sold</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Revenue</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Profit</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No data available for the selected period
                </td>
              </tr>
            ) : (
              topProducts.map((item, index) => (
                <tr key={item.product_id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{item.qty_sold.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{formatCurrency(item.revenue)}</td>
                  <td className="py-3 px-4 text-sm text-green-600 dark:text-green-400 font-medium">{formatCurrency(item.profit)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderReservationTable = () => {
    const reservations = reportData.reservation.data?.recent_reservations || [];
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Guest Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">WhatsApp</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Guests</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No reservations found for the selected period
                </td>
              </tr>
            ) : (
              reservations.map((item) => (
                <tr key={item._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{item.guest_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{item.whatsapp}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(item.date)}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{item.time}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{item.pax}</td>
                  <td className="py-3 px-4">
                    <span className={getStatusBadge(item.status)}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStaffTable = () => {
    const staffList = reportData.staff.data?.staff || [];
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Present Days</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total Hours</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Orders</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No staff data available for the selected period
                </td>
              </tr>
            ) : (
              staffList.map((item) => (
                <tr key={item.staff_id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{item.username}</td>
                  <td className="py-3 px-4">
                    <span className={getRoleBadge(item.role)}>
                      {item.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.attendance.present_days} / {item.attendance.total_days}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{item.attendance.total_hours.toFixed(1)}h</td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{item.performance.total_orders.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(item.performance.total_sales)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'revenue':
        return renderRevenueTable();
      case 'orders':
        return renderOrdersTable();
      case 'reservation':
        return renderReservationTable();
      case 'staff':
        return renderStaffTable();
      default:
        return null;
    }
  };

  const getTableTitle = () => {
    switch (activeTab) {
      case 'revenue':
        return 'Top Selling Products';
      case 'orders':
        return 'Orders Report';
      case 'reservation':
        return 'Recent Reservations';
      case 'staff':
        return 'Staff Performance';
      default:
        return 'Report Details';
    }
  };

  const getEntryCount = () => {
    switch (activeTab) {
      case 'revenue':
        return reportData.revenue.topProducts?.length || 0;
      case 'orders':
        return reportData.orders.data?.length || 0;
      case 'reservation':
        return reportData.reservation.data?.recent_reservations?.length || 0;
      case 'staff':
        return reportData.staff.data?.staff?.length || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getTableTitle()}</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {getEntryCount()} entries
        </div>
      </div>
      
      {renderTable()}
    </div>
  );
}
