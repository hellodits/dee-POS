import { ReportData } from '../types';

export const mockReportData: ReportData = {
  revenue: {
    tableData: [
      {
        id: 'REV001',
        topSellingFood: 'Margherita Pizza',
        date: '2024-12-20',
        sellPrice: 25.99,
        profit: 15.99,
        margin: 61.5,
        totalRevenue: 519.80
      },
      {
        id: 'REV002',
        topSellingFood: 'Beef Burger',
        date: '2024-12-19',
        sellPrice: 18.50,
        profit: 11.50,
        margin: 62.2,
        totalRevenue: 370.00
      },
      {
        id: 'REV003',
        topSellingFood: 'Caesar Salad',
        date: '2024-12-18',
        sellPrice: 14.99,
        profit: 9.99,
        margin: 66.6,
        totalRevenue: 299.80
      },
      {
        id: 'REV004',
        topSellingFood: 'Chicken Wings',
        date: '2024-12-17',
        sellPrice: 22.99,
        profit: 14.99,
        margin: 65.2,
        totalRevenue: 459.80
      },
      {
        id: 'REV005',
        topSellingFood: 'Fish & Chips',
        date: '2024-12-16',
        sellPrice: 19.99,
        profit: 12.99,
        margin: 65.0,
        totalRevenue: 399.80
      },
      {
        id: 'REV006',
        topSellingFood: 'Pasta Carbonara',
        date: '2024-12-15',
        sellPrice: 21.50,
        profit: 13.50,
        margin: 62.8,
        totalRevenue: 430.00
      },
      {
        id: 'REV007',
        topSellingFood: 'Grilled Salmon',
        date: '2024-12-14',
        sellPrice: 28.99,
        profit: 18.99,
        margin: 65.5,
        totalRevenue: 579.80
      },
      {
        id: 'REV008',
        topSellingFood: 'Vegetable Stir Fry',
        date: '2024-12-13',
        sellPrice: 16.99,
        profit: 11.99,
        margin: 70.6,
        totalRevenue: 339.80
      }
    ],
    chartData: [
      { month: 'Jan', confirmed: 1200, awaited: 300, cancelled: 150, total: 1650 },
      { month: 'Feb', confirmed: 1350, awaited: 280, cancelled: 120, total: 1750 },
      { month: 'Mar', confirmed: 1500, awaited: 320, cancelled: 180, total: 2000 },
      { month: 'Apr', confirmed: 1400, awaited: 290, cancelled: 160, total: 1850 },
      { month: 'May', confirmed: 1600, awaited: 350, cancelled: 140, total: 2090 },
      { month: 'Jun', confirmed: 1750, awaited: 380, cancelled: 170, total: 2300 },
      { month: 'Jul', confirmed: 1900, awaited: 400, cancelled: 200, total: 2500 },
      { month: 'Aug', confirmed: 1800, awaited: 370, cancelled: 180, total: 2350 },
      { month: 'Sep', confirmed: 1650, awaited: 340, cancelled: 160, total: 2150 },
      { month: 'Oct', confirmed: 1700, awaited: 360, cancelled: 190, total: 2250 },
      { month: 'Nov', confirmed: 1550, awaited: 330, cancelled: 170, total: 2050 },
      { month: 'Dec', confirmed: 1450, awaited: 310, cancelled: 140, total: 1900 }
    ],
    summary: [
      { name: 'Confirmed', value: 19850, color: '#10B981' },
      { name: 'Awaited', value: 4030, color: '#F59E0B' },
      { name: 'Cancelled', value: 1960, color: '#EF4444' }
    ],
    totalValue: '$25,840'
  },
  
  reservation: {
    tableData: [
      {
        id: 'RES001',
        customerName: 'John Smith',
        phone: '+1 (555) 123-4567',
        date: '2024-12-20',
        checkIn: '19:00',
        checkOut: '21:30',
        totalBill: 125.50
      },
      {
        id: 'RES002',
        customerName: 'Sarah Johnson',
        phone: '+1 (555) 234-5678',
        date: '2024-12-19',
        checkIn: '18:30',
        checkOut: '20:45',
        totalBill: 89.75
      },
      {
        id: 'RES003',
        customerName: 'Mike Wilson',
        phone: '+1 (555) 345-6789',
        date: '2024-12-18',
        checkIn: '20:00',
        checkOut: '22:15',
        totalBill: 156.25
      },
      {
        id: 'RES004',
        customerName: 'Emily Davis',
        phone: '+1 (555) 456-7890',
        date: '2024-12-17',
        checkIn: '19:15',
        checkOut: '21:00',
        totalBill: 98.50
      },
      {
        id: 'RES005',
        customerName: 'David Brown',
        phone: '+1 (555) 567-8901',
        date: '2024-12-16',
        checkIn: '18:00',
        checkOut: '20:30',
        totalBill: 142.75
      },
      {
        id: 'RES006',
        customerName: 'Lisa Anderson',
        phone: '+1 (555) 678-9012',
        date: '2024-12-15',
        checkIn: '19:45',
        checkOut: '22:00',
        totalBill: 178.25
      },
      {
        id: 'RES007',
        customerName: 'Robert Taylor',
        phone: '+1 (555) 789-0123',
        date: '2024-12-14',
        checkIn: '18:15',
        checkOut: '20:45',
        totalBill: 112.50
      },
      {
        id: 'RES008',
        customerName: 'Jennifer White',
        phone: '+1 (555) 890-1234',
        date: '2024-12-13',
        checkIn: '20:30',
        checkOut: '22:45',
        totalBill: 165.75
      }
    ],
    chartData: [
      { month: 'Jan', confirmed: 85, awaited: 25, cancelled: 12, total: 122 },
      { month: 'Feb', confirmed: 92, awaited: 28, cancelled: 15, total: 135 },
      { month: 'Mar', confirmed: 108, awaited: 32, cancelled: 18, total: 158 },
      { month: 'Apr', confirmed: 95, awaited: 30, cancelled: 14, total: 139 },
      { month: 'May', confirmed: 115, awaited: 35, cancelled: 20, total: 170 },
      { month: 'Jun', confirmed: 128, awaited: 38, cancelled: 22, total: 188 },
      { month: 'Jul', confirmed: 142, awaited: 42, cancelled: 25, total: 209 },
      { month: 'Aug', confirmed: 135, awaited: 40, cancelled: 23, total: 198 },
      { month: 'Sep', confirmed: 118, awaited: 36, cancelled: 19, total: 173 },
      { month: 'Oct', confirmed: 125, awaited: 37, cancelled: 21, total: 183 },
      { month: 'Nov', confirmed: 110, awaited: 33, cancelled: 17, total: 160 },
      { month: 'Dec', confirmed: 102, awaited: 31, cancelled: 16, total: 149 }
    ],
    summary: [
      { name: 'Confirmed', value: 1355, color: '#10B981' },
      { name: 'Awaited', value: 407, color: '#F59E0B' },
      { name: 'Cancelled', value: 222, color: '#EF4444' }
    ],
    totalValue: '1,984'
  },
  
  staff: {
    tableData: [
      {
        id: 'STF001',
        name: 'Alice Johnson',
        role: 'Manager',
        totalOrdersHandled: 245,
        totalHoursWorked: 168,
        totalSalesGenerated: 12450.75,
        status: 'Active'
      },
      {
        id: 'STF002',
        name: 'Bob Smith',
        role: 'Chef',
        totalOrdersHandled: 189,
        totalHoursWorked: 160,
        totalSalesGenerated: 9875.50,
        status: 'Active'
      },
      {
        id: 'STF003',
        name: 'Carol Davis',
        role: 'Waitress',
        totalOrdersHandled: 312,
        totalHoursWorked: 152,
        totalSalesGenerated: 8965.25,
        status: 'Active'
      },
      {
        id: 'STF004',
        name: 'David Wilson',
        role: 'Cashier',
        totalOrdersHandled: 428,
        totalHoursWorked: 144,
        totalSalesGenerated: 15678.90,
        status: 'Active'
      },
      {
        id: 'STF005',
        name: 'Emma Brown',
        role: 'Waitress',
        totalOrdersHandled: 298,
        totalHoursWorked: 136,
        totalSalesGenerated: 7845.60,
        status: 'Leave'
      },
      {
        id: 'STF006',
        name: 'Frank Miller',
        role: 'Chef',
        totalOrdersHandled: 156,
        totalHoursWorked: 128,
        totalSalesGenerated: 6789.45,
        status: 'Active'
      },
      {
        id: 'STF007',
        name: 'Grace Taylor',
        role: 'Manager',
        totalOrdersHandled: 198,
        totalHoursWorked: 120,
        totalSalesGenerated: 9234.80,
        status: 'Leave'
      },
      {
        id: 'STF008',
        name: 'Henry Anderson',
        role: 'Cashier',
        totalOrdersHandled: 365,
        totalHoursWorked: 148,
        totalSalesGenerated: 13567.25,
        status: 'Active'
      }
    ],
    chartData: [
      { month: 'Jan', active: 12, leave: 3, totalHours: 1920, totalSales: 45000 },
      { month: 'Feb', active: 13, leave: 2, totalHours: 2080, totalSales: 48500 },
      { month: 'Mar', active: 14, leave: 1, totalHours: 2240, totalSales: 52000 },
      { month: 'Apr', active: 13, leave: 2, totalHours: 2080, totalSales: 49500 },
      { month: 'May', active: 15, leave: 0, totalHours: 2400, totalSales: 55000 },
      { month: 'Jun', active: 14, leave: 1, totalHours: 2240, totalSales: 53500 },
      { month: 'Jul', active: 16, leave: 1, totalHours: 2560, totalSales: 58000 },
      { month: 'Aug', active: 15, leave: 2, totalHours: 2400, totalSales: 56000 },
      { month: 'Sep', active: 14, leave: 1, totalHours: 2240, totalSales: 51500 },
      { month: 'Oct', active: 13, leave: 2, totalHours: 2080, totalSales: 48000 },
      { month: 'Nov', active: 12, leave: 3, totalHours: 1920, totalSales: 46500 },
      { month: 'Dec', active: 11, leave: 4, totalHours: 1760, totalSales: 44000 }
    ],
    summary: [
      { name: 'Active Staff', value: 162, color: '#10B981' },
      { name: 'On Leave', value: 22, color: '#F59E0B' },
      { name: 'Total Hours', value: 26240, color: '#8B5CF6' },
      { name: 'Total Sales', value: 607500, color: '#3B82F6' }
    ],
    totalValue: '15 Staff'
  }
};

export const getReportData = (tab: 'revenue' | 'reservation' | 'staff') => {
  return mockReportData[tab];
};