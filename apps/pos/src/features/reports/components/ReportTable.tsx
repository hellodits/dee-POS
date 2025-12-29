import { ReportTab } from '../types';
import { getReportData } from '../data/reportData';

interface ReportTableProps {
  activeTab: ReportTab;
}

export function ReportTable({ activeTab }: ReportTableProps) {
  const reportData = getReportData(activeTab);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-medium rounded-full";
    
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Leave':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const renderRevenueTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">No</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Top Selling Food</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Sell Price</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Profit</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Margin (%)</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {reportData.tableData.map((item: any, index) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-900">{index + 1}</td>
              <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.topSellingFood}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(item.sellPrice)}</td>
              <td className="py-3 px-4 text-sm text-green-600 font-medium">{formatCurrency(item.profit)}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{formatPercentage(item.margin)}</td>
              <td className="py-3 px-4 text-sm text-gray-900 font-semibold">{formatCurrency(item.totalRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReservationTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Res. ID</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Customer Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Phone</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Check In</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Check Out</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Total Bill</th>
          </tr>
        </thead>
        <tbody>
          {reportData.tableData.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.id}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{item.customerName}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{item.phone}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{item.checkIn}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{item.checkOut}</td>
              <td className="py-3 px-4 text-sm text-gray-900 font-semibold">{formatCurrency(item.totalBill)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStaffTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Staff ID</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Total Orders</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Total Hours</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Total Sales</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody>
          {reportData.tableData.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.id}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{item.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{item.role}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{item.totalOrdersHandled.toLocaleString()}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{item.totalHoursWorked}h</td>
              <td className="py-3 px-4 text-sm text-gray-900 font-semibold">{formatCurrency(item.totalSalesGenerated)}</td>
              <td className="py-3 px-4">
                <span className={getStatusBadge(item.status)}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTable = () => {
    switch (activeTab) {
      case 'revenue':
        return renderRevenueTable();
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
        return 'Revenue Details';
      case 'reservation':
        return 'Reservation Details';
      case 'staff':
        return 'Staff Performance';
      default:
        return 'Report Details';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{getTableTitle()}</h3>
        <div className="text-sm text-gray-500">
          Showing {reportData.tableData.length} entries
        </div>
      </div>
      
      {renderTable()}
      
      {/* Pagination placeholder */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Showing 1 to {reportData.tableData.length} of {reportData.tableData.length} entries
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            Previous
          </button>
          <button className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
            1
          </button>
          <button className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}