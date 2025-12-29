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
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventori Bahan Mentah</h1>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} total bahan
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Bahan</span>
              <span className="sm:hidden">Tambah</span>
            </button>
            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{lowStockCount} Stok Rendah</span>
              </div>
            )}
            {outOfStockCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{outOfStockCount} Habis</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari item inventori..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada bahan ditemukan</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Coba sesuaikan pencarian atau filter Anda' : 'Belum ada data bahan mentah'}
            </p>
            {!searchQuery && (
              <button
                onClick={onAddNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Bahan Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
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
