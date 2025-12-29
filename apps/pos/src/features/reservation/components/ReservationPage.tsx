import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Grid, List } from 'lucide-react';
import { ReservationGrid } from './ReservationGrid';
import { ReservationList } from './ReservationList';
import { ReservationForm } from './ReservationForm';
import { useReservationData } from '../hooks/useReservationData';
import { Reservation, DrawerType } from '../types';

interface ReservationPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const ReservationPage: React.FC<ReservationPageProps> = ({
  isSidebarCollapsed = false,
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const {
    reservations,
    tables,
    selectedFloor,
    selectedDate,
    statistics,
    setSelectedFloor,
    setSelectedDate,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservationById,
    isTableAvailable,
  } = useReservationData();

  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Check screen size for responsive view switching
  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 1024; // lg breakpoint
      setIsLargeScreen(isLarge);
      
      // Auto-switch to list view on smaller screens
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
    { id: '1st' as const, label: '1st Floor', count: statistics.total },
    { id: '2nd' as const, label: '2nd Floor', count: statistics.total },
  ];

  // Handlers
  const handleAddReservation = () => {
    setEditingReservation(null);
    setActiveDrawer('add');
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setActiveDrawer('edit');
  };

  const handleSaveReservation = (formData: any) => {
    if (editingReservation) {
      updateReservation(editingReservation.id, formData);
    } else {
      addReservation(formData);
    }
    setActiveDrawer(null);
    setEditingReservation(null);
  };

  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setEditingReservation(null);
  };

  const handleReservationClick = (reservation: Reservation) => {
    // Navigate to reservation detail page
    window.location.href = `/reservation/${reservation.id}`;
  };

  return (
    <div className="flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Reservation Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage restaurant table reservations and bookings
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{statistics.total} Reservations</span>
            <span>•</span>
            <span>{statistics.confirmed} Confirmed</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Side - Floor Tabs */}
          <div className="flex items-center gap-1">
            {floorTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFloor(tab.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
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

          {/* Right Side - Date, View Toggle, Add Button */}
          <div className="flex items-center gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              />
            </div>

            {/* View Toggle (Desktop Only) */}
            {isLargeScreen && (
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1
                    ${viewMode === 'grid'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Grid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 border-l border-gray-300
                    ${viewMode === 'list'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            )}

            {/* Add New Reservation Button */}
            <button
              onClick={handleAddReservation}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Reservation
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-4 sm:p-6">
        {/* View Switcher */}
        {isLargeScreen && viewMode === 'grid' ? (
          <ReservationGrid
            tables={tables}
            reservations={reservations}
            selectedDate={selectedDate}
            onReservationClick={handleReservationClick}
          />
        ) : (
          <ReservationList
            reservations={reservations}
            onReservationClick={handleReservationClick}
            onEditReservation={handleEditReservation}
          />
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