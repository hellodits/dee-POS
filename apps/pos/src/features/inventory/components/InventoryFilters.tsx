import React from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { InventoryFilters as IInventoryFilters, Category } from '../types';

interface InventoryFiltersProps {
  filters: IInventoryFilters;
  categories: Category[];
  onFiltersChange: (filters: Partial<IInventoryFilters>) => void;
  onResetFilters: () => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  categories,
  onFiltersChange,
  onResetFilters,
}) => {
  const statusTabs = [
    { id: 'all', label: 'Semua' },
    { id: 'active', label: 'Aktif' },
    { id: 'inactive', label: 'Nonaktif' },
  ];

  const stockStatuses = [
    { value: 'all', label: 'Semua Stok' },
    { value: 'instock', label: 'Tersedia' },
    { value: 'lowstock', label: 'Stok Rendah' },
    { value: 'outofstock', label: 'Habis' },
  ];

  const valueOptions = [
    { value: 'all', label: 'Semua Harga' },
    { value: 'low', label: 'Rendah (< 50rb)' },
    { value: 'medium', label: 'Sedang (50rb - 100rb)' },
    { value: 'high', label: 'Tinggi (> 100rb)' },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto h-full">
      {/* Product Status Tabs */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Status Produk</h3>
        <div className="grid grid-cols-2 gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFiltersChange({ status: tab.id as any })}
              className={`
                p-3 rounded-lg text-left transition-colors
                ${
                  filters.status === tab.id
                    ? 'bg-red-50 border-2 border-red-600 text-red-700'
                    : 'bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="font-medium text-sm">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Kategori</label>
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ category: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stock Status Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Status Stok</label>
        <div className="relative">
          <select
            value={filters.stockStatus}
            onChange={(e) => onFiltersChange({ stockStatus: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
          >
            {stockStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Value Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Rentang Harga</label>
        <div className="relative">
          <select
            value={filters.value}
            onChange={(e) => onFiltersChange({ value: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
          >
            {valueOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Price Range - Vertical Layout */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Harga Kustom</label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Harga Minimum</label>
            <input
              type="number"
              placeholder="Masukkan harga minimum"
              value={filters.priceMin || ''}
              onChange={(e) => onFiltersChange({ priceMin: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Harga Maksimum</label>
            <input
              type="number"
              placeholder="Masukkan harga maksimum"
              value={filters.priceMax || ''}
              onChange={(e) => onFiltersChange({ priceMax: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="text-xs text-gray-500">
            Masukkan rentang harga dalam Rupiah
          </div>
        </div>
      </div>

      {/* Reset Filters Button */}
      <button
        onClick={onResetFilters}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Filter
      </button>
    </div>
  );
};
