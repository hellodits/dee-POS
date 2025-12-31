import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Upload, ChevronDown, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { InventoryItem, InventoryFormData, INVENTORY_CATEGORIES, INVENTORY_UNITS } from '../types';

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InventoryFormData) => Promise<void>;
  editingItem?: InventoryItem | null;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    description: '',
    category: 'Protein',
    unit: 'kg',
    current_stock: 0,
    min_stock: 0,
    max_stock: undefined,
    cost_per_unit: 0,
    supplier: '',
    supplier_contact: '',
    expiry_date: '',
    is_perishable: false,
    storage_location: '',
    image_url: '',
    imageFile: null,
  });

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when drawer opens/closes or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setFormData({
          name: editingItem.name,
          description: '',
          category: editingItem.category,
          unit: editingItem.unit || 'kg',
          current_stock: editingItem.quantity,
          min_stock: editingItem.minStock || 0,
          max_stock: editingItem.maxStock,
          cost_per_unit: editingItem.price,
          supplier: editingItem.supplier || '',
          supplier_contact: editingItem.supplierContact || '',
          expiry_date: editingItem.expiryDate || '',
          is_perishable: editingItem.perishable,
          storage_location: editingItem.storageLocation || '',
          image_url: editingItem.image || '',
          imageFile: null,
        });
        setImagePreview(editingItem.image || null);
      } else {
        setFormData({
          name: '',
          description: '',
          category: 'Protein',
          unit: 'kg',
          current_stock: 0,
          min_stock: 0,
          max_stock: undefined,
          cost_per_unit: 0,
          supplier: '',
          supplier_contact: '',
          expiry_date: '',
          is_perishable: false,
          storage_location: '',
          image_url: '',
          imageFile: null,
        });
        setImagePreview(null);
      }
    }
  }, [isOpen, editingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof InventoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for upload
    handleInputChange('imageFile', file);
    handleInputChange('image_url', '');
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImagePreview(null);
    handleInputChange('imageFile', null);
    handleInputChange('image_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out rounded-l-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingItem ? 'Edit Bahan Mentah' : 'Tambah Bahan Mentah'}
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
                  Gambar Bahan
                </label>
                
                {/* Image Preview or Upload Area */}
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                      {formData.imageFile ? formData.imageFile.name : 'Gambar saat ini'}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragging 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Klik atau drag & drop gambar
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP (Maks. 5MB)
                    </p>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Change image button when preview exists */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Ganti Gambar
                  </button>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Bahan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Daging Sapi, Bawang Merah, Tepung Terigu"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi bahan mentah (opsional)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>

              {/* Category and Unit Row */}
              <div className="grid grid-cols-2 gap-4">
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
                      <span className="text-gray-900">{formData.category}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isCategoryDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {INVENTORY_CATEGORIES.map((category, index) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              handleInputChange('category', category);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 ${
                              index === 0 ? 'rounded-t-lg' : ''
                            } ${
                              index === INVENTORY_CATEGORIES.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-left flex items-center justify-between"
                    >
                      <span className="text-gray-900">{formData.unit}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUnitDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isUnitDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {INVENTORY_UNITS.map((unit, index) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => {
                              handleInputChange('unit', unit);
                              setIsUnitDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 ${
                              index === 0 ? 'rounded-t-lg' : ''
                            } ${
                              index === INVENTORY_UNITS.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Awal *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.current_stock || ''}
                    onChange={(e) => handleInputChange('current_stock', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Min *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.min_stock || ''}
                    onChange={(e) => handleInputChange('min_stock', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Max
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Opsional"
                    value={formData.max_stock || ''}
                    onChange={(e) => handleInputChange('max_stock', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Cost per Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga per {formData.unit} (IDR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  placeholder="0"
                  value={formData.cost_per_unit || ''}
                  onChange={(e) => handleInputChange('cost_per_unit', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Supplier Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="Nama supplier"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kontak Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="No. telp / email"
                    value={formData.supplier_contact}
                    onChange={(e) => handleInputChange('supplier_contact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Expiry Date and Storage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Kadaluarsa
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi Penyimpanan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kulkas, Freezer, Gudang"
                    value={formData.storage_location}
                    onChange={(e) => handleInputChange('storage_location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Perishable Toggle */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Bahan Mudah Rusak</h4>
                  <p className="text-xs text-gray-500">Apakah bahan ini mudah rusak/kadaluarsa?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_perishable}
                    onChange={(e) => handleInputChange('is_perishable', e.target.checked)}
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
                  disabled={!formData.name.trim() || !formData.category || formData.cost_per_unit <= 0 || isSaving}
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
