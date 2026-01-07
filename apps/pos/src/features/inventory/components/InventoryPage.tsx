import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Filter, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { InventoryFilters } from './InventoryFilters';
import { InventoryList } from './InventoryList';
import { InventoryForm } from './InventoryForm';
import { StockAdjustModal } from './StockAdjustModal';
import { useInventoryData } from '../hooks/useInventoryData';
import { InventoryItem, InventoryFormData } from '../types';

interface InventoryPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const { t } = useTranslation();
  
  const {
    items,
    categories,
    filters,
    statistics,
    isLoading,
    error,
    addItem,
    updateItem,
    updateStock,
    deleteItem,
    updateFilters,
    resetFilters,
    refetch,
  } = useInventoryData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Handle form actions
  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSaveItem = async (formData: InventoryFormData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
      } else {
        await addItem(formData);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert(t('inventory.failedToSave'));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // Handle stock adjustment
  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsStockModalOpen(true);
  };

  const handleSaveStockAdjust = async (qtyChange: number, reason: string, notes?: string, costPerUnit?: number) => {
    if (!selectedItem) return;
    
    try {
      await updateStock(selectedItem.id, qtyChange, reason, notes, costPerUnit);
      setIsStockModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      alert(t('inventory.failedToUpdateStock'));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm(t('inventory.confirmDelete'))) {
      setIsDeleting(itemId);
      try {
        await deleteItem(itemId);
      } catch (err) {
        alert(t('inventory.failedToDelete'));
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Handle search
  const handleSearchChange = (search: string) => {
    updateFilters({ search });
  };

  return (
    <div className="flex-1 bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{t('inventory.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('inventory.subtitle')}
            </p>
          </div>
          {/* Mobile Filter Button */}
          {isMobile && (
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.openFilters')}
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex bg-background overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">{t('inventory.loadingData')}</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-foreground font-medium mb-2">{error}</p>
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.tryAgain')}
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Desktop Filters Sidebar */}
            {!isMobile && (
              <div className="flex-shrink-0">
                <InventoryFilters
                  filters={filters}
                  categories={categories}
                  onFiltersChange={updateFilters}
                  onResetFilters={resetFilters}
                />
              </div>
            )}

            {/* Inventory List */}
            <div className="flex-1 overflow-hidden">
              <InventoryList
                items={items}
                totalCount={statistics.total}
                lowStockCount={statistics.lowStock}
                outOfStockCount={statistics.outOfStock}
                searchQuery={filters.search}
                onSearchChange={handleSearchChange}
                onAddNew={handleAddNew}
                onEditItem={handleEditItem}
                onAdjustStock={handleAdjustStock}
                onDeleteItem={handleDeleteItem}
                isDeleting={isDeleting}
              />
            </div>
          </>
        )}
      </main>

      {/* Mobile Filters Modal */}
      {isMobile && isMobileFiltersOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">{t('common.filter')}</h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <InventoryFilters
                filters={filters}
                categories={categories}
                onFiltersChange={updateFilters}
                onResetFilters={resetFilters}
              />
            </div>
          </div>
        </>
      )}

      {/* Inventory Form Drawer */}
      <InventoryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveItem}
        editingItem={editingItem}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={isStockModalOpen}
        item={selectedItem}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleSaveStockAdjust}
      />
    </div>
  );
};
