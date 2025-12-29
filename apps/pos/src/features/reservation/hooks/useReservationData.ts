import { useState, useMemo } from 'react';
import { Reservation, ReservationFormData, Table } from '../types';
import { mockReservations, tables, getTablesByFloor, getReservationsByFloorAndDate } from '../data/reservationData';

export const useReservationData = () => {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [selectedFloor, setSelectedFloor] = useState<'1st' | '2nd'>('1st');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Get filtered data
  const filteredReservations = useMemo(() => {
    return getReservationsByFloorAndDate(selectedFloor, selectedDate);
  }, [selectedFloor, selectedDate, reservations]);

  const floorTables = useMemo(() => {
    return getTablesByFloor(selectedFloor);
  }, [selectedFloor]);

  // CRUD operations
  const addReservation = (formData: ReservationFormData) => {
    const table = tables.find(t => t.id === formData.tableId);
    if (!table) return;

    // Calculate duration
    const [startHour, startMin] = formData.startTime.split(':').map(Number);
    const [endHour, endMin] = formData.endTime.split(':').map(Number);
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      tableId: formData.tableId,
      tableName: table.name,
      floor: table.floor,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      pax: formData.pax,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration,
      status: 'pending',
      paymentMethod: formData.paymentMethod,
      specialRequests: formData.specialRequests,
      createdAt: new Date().toISOString(),
    };

    setReservations(prev => [...prev, newReservation]);
  };

  const updateReservation = (id: string, formData: ReservationFormData) => {
    const table = tables.find(t => t.id === formData.tableId);
    if (!table) return;

    // Calculate duration
    const [startHour, startMin] = formData.startTime.split(':').map(Number);
    const [endHour, endMin] = formData.endTime.split(':').map(Number);
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    setReservations(prev => prev.map(reservation => 
      reservation.id === id 
        ? {
            ...reservation,
            tableId: formData.tableId,
            tableName: table.name,
            floor: table.floor,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            customerEmail: formData.customerEmail,
            pax: formData.pax,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            duration,
            paymentMethod: formData.paymentMethod,
            specialRequests: formData.specialRequests,
          }
        : reservation
    ));
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(reservation => reservation.id !== id));
  };

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations(prev => prev.map(reservation => 
      reservation.id === id 
        ? { ...reservation, status }
        : reservation
    ));
  };

  const getReservationById = (id: string): Reservation | undefined => {
    return reservations.find(reservation => reservation.id === id);
  };

  // Check if a table is available at a specific time
  const isTableAvailable = (tableId: string, date: string, startTime: string, endTime: string, excludeReservationId?: string): boolean => {
    const tableReservations = reservations.filter(r => 
      r.tableId === tableId && 
      r.date === date && 
      r.status !== 'cancelled' &&
      r.id !== excludeReservationId
    );

    const [newStartHour, newStartMin] = startTime.split(':').map(Number);
    const [newEndHour, newEndMin] = endTime.split(':').map(Number);
    const newStartMinutes = newStartHour * 60 + newStartMin;
    const newEndMinutes = newEndHour * 60 + newEndMin;

    return !tableReservations.some(reservation => {
      const [existingStartHour, existingStartMin] = reservation.startTime.split(':').map(Number);
      const [existingEndHour, existingEndMin] = reservation.endTime.split(':').map(Number);
      const existingStartMinutes = existingStartHour * 60 + existingStartMin;
      const existingEndMinutes = existingEndHour * 60 + existingEndMin;

      // Check for overlap
      return (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes);
    });
  };

  // Get available tables for a specific time slot
  const getAvailableTables = (date: string, startTime: string, endTime: string, floor?: '1st' | '2nd'): Table[] => {
    const tablesToCheck = floor ? getTablesByFloor(floor) : tables;
    
    return tablesToCheck.filter(table => 
      isTableAvailable(table.id, date, startTime, endTime)
    );
  };

  // Statistics
  const statistics = useMemo(() => {
    const todayReservations = reservations.filter(r => r.date === selectedDate);
    const floorReservations = todayReservations.filter(r => r.floor === selectedFloor);
    
    return {
      total: floorReservations.length,
      confirmed: floorReservations.filter(r => r.status === 'confirmed').length,
      pending: floorReservations.filter(r => r.status === 'pending').length,
      cancelled: floorReservations.filter(r => r.status === 'cancelled').length,
      completed: floorReservations.filter(r => r.status === 'completed').length,
    };
  }, [reservations, selectedDate, selectedFloor]);

  return {
    reservations: filteredReservations,
    allReservations: reservations,
    tables: floorTables,
    allTables: tables,
    selectedFloor,
    selectedDate,
    statistics,
    setSelectedFloor,
    setSelectedDate,
    addReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus,
    getReservationById,
    isTableAvailable,
    getAvailableTables,
  };
};