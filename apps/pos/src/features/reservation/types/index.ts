// Types matching MongoDB Reservation model
export interface Reservation {
  _id: string;
  guest_name: string;
  whatsapp: string;
  email?: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  pax: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  table_id?: {
    _id: string;
    number: number;
    name?: string;
    capacity: number;
  } | string;
  notes?: string;
  admin_notes?: string;
  approved_by?: {
    _id: string;
    username: string;
  } | string;
  approved_at?: string;
  createdAt: string;
  updatedAt: string;
}

// Table type from MongoDB
export interface Table {
  _id: string;
  number: number;
  name?: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  floor?: string;
}

// Form data for creating/updating reservations
export interface ReservationFormData {
  guest_name: string;
  whatsapp: string;
  email?: string;
  date: string;
  time: string;
  pax: number;
  table_id?: string;
  notes?: string;
}

export interface ReservationFilters {
  status?: string;
  date?: string;
  page?: number;
}

export type DrawerType = 'add' | 'edit' | null;

// Legacy types for backward compatibility with grid view
export interface LegacyReservation {
  id: string;
  tableId: string;
  tableName: string;
  floor: '1st' | '2nd';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pax: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentMethod: 'cash' | 'card' | 'transfer';
  specialRequests?: string;
  createdAt: string;
}

export interface LegacyTable {
  id: string;
  name: string;
  floor: '1st' | '2nd';
  capacity: number;
  position: {
    x: number;
    y: number;
  };
}

// Helper to convert API reservation to legacy format for grid view
export const toLegacyReservation = (r: Reservation): LegacyReservation => {
  const tableInfo = typeof r.table_id === 'object' && r.table_id ? r.table_id : null;
  
  return {
    id: r._id,
    tableId: tableInfo?._id || '',
    tableName: tableInfo?.name || `Table ${tableInfo?.number || 'TBD'}`,
    floor: '1st', // Default floor since MongoDB model doesn't have floor
    customerName: r.guest_name,
    customerPhone: r.whatsapp,
    customerEmail: r.email || '',
    pax: r.pax,
    date: r.date.split('T')[0],
    startTime: r.time,
    endTime: calculateEndTime(r.time, 120), // Default 2 hour duration
    duration: 120,
    status: mapStatus(r.status),
    paymentMethod: 'cash',
    specialRequests: r.notes,
    createdAt: r.createdAt,
  };
};

// Helper to calculate end time
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

// Map API status to legacy status
const mapStatus = (status: Reservation['status']): LegacyReservation['status'] => {
  switch (status) {
    case 'APPROVED': return 'confirmed';
    case 'PENDING': return 'pending';
    case 'CANCELLED': return 'cancelled';
    case 'COMPLETED': return 'completed';
    case 'REJECTED': return 'cancelled';
    default: return 'pending';
  }
};
