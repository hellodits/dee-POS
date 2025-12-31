export type ReportTab = 'revenue' | 'orders' | 'reservation' | 'staff';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// ============ Orders Report Types ============
export interface OrderReportData {
  'No. Order': string;
  'Tanggal': string;
  'Waktu': string;
  'Sumber': string;
  'Meja': string;
  'Kasir': string;
  'Tamu': string;
  'WhatsApp': string;
  'Jumlah Tamu': string | number;
  'Status Order': string;
  'Status Pembayaran': string;
  'Metode Pembayaran': string;
  'Subtotal': number;
  'Diskon': number;
  'Pajak': number;
  'Service Charge': number;
  'Total': number;
  'Catatan': string;
  'Selesai': string;
}

export interface OrderFilters {
  status: string;
  payment_status: string;
  order_source: string;
}

// ============ Revenue Report Types (from API) ============
export interface SalesReportData {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  by_payment_method: {
    method: string;
    total: number;
    count: number;
  }[];
  by_source: {
    source: string;
    total: number;
    count: number;
  }[];
}

export interface TopProductData {
  product_id: string;
  name: string;
  qty_sold: number;
  revenue: number;
  profit: number;
}

export interface DailyTrendData {
  date: string;
  total: number;
  orders: number;
}

export interface RevenueChartData {
  month: string;
  total: number;
  orders: number;
}

// ============ Reservation Report Types (from API) ============
export interface ReservationReportData {
  summary: {
    total: number;
    total_pax: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  by_status: {
    status: string;
    count: number;
    total_pax: number;
  }[];
  daily_breakdown: {
    date: string;
    statuses: { status: string; count: number; total_pax: number }[];
    total: number;
  }[];
  recent_reservations: {
    _id: string;
    guest_name: string;
    whatsapp: string;
    date: string;
    time: string;
    pax: number;
    status: string;
    createdAt: string;
  }[];
}

export interface ReservationChartData {
  month: string;
  confirmed: number;
  pending: number;
  cancelled: number;
  total: number;
}

// ============ Staff Report Types (from API) ============
export interface StaffReportData {
  summary: {
    total_staff: number;
    total_hours_worked: number;
    total_sales: number;
    total_orders: number;
  };
  staff: {
    staff_id: string;
    username: string;
    role: string;
    attendance: {
      total_days: number;
      present_days: number;
      late_days: number;
      absent_days: number;
      total_hours: number;
    };
    performance: {
      total_orders: number;
      total_sales: number;
      total_transactions: number;
      avg_transaction: number;
    };
  }[];
}

// ============ Combined Report State ============
export interface ReportState {
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
  isLoading: boolean;
  error: string | null;
}

export interface ChartFilter {
  confirmed: boolean;
  pending: boolean;
  cancelled: boolean;
}
