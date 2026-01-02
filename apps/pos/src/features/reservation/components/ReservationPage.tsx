import React, { useState, useEffect } from 'react';
import { Menu, Plus, Calendar, Grid, List, Loader2, RefreshCw } from 'lucide-react';
import { ReservationGrid } from './ReservationGrid';
import { ReservationList } from './ReservationList';
import { ReservationForm } from './ReservationForm';
import { useReservationData } from '../hooks/useReservationData';
import { Reservation, LegacyReservation, DrawerType } from '../types';

interface ReservationPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const ReservationPage: React.FC<ReservationPageProps> = ({
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const {
    reservations,
    legacyReservations,
    tables,
    selectedFloor,
    selectedDate,
    statistics,
    loading,
    error,
    setSelectedFloor,
    setSelectedDate,
    addReservation,
    deleteReservation,
    getReservationById,
    isTableAvailable,
    refetch,
  } = useReservationData();

  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Check screen size for responsive view switching
  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsLargeScreen(isLarge);
      
      if (!isLarge) {
        setViewMode('list');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Floor tabs
  const floorTabs = [
    { id: '1st' as const, label: '1st Floor' },
    { id: '2nd' as const, label: '2nd Floor' },
  ];

  // Handlers
  const handleAddReservation = () => {
    setEditingReservation(null);
    setActiveDrawer('add');
  };

  const handleEditReservation = (reservation: LegacyReservation) => {
    const apiReservation = getReservationById(reservation.id);
    if (apiReservation) {
      setEditingReservation(apiReservation);
      setActiveDrawer('edit');
    }
  };

  const handleSaveReservation = async (formData: any) => {
    const result = await addReservation(formData);
    if (result.success) {
      setActiveDrawer(null);
      setEditingReservation(null);
    }
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setEditingReservation(null);
  };

  const handleReservationClick = (reservation: LegacyReservation) => {
    window.location.href = `/reservation/${reservation.id}`;
  };

  const handleDeleteReservation = async (reservation: LegacyReservation) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus reservasi ${reservation.customerName}?`)) {
      return;
    }
    await deleteReservation(reservation.id);
  };

  return (
    <div className="flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-start sm:items-center gap-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target flex-shrink-0"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Reservation Management</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage restaurant table reservations and bookings
            </p>
            {/* Stats - shown below description on mobile */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">{statistics.total} Reservations</span>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-green-600">{statistics.confirmed} Approved</span>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-yellow-600">{statistics.pending} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-3">
          {/* Row 1: Floor Tabs & Actions */}
          <div className="flex items-center justify-between gap-2">
            {/* Floor Tabs */}
            <div className="flex items-center gap-1">
              {floorTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFloor(tab.id)}
                  className={`
                    px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors
                    ${selectedFloor === tab.id
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={() => refetch()}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Date Picker */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Calendar className="w-4 h-4 text-gray-500 hidden sm:block" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm w-[130px] sm:w-auto"
                />
              </div>

              {/* View Toggle (Desktop Only) */}
              {isLargeScreen && (
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`
                      px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium transition-colors flex items-center gap-1
                      ${viewMode === 'grid'
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden md:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium transition-colors flex items-center gap-1 border-l border-gray-300
                      ${viewMode === 'list'
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden md:inline">List</span>
                  </button>
                </div>
              )}

              {/* Add New Reservation Button */}
              <button
                onClick={handleAddReservation}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-4 sm:p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="ml-2 text-gray-600">Memuat data reservasi...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reservations.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada reservasi</h3>
            <p className="text-gray-500 mb-4">
              Tidak ada reservasi untuk tanggal {new Date(selectedDate).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <button
              onClick={handleAddReservation}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Buat Reservasi Baru
            </button>
          </div>
        )}

        {/* Data View */}
        {!loading && !error && reservations.length > 0 && (
          <>
            {isLargeScreen && viewMode === 'grid' ? (
              <ReservationGrid
                tables={tables}
                reservations={legacyReservations}
                selectedDate={selectedDate}
                onReservationClick={handleReservationClick}
              />
            ) : (
              <ReservationList
                reservations={legacyReservations}
                onReservationClick={handleReservationClick}
                onEditReservation={handleEditReservation}
                onDeleteReservation={handleDeleteReservation}
              />
            )}
          </>
        )}
      </main>

      {/* Reservation Form Drawer */}
      <ReservationForm
        isOpen={activeDrawer !== null}
        onClose={handleCloseDrawer}
        onSave={handleSaveReservation}
        tables={tables}
        editingReservation={editingReservation}
        selectedDate={selectedDate}
        selectedFloor={selectedFloor}
        isTableAvailable={isTableAvailable}
      />
    </div>
  );
};
