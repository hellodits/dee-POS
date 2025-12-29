import React, { useState, useEffect } from 'react';
import { ChevronRight, Upload, ChevronDown, Loader2 } from 'lucide-react';
import { Category, MenuItem, MenuItemFormData } from '../types';

interface MenuItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MenuItemFormData) => void;
  categories: Category[];
  editingItem?: MenuItem | null;
  isSaving?: boolean;
}

export const MenuItemDrawer: React.FC<MenuItemDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingItem,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    image: '',
    price: 0,
    stock: 0,
    categoryId: '',
    description: '',
    isSpecialDeal: false,
  });
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Reset form when drawer opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          name: editingItem.name,
          image: editingItem.image,
          price: editingItem.price,
          stock: editingItem.stock,
          categoryId: editingItem.categoryId,
          description: editingItem.description || '',
          isSpecialDeal: editingItem.isSpecialDeal || false,
        });
      } else {
        setFormData({
          name: '',
          image: '',
          price: 0,
          stock: 0,
          categoryId: '',
          description: '',
          isSpecialDeal: false,
        });
      }
    }
  }, [isOpen, editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    onSave(formData);
  };

  const handleInputChange = (field: keyof MenuItemFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const availableCategories = categories.filter(cat => cat.id !== 'all');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out rounded-l-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingItem ? 'Edit Menu Item' : 'Tambah Menu Baru'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="w-6 h-6 text-gray-400"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                        }}
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="Masukkan URL gambar"
                      value={formData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Masukkan URL gambar atau upload gambar
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama item"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-left flex items-center justify-between"
                  >
                    <span className="text-gray-900">
                      {formData.categoryId 
                        ? availableCategories.find(cat => cat.id === formData.categoryId)?.name || 'Pilih kategori'
                        : 'Pilih kategori'
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {availableCategories.map((category, index) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            handleInputChange('categoryId', category.id);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                            index === 0 ? 'rounded-t-lg' : ''
                          } ${
                            index === availableCategories.length - 1 ? 'rounded-b-lg' : ''
                          }`}
                        >
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={formData.stock || ''}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  placeholder="Masukkan deskripsi item"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              {/* Special Deal Toggle */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Promo Spesial</h4>
                  <p className="text-xs text-gray-500">Tandai item ini sebagai promo spesial</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSpecialDeal}
                    onChange={(e) => handleInputChange('isSpecialDeal', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim() || !formData.categoryId || formData.price <= 0 || isSaving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};