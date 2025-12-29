export interface Reservation {
  id: string;
  tableId: string;
  tableName: string;
  floor: '1st' | '2nd';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pax: number;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // in minutes
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentMethod: 'cash' | 'card' | 'transfer';
  specialRequests?: string;
  createdAt: string;
}

export interface Table {
  id: string;
  name: string;
  floor: '1st' | '2nd';
  capacity: number;
  position: {
    x: number;
    y: number;
  };
}

export interface ReservationFormData {
  tableId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pax: number;
  date: string;
  startTime: string;
  endTime: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  specialRequests?: string;
}

export interface ReservationFilters {
  floor: '1st' | '2nd';
  date: string;
  status?: string;
}

export type DrawerType = 'add' | 'edit' | null;