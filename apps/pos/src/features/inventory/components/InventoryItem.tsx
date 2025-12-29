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
    const baseClasses = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full';
    if (stockStatus === 'outofstock' || quantity === 0) {
      return {
        className: `${baseClasses} bg-red-100 text-red-800`,
        label: 'Habis'
      };
    }
    if (stockStatus === 'lowstock' || quantity < 10) {
      return {
        className: `${baseClasses} bg-amber-100 text-amber-800`,
        label: 'Stok Rendah'
      };
    }
    return {
      className: `${baseClasses} bg-green-100 text-green-800`,
      label: 'Tersedia'
    };
  };

  const stockBadge = getStockStatusBadge(item.stockStatus, item.quantity);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover bg-gray-100"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEM0MS45NDExIDQ4IDUwIDM5Ljk0MTEgNTAgMzJDNTAgMjQuMDU4OSA0MS45NDExIDE2IDMyIDE2QzIyLjA1ODkgMTYgMTQgMjQuMDU4OSAxNCAzMkMxNCAzOS45NDExIDIyLjA1ODkgNDggMzIgNDhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0zMiAzNkMzNC4yMDkxIDM2IDM2IDM0LjIwOTEgMzYgMzJDMzYgMjkuNzkwOSAzNC4yMDkxIDI4IDMyIDI4QzI5Ljc5MDkgMjggMjggMjkuNzkwOSAyOCAzMkMyOCAzNC4yMDkxIDI5Ljc5MDkgMzYgMzIgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h3>
              <div className="mt-1 flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-1">
                  <Package className="w-3 h-3 text-gray-400" />
                  <span className={`font-medium ${
                    item.quantity === 0 ? 'text-red-600' : 
                    item.quantity < 10 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {item.quantity} {item.unit || 'unit'}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{item.category}</span>
                {item.supplier && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{item.supplier}</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Price and Status */}
            <div className="flex flex-col items-end space-y-2">
              <div className="text-sm font-medium text-gray-900">
                {formatPrice(item.price)}
              </div>
              <span className={stockBadge.className}>
                {stockBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(item)}
            disabled={isDeleting}
            className="px-3 py-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
            title="Edit bahan"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAdjustStock(item)}
            disabled={isDeleting}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Sesuaikan stok"
          >
            Sesuaikan
          </button>
          <button
            onClick={() => onDelete(item.id)}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Hapus bahan"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
