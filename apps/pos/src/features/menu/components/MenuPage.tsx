import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { CategoryRail } from './CategoryRail';
import { MenuTable } from './MenuTable';
import { CategoryDrawer } from './CategoryDrawer';
import { MenuItemDrawer } from './MenuItemDrawer';
import { useMenuData } from '../hooks/useMenuData';
import { Category, MenuItem, DrawerType, MenuItemFormData } from '../types';

interface MenuPageProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const { t } = useTranslation();
  
  // Custom hook for menu data management
  const {
    categories,
    menuItems,
    isLoading,
    error,
    refetch,
    addCategory,
    updateCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getItemsByCategory,
  } = useMenuData();

  // Local state for UI
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Category handlers
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setActiveDrawer('category');
  };

  const handleSaveCategory = (formData: any) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }
    setActiveDrawer(null);
    setEditingCategory(null);
  };

  // Local state for async operations
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Menu item handlers
  const handleAddMenuItem = () => {
    setEditingMenuItem(null);
    setActiveDrawer('menu-item');
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setActiveDrawer('menu-item');
  };

  const handleSaveMenuItem = async (formData: MenuItemFormData) => {
    setIsSaving(true);
    try {
      if (editingMenuItem) {
        await updateMenuItem(editingMenuItem.id, formData);
      } else {
        await addMenuItem(formData);
      }
      setActiveDrawer(null);
      setEditingMenuItem(null);
    } catch (err) {
      console.error('Failed to save menu item:', err);
      alert(t('menu.failedToSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (window.confirm(t('menu.confirmDelete'))) {
      setIsDeleting(itemId);
      try {
        await deleteMenuItem(itemId);
      } catch (err) {
        console.error('Failed to delete menu item:', err);
        alert(t('menu.failedToDelete'));
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Close drawer handler
  const handleCloseDrawer = () => {
    setActiveDrawer(null);
    setEditingCategory(null);
    setEditingMenuItem(null);
  };

  // Get filtered menu items
  const filteredMenuItems = getItemsByCategory(selectedCategory);

  return (
    <div className="flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{t('menu.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('menu.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{categories.length - 1} {t('common.categories')}</span>
            <span>•</span>
            <span>{menuItems.length} {t('common.items')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">{t('menu.loadingData')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-foreground font-medium mb-2">{error}</p>
              <button
                onClick={refetch}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('common.tryAgain')}
              </button>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <div className="space-y-6">
              {/* Category Rail */}
              <CategoryRail
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                onAddCategory={handleAddCategory}
              />

              {/* Menu Table */}
              <MenuTable
                menuItems={filteredMenuItems}
                selectedCategory={selectedCategory}
                onAddMenuItem={handleAddMenuItem}
                onEditMenuItem={handleEditMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                isDeleting={isDeleting}
              />
            </div>
          )}
        </div>
      </main>

      {/* Drawers */}
      <CategoryDrawer
        isOpen={activeDrawer === 'category'}
        onClose={handleCloseDrawer}
        onSave={handleSaveCategory}
        categories={categories}
        editingCategory={editingCategory}
      />

      <MenuItemDrawer
        isOpen={activeDrawer === 'menu-item'}
        onClose={handleCloseDrawer}
        onSave={handleSaveMenuItem}
        categories={categories}
        editingItem={editingMenuItem}
        isSaving={isSaving}
      />
    </div>
  );
};