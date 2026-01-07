import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
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
    if (!window.confirm(t('reservation.confirmDelete', { name: reservation.customerName }))) {
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
      <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
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
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Date Picker */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-xs sm:text-sm w-[130px] sm:w-auto"
                />
              </div>

              {/* View Toggle (Desktop Only) */}
              {isLargeScreen && (
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`
                      px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium transition-colors flex items-center gap-1
                      ${viewMode === 'grid'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }
                    `}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden md:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium transition-colors flex items-center gap-1 border-l border-border
                      ${viewMode === 'list'
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background p-4 sm:p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">{t('reservation.loadingData')}</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <p className="text-destructive">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-destructive hover:text-destructive/80 underline"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reservations.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Belum ada reservasi</h3>
            <p className="text-muted-foreground mb-4">
              Tidak ada reservasi untuk tanggal {new Date(selectedDate).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <button
              onClick={handleAddReservation}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
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
