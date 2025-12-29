import { Reservation, Table } from '../types';

export const tables: Table[] = [
  // 1st Floor Tables
  { id: 'A1', name: 'Table A1', floor: '1st', capacity: 2, position: { x: 0, y: 0 } },
  { id: 'A2', name: 'Table A2', floor: '1st', capacity: 4, position: { x: 1, y: 0 } },
  { id: 'A3', name: 'Table A3', floor: '1st', capacity: 6, position: { x: 2, y: 0 } },
  { id: 'A4', name: 'Table A4', floor: '1st', capacity: 2, position: { x: 0, y: 1 } },
  { id: 'A5', name: 'Table A5', floor: '1st', capacity: 4, position: { x: 1, y: 1 } },
  { id: 'A6', name: 'Table A6', floor: '1st', capacity: 8, position: { x: 2, y: 1 } },
  { id: 'A7', name: 'Table A7', floor: '1st', capacity: 2, position: { x: 0, y: 2 } },
  { id: 'A8', name: 'Table A8', floor: '1st', capacity: 4, position: { x: 1, y: 2 } },
  
  // 2nd Floor Tables
  { id: 'B1', name: 'Table B1', floor: '2nd', capacity: 2, position: { x: 0, y: 0 } },
  { id: 'B2', name: 'Table B2', floor: '2nd', capacity: 4, position: { x: 1, y: 0 } },
  { id: 'B3', name: 'Table B3', floor: '2nd', capacity: 6, position: { x: 2, y: 0 } },
  { id: 'B4', name: 'Table B4', floor: '2nd', capacity: 2, position: { x: 0, y: 1 } },
  { id: 'B5', name: 'Table B5', floor: '2nd', capacity: 4, position: { x: 1, y: 1 } },
  { id: 'B6', name: 'Table B6', floor: '2nd', capacity: 8, position: { x: 2, y: 1 } },
  { id: 'B7', name: 'Table B7', floor: '2nd', capacity: 2, position: { x: 0, y: 2 } },
  { id: 'B8', name: 'Table B8', floor: '2nd', capacity: 4, position: { x: 1, y: 2 } },
];

// Helper function to calculate duration in minutes
const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes - startMinutes;
};

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const mockReservations: Reservation[] = [
  {
    id: 'res-001',
    tableId: 'A1',
    tableName: 'Table A1',
    floor: '1st',
    customerName: 'John Doe',
    customerPhone: '+62 812-3456-7890',
    customerEmail: 'john.doe@email.com',
    pax: 2,
    date: today,
    startTime: '12:00',
    endTime: '14:00',
    duration: calculateDuration('12:00', '14:00'),
    status: 'confirmed',
    paymentMethod: 'card',
    specialRequests: 'Window seat preferred',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-002',
    tableId: 'A2',
    tableName: 'Table A2',
    floor: '1st',
    customerName: 'Jane Smith',
    customerPhone: '+62 813-9876-5432',
    customerEmail: 'jane.smith@email.com',
    pax: 4,
    date: today,
    startTime: '18:00',
    endTime: '20:30',
    duration: calculateDuration('18:00', '20:30'),
    status: 'confirmed',
    paymentMethod: 'cash',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-003',
    tableId: 'A3',
    tableName: 'Table A3',
    floor: '1st',
    customerName: 'Michael Johnson',
    customerPhone: '+62 814-1111-2222',
    customerEmail: 'michael.j@email.com',
    pax: 6,
    date: today,
    startTime: '19:00',
    endTime: '21:00',
    duration: calculateDuration('19:00', '21:00'),
    status: 'pending',
    paymentMethod: 'transfer',
    specialRequests: 'Birthday celebration',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-004',
    tableId: 'A5',
    tableName: 'Table A5',
    floor: '1st',
    customerName: 'Sarah Wilson',
    customerPhone: '+62 815-3333-4444',
    customerEmail: 'sarah.w@email.com',
    pax: 3,
    date: today,
    startTime: '13:30',
    endTime: '15:00',
    duration: calculateDuration('13:30', '15:00'),
    status: 'confirmed',
    paymentMethod: 'card',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-005',
    tableId: 'B1',
    tableName: 'Table B1',
    floor: '2nd',
    customerName: 'David Brown',
    customerPhone: '+62 816-5555-6666',
    customerEmail: 'david.brown@email.com',
    pax: 2,
    date: today,
    startTime: '20:00',
    endTime: '22:00',
    duration: calculateDuration('20:00', '22:00'),
    status: 'confirmed',
    paymentMethod: 'transfer',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-006',
    tableId: 'B3',
    tableName: 'Table B3',
    floor: '2nd',
    customerName: 'Emily Davis',
    customerPhone: '+62 817-7777-8888',
    customerEmail: 'emily.davis@email.com',
    pax: 5,
    date: tomorrow,
    startTime: '12:30',
    endTime: '14:30',
    duration: calculateDuration('12:30', '14:30'),
    status: 'confirmed',
    paymentMethod: 'card',
    specialRequests: 'Vegetarian menu',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-007',
    tableId: 'B5',
    tableName: 'Table B5',
    floor: '2nd',
    customerName: 'Robert Miller',
    customerPhone: '+62 818-9999-0000',
    customerEmail: 'robert.m@email.com',
    pax: 4,
    date: tomorrow,
    startTime: '19:30',
    endTime: '21:30',
    duration: calculateDuration('19:30', '21:30'),
    status: 'pending',
    paymentMethod: 'cash',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-008',
    tableId: 'A6',
    tableName: 'Table A6',
    floor: '1st',
    customerName: 'Lisa Anderson',
    customerPhone: '+62 819-1234-5678',
    customerEmail: 'lisa.anderson@email.com',
    pax: 8,
    date: tomorrow,
    startTime: '18:30',
    endTime: '21:00',
    duration: calculateDuration('18:30', '21:00'),
    status: 'confirmed',
    paymentMethod: 'transfer',
    specialRequests: 'Corporate dinner',
    createdAt: new Date().toISOString(),
  },
];

// Time slots for the scheduler (10:00 - 22:00)
export const timeSlots = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export const getTablesByFloor = (floor: '1st' | '2nd'): Table[] => {
  return tables.filter(table => table.floor === floor);
};

export const getReservationsByFloorAndDate = (floor: '1st' | '2nd', date: string): Reservation[] => {
  return mockReservations.filter(reservation => 
    reservation.floor === floor && reservation.date === date
  );
};