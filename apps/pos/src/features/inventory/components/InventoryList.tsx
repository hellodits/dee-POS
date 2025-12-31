import React from 'react';
import { Search, Package, AlertTriangle, XCircle, Plus } from 'lucide-react';
import { InventoryItem as IInventoryItem } from '../types';
import { InventoryItem } from './InventoryItem';

interface InventoryListProps {
  items: IInventoryItem[];
  totalCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNew: () => void;
  onEditItem: (item: IInventoryItem) => void;
  onAdjustStock: (item: IInventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  isDeleting?: string | null;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  totalCount,
  lowStockCount,
  outOfStockCount,
  searchQuery,
  onSearchChange,
  onAddNew,
  onEditItem,
  onAdjustStock,
  onDeleteItem,
  isDeleting,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sm:p-6 flex-shrink-0">
        {/* Title Row */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Inventori Bahan Mentah</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalCount} total bahan
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Bahan</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        {/* Status Badges - Mobile: Stack, Desktop: Row */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-medium">{lowStockCount} Stok Rendah</span>
              </div>
            )}
            {outOfStockCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-sm">
                <XCircle className="w-3.5 h-3.5" />
                <span className="font-medium">{outOfStockCount} Habis</span>
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari item inventori..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 p-3 sm:p-6 bg-muted/30 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Tidak ada bahan ditemukan</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              {searchQuery ? 'Coba sesuaikan pencarian atau filter Anda' : 'Belum ada data bahan mentah'}
            </p>
            {!searchQuery && (
              <button
                onClick={onAddNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Bahan Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {items.map((item) => (
              <InventoryItem
                key={item.id}
                item={item}
                onEdit={onEditItem}
                onAdjustStock={onAdjustStock}
                onDelete={onDeleteItem}
                isDeleting={isDeleting === item.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
