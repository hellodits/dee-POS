export type ReportTab = 'revenue' | 'reservation' | 'staff';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Revenue Report Types
export interface RevenueData {
  id: string;
  topSellingFood: string;
  date: string;
  sellPrice: number;
  profit: number;
  margin: number;
  totalRevenue: number;
}

export interface RevenueChartData {
  month: string;
  confirmed: number;
  awaited: number;
  cancelled: number;
  total: number;
}

export interface RevenueSummary {
  name: string;
  value: number;
  color: string;
}

// Reservation Report Types
export interface ReservationData {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalBill: number;
}

export interface ReservationChartData {
  month: string;
  confirmed: number;
  awaited: number;
  cancelled: number;
  total: number;
}

export interface ReservationSummary {
  name: string;
  value: number;
  color: string;
}

// Staff Report Types
export interface StaffData {
  id: string;
  name: string;
  role: string;
  totalOrdersHandled: number;
  totalHoursWorked: number;
  totalSalesGenerated: number;
  status: 'Active' | 'Leave';
}

export interface StaffChartData {
  month: string;
  active: number;
  leave: number;
  totalHours: number;
  totalSales: number;
}

export interface StaffSummary {
  name: string;
  value: number;
  color: string;
}

// Combined Report Data
export interface ReportData {
  revenue: {
    tableData: RevenueData[];
    chartData: RevenueChartData[];
    summary: RevenueSummary[];
    totalValue: string;
  };
  reservation: {
    tableData: ReservationData[];
    chartData: ReservationChartData[];
    summary: ReservationSummary[];
    totalValue: string;
  };
  staff: {
    tableData: StaffData[];
    chartData: StaffChartData[];
    summary: StaffSummary[];
    totalValue: string;
  };
}

export interface ChartFilter {
  confirmed: boolean;
  awaited: boolean;
  cancelled: boolean;
  active?: boolean;
  leave?: boolean;
}