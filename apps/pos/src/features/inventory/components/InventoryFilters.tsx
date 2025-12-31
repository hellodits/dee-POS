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
    <div className="w-72 lg:w-80 bg-card border-r border-border p-4 lg:p-6 space-y-5 overflow-y-auto h-full">
      {/* Product Status Tabs */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">Status Produk</h3>
        <div className="grid grid-cols-2 gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFiltersChange({ status: tab.id as any })}
              className={`
                px-3 py-2 rounded-lg text-center transition-colors text-sm
                ${
                  filters.status === tab.id
                    ? 'bg-primary/10 border-2 border-primary text-primary font-medium'
                    : 'bg-muted border-2 border-transparent text-muted-foreground hover:bg-accent'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Kategori</label>
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ category: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none text-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Stock Status Dropdown */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Status Stok</label>
        <div className="relative">
          <select
            value={filters.stockStatus}
            onChange={(e) => onFiltersChange({ stockStatus: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none text-sm"
          >
            {stockStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Value Dropdown */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Rentang Harga</label>
        <div className="relative">
          <select
            value={filters.value}
            onChange={(e) => onFiltersChange({ value: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none text-sm"
          >
            {valueOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Price Range - Vertical Layout */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Harga Kustom</label>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Harga Minimum</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => onFiltersChange({ priceMin: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Harga Maksimum</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => onFiltersChange({ priceMax: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">Dalam Rupiah</p>
        </div>
      </div>

      {/* Reset Filters Button */}
      <button
        onClick={onResetFilters}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Filter
      </button>
    </div>
  );
};
