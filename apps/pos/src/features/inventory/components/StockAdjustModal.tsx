import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import { InventoryItem } from '../types';

interface StockAdjustModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (qtyChange: number, reason: string, notes?: string, costPerUnit?: number) => Promise<void>;
}

const STOCK_REASONS = [
  { value: 'RESTOCK', label: 'Restok / Pembelian' },
  { value: 'ADJUSTMENT', label: 'Penyesuaian Stok' },
  { value: 'USAGE', label: 'Pemakaian Produksi' },
  { value: 'DAMAGED', label: 'Barang Rusak' },
  { value: 'EXPIRED', label: 'Kadaluarsa' },
  { value: 'LOST', label: 'Hilang' },
  { value: 'RETURN', label: 'Retur ke Supplier' },
  { value: 'WASTAGE', label: 'Terbuang' },
  { value: 'OTHER', label: 'Lainnya' },
];

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('RESTOCK');
  const [notes, setNotes] = useState('');
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && item) {
      setAdjustType('add');
      setQuantity(0);
      setReason('RESTOCK');
      setNotes('');
      setCostPerUnit(item.price || 0);
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setIsSaving(true);
    try {
      const qtyChange = adjustType === 'add' ? quantity : -quantity;
      const finalCostPerUnit = adjustType === 'add' && costPerUnit > 0 ? costPerUnit : undefined;
      await onSave(qtyChange, reason, notes || undefined, finalCostPerUnit);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen || !item) return null;

  const newStock = adjustType === 'add' 
    ? item.quantity + quantity 
    : Math.max(0, item.quantity - quantity);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Sesuaikan Stok</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Item Info */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover bg-muted"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEM0MS45NDExIDQ4IDUwIDM5Ljk0MTEgNTAgMzJDNTAgMjQuMDU4OSA0MS45NDExIDE2IDMyIDE2QzIyLjA1ODkgMTYgMTQgMjQuMDU4OSAxNCAzMkMxNCAzOS45NDExIDIyLjA1ODkgNDggMzIgNDhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                }}
              />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="text-sm font-medium text-foreground">{formatPrice(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Stok Saat Ini</p>
                <p className="text-2xl font-bold text-foreground">{item.quantity} {item.unit || 'unit'}</p>
              </div>
            </div>

            {/* Adjust Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipe Penyesuaian
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                    adjustType === 'add'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Tambah</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('subtract')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                    adjustType === 'subtract'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                  <span className="font-medium">Kurangi</span>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Jumlah *
              </label>
              <input
                type="number"
                min="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                placeholder="Masukkan jumlah"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-lg"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Alasan *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {STOCK_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan..."
                rows={2}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            {/* Cost per Unit (for stock in) */}
            {adjustType === 'add' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Harga per {item.unit || 'unit'} (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={costPerUnit || ''}
                  onChange={(e) => setCostPerUnit(parseInt(e.target.value) || 0)}
                  placeholder="Masukkan harga per unit"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Kosongkan jika menggunakan harga lama: {formatPrice(item.price)}
                </p>
              </div>
            )}

            {/* Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stok Baru:</span>
                <span className={`text-xl font-bold ${
                  newStock === 0 ? 'text-red-600 dark:text-red-400' : newStock < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {newStock}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 px-4 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={quantity <= 0 || isSaving}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
