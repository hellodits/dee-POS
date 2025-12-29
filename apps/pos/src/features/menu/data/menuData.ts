// Menu filters - used for filtering menu items
export const menuFilters = [
  { type: 'normal' as const, label: 'Menu Normal' },
  { type: 'special-deals' as const, label: 'Promo Spesial' },
];

// Category icons mapping - used when building categories from API
export const categoryIcons: Record<string, string> = {
  'Makanan': '🍽️',
  'Minuman': '🥤',
  'Snack': '🍿',
  'Dessert': '🍰',
  'default': '📦'
};
