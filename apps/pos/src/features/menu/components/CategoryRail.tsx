import React from 'react';
import { Plus } from 'lucide-react';
import { Category } from '../types';

interface CategoryRailProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onAddCategory: () => void;
}

export const CategoryRail: React.FC<CategoryRailProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onAddCategory,
}) => {
  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Kategori</h2>
        <button
          onClick={onAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Kategori</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`
              flex-shrink-0 min-w-[140px] p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
              ${
                selectedCategory === category.id
                  ? 'bg-primary/10 dark:bg-primary/20 border-primary shadow-md'
                  : 'bg-card border-border hover:border-muted-foreground/30 hover:shadow-sm'
              }
            `}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className={`
                font-medium text-sm mb-1 truncate
                ${selectedCategory === category.id ? 'text-primary' : 'text-foreground'}
              `}>
                {category.name}
              </h3>
              <p className={`
                text-xs
                ${selectedCategory === category.id ? 'text-primary/80' : 'text-muted-foreground'}
              `}>
                {category.itemCount} item
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};