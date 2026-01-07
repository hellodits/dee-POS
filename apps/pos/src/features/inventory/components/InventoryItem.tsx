import React from 'react';
import { Edit, Trash2, Package, Loader2 } from 'lucide-react';
import { InventoryItem as IInventoryItem } from '../types';

interface InventoryItemProps {
  item: IInventoryItem;
  onEdit: (item: IInventoryItem) => void;
  onAdjustStock: (item: IInventoryItem) => void;
  onDelete: (itemId: string) => void;
  isDeleting?: boolean;
}

export const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  onEdit,
  onAdjustStock,
  onDelete,
  isDeleting = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatusBadge = (stockStatus: string, quantity: number) => {
    const baseClasses = 'inline-flex px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap';
    if (stockStatus === 'outofstock' || quantity === 0) {
      return {
        className: `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`,
        label: 'Habis'
      };
    }
    if (stockStatus === 'lowstock' || quantity < 10) {
      return {
        className: `${baseClasses} bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300`,
        label: 'Stok Rendah'
      };
    }
    return {
      className: `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`,
      label: 'Tersedia'
    };
  };

  const stockBadge = getStockStatusBadge(item.stockStatus, item.quantity);

  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
      {/* Mobile Layout */}
      <div className="flex flex-col sm:hidden space-y-3">
        {/* Top Row: Image + Name + Price */}
        <div className="flex items-start space-x-3">
          <img
            src={item.image}
            alt={item.name}
            className="w-14 h-14 rounded-lg object-cover bg-muted flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEM0MS45NDExIDQ4IDUwIDM5Ljk0MTEgNTAgMzJDNTAgMjQuMDU4OSA0MS45NDExIDE2IDMyIDE2QzIyLjA1ODkgMTYgMTQgMjQuMDU4OSAxNCAzMkMxNCAzOS45NDExIDIyLjA1ODkgNDggMzIgNDhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{item.name}</h3>
            <p className="text-sm font-semibold text-primary mt-0.5">{formatPrice(item.price)}</p>
          </div>
        </div>

        {/* Middle Row: Info Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
            item.quantity === 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
            item.quantity < 10 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          }`}>
            <Package className="w-3 h-3" />
            <span>{item.quantity} {item.unit || 'unit'}</span>
          </div>
          <span className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">{item.category}</span>
          <span className={stockBadge.className}>{stockBadge.label}</span>
        </div>

        {/* Bottom Row: Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {item.supplier && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{item.supplier}</span>
          )}
          {!item.supplier && <span />}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onAdjustStock(item)}
              disabled={isDeleting}
              className="px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
            >
              Sesuaikan
            </button>
            <button
              onClick={() => onEdit(item)}
              disabled={isDeleting}
              className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded transition-colors disabled:opacity-50"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              disabled={isDeleting}
              className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tablet/Desktop Layout */}
      <div className="hidden sm:flex items-center space-x-4">
        {/* Image */}
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover bg-muted flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{item.name}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <div className={`flex items-center space-x-1 font-medium ${
                  item.quantity === 0 ? 'text-red-600 dark:text-red-400' : 
                  item.quantity < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  <Package className="w-3.5 h-3.5" />
                  <span>{item.quantity} {item.unit || 'unit'}</span>
                </div>
                <span className="text-muted-foreground">{item.category}</span>
                {item.supplier && (
                  <span className="text-muted-foreground truncate max-w-[150px]">{item.supplier}</span>
                )}
              </div>
            </div>
            
            {/* Price and Status */}
            <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
              <span className="font-semibold text-foreground">{formatPrice(item.price)}</span>
              <span className={stockBadge.className}>{stockBadge.label}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={() => onAdjustStock(item)}
            disabled={isDeleting}
            className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            Sesuaikan
          </button>
          <button
            onClick={() => onEdit(item)}
            disabled={isDeleting}
            className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Hapus"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
