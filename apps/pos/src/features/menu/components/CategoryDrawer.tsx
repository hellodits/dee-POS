import React, { useState, useEffect } from 'react';
import { ChevronRight, Upload, ChevronDown } from 'lucide-react';
import { Category, CategoryFormData } from '../types';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  categories: Category[];
  editingCategory?: Category | null;
}

export const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingCategory,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: '',
    parentId: '',
    description: '',
  });
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

  // Reset form when drawer opens/closes or editing category changes
  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setFormData({
          name: editingCategory.name,
          icon: editingCategory.icon,
          parentId: editingCategory.parentId || '',
          description: editingCategory.description || '',
        });
      } else {
        setFormData({
          name: '',
          icon: '',
          parentId: '',
          description: '',
        });
      }
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parentCategories = categories.filter(cat => cat.id !== 'all' && cat.id !== editingCategory?.id);

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
              {editingCategory ? 'Edit Category' : 'Add New Category'}
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
              {/* Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Icon
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {formData.icon ? (
                      <span className="text-2xl">{formData.icon}</span>
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter emoji or icon (e.g., 🍕)"
                      value={formData.icon}
                      onChange={(e) => handleInputChange('icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use emoji or upload an icon
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Parent Menu Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Menu
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-left flex items-center justify-between"
                  >
                    <span className="text-gray-900">
                      {formData.parentId 
                        ? parentCategories.find(cat => cat.id === formData.parentId)?.name || 'Select parent category'
                        : 'Select parent category'
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isParentDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isParentDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('parentId', '');
                          setIsParentDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-500 first:rounded-t-lg"
                      >
                        None (Top Level)
                      </button>
                      {parentCategories.map((category, index) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            handleInputChange('parentId', category.id);
                            setIsParentDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                            index === parentCategories.length - 1 ? 'rounded-b-lg' : ''
                          }`}
                        >
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Select a parent category to create a subcategory
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Brief description of this category
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};