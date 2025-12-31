import { useState, useEffect, useMemo, useCallback } from 'react';
import { reservationsApi, tablesApi } from '@/lib/api';
import { 
  Reservation, 
  ReservationFormData, 
  Table, 
  LegacyReservation, 
  LegacyTable,
  toLegacyReservation 
} from '../types';

// Static table layout for grid view (since MongoDB tables don't have position/floor)
const staticTableLayout: LegacyTable[] = [
  // 1st Floor Tables
  { id: '1', name: 'Table 1', floor: '1st', capacity: 2, position: { x: 0, y: 0 } },
  { id: '2', name: 'Table 2', floor: '1st', capacity: 4, position: { x: 1, y: 0 } },
  { id: '3', name: 'Table 3', floor: '1st', capacity: 6, position: { x: 2, y: 0 } },
  { id: '4', name: 'Table 4', floor: '1st', capacity: 2, position: { x: 0, y: 1 } },
  { id: '5', name: 'Table 5', floor: '1st', capacity: 4, position: { x: 1, y: 1 } },
  { id: '6', name: 'Table 6', floor: '1st', capacity: 8, position: { x: 2, y: 1 } },
  // 2nd Floor Tables
  { id: '7', name: 'Table 7', floor: '2nd', capacity: 2, position: { x: 0, y: 0 } },
  { id: '8', name: 'Table 8', floor: '2nd', capacity: 4, position: { x: 1, y: 0 } },
  { id: '9', name: 'Table 9', floor: '2nd', capacity: 6, position: { x: 2, y: 0 } },
  { id: '10', name: 'Table 10', floor: '2nd', capacity: 4, position: { x: 0, y: 1 } },
];

export const useReservationData = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<'1st' | '2nd'>('1st');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch reservations from API
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservationsApi.getAll({ date: selectedDate });
      
      if (response.data.success && response.data.data) {
        setReservations(response.data.data as Reservation[]);
      }
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
      setError('Gagal memuat data reservasi');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch tables from API
  const fetchTables = useCallback(async () => {
    try {
      const response = await tablesApi.getAll();
      
      if (response.data.success && response.data.data) {
        setTables(response.data.data as Table[]);
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [fetchReservations, fetchTables]);

  // Convert to legacy format for list/grid view
  const legacyReservations = useMemo(() => {
    return reservations.map(toLegacyReservation);
  }, [reservations]);

  // All legacy reservations (for list view - no floor filter)
  const allLegacyReservations = legacyReservations;

  // Get tables for selected floor (for grid view)
  const floorTables = useMemo(() => {
    return staticTableLayout.filter(t => t.floor === selectedFloor);
  }, [selectedFloor]);

  // Statistics
  const statistics = useMemo(() => {
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'APPROVED').length,
      pending: reservations.filter(r => r.status === 'PENDING').length,
      cancelled: reservations.filter(r => r.status === 'CANCELLED' || r.status === 'REJECTED').length,
      completed: reservations.filter(r => r.status === 'COMPLETED').length,
    };
  }, [reservations]);

  // CRUD operations
  const addReservation = async (formData: ReservationFormData) => {
    try {
      const response = await reservationsApi.create({
        guest_name: formData.guest_name,
        whatsapp: formData.whatsapp,
        date: formData.date,
        time: formData.time,
        pax: formData.pax,
        notes: formData.notes,
      });

      if (response.data.success) {
        await fetchReservations();
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (err: any) {
      console.error('Failed to create reservation:', err);
      return { success: false, error: err.response?.data?.error || 'Gagal membuat reservasi' };
    }
  };

  const approveReservation = async (id: string, tableId?: string, adminNotes?: string) => {
    try {
      const response = await reservationsApi.approve(id, { 
        table_id: tableId, 
        admin_notes: adminNotes 
      });

      if (response.data.success) {
        await fetchReservations();
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (err: any) {
      console.error('Failed to approve reservation:', err);
      return { success: false, error: err.response?.data?.error || 'Gagal menyetujui reservasi' };
    }
  };

  const rejectReservation = async (id: string, adminNotes?: string) => {
    try {
      const response = await reservationsApi.reject(id, adminNotes);

      if (response.data.success) {
        await fetchReservations();
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (err: any) {
      console.error('Failed to reject reservation:', err);
      return { success: false, error: err.response?.data?.error || 'Gagal menolak reservasi' };
    }
  };

  const getReservationById = (id: string): Reservation | undefined => {
    return reservations.find(r => r._id === id);
  };

  // Legacy compatibility functions
  const updateReservation = async (id: string, _formData: ReservationFormData) => {
    // Note: Backend doesn't have update endpoint, only approve/reject
    console.warn('Update reservation not implemented in backend');
    return { success: false, error: 'Fitur update belum tersedia' };
  };

  const deleteReservation = async (id: string) => {
    try {
      const response = await reservationsApi.delete(id);

      if (response.data.success) {
        await fetchReservations();
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (err: any) {
      console.error('Failed to delete reservation:', err);
      return { success: false, error: err.response?.data?.error || 'Gagal menghapus reservasi' };
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    if (status === 'APPROVED' || status === 'confirmed') {
      return approveReservation(id);
    } else if (status === 'REJECTED' || status === 'cancelled') {
      return rejectReservation(id);
    }
    return { success: false, error: 'Status tidak valid' };
  };

  // Check table availability (simplified - actual logic should be on backend)
  const isTableAvailable = (_tableId: string, _date: string, _startTime: string, _endTime: string, _excludeId?: string): boolean => {
    // For now, return true - actual availability should be checked via API
    return true;
  };

  const getAvailableTables = (_date: string, _startTime: string, _endTime: string, _floor?: '1st' | '2nd'): Table[] => {
    return tables.filter(t => t.status === 'Available');
  };

  return {
    // API data
    reservations,
    apiTables: tables,
    loading,
    error,
    
    // Legacy format for views
    legacyReservations: allLegacyReservations,
    tables: floorTables,
    allTables: staticTableLayout,
    
    // Filters
    selectedFloor,
    selectedDate,
    statistics,
    setSelectedFloor,
    setSelectedDate,
    
    // CRUD
    addReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus,
    approveReservation,
    rejectReservation,
    getReservationById,
    
    // Utilities
    isTableAvailable,
    getAvailableTables,
    refetch: fetchReservations,
  };
};
