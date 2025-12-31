// This file is deprecated - data now comes from API
// Keeping for backward compatibility with any remaining references

// Time slots for the scheduler (10:00 - 22:00)
export const timeSlots = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

// Empty arrays - data now fetched from API
export const tables: never[] = [];
export const mockReservations: never[] = [];

export const getTablesByFloor = () => [];
export const getReservationsByFloorAndDate = () => [];
