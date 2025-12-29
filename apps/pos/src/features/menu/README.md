# Menu Management Feature

Fitur Menu Management untuk DEEPOS dengan desain Light Mode dan branding merah-kuning.

## Struktur Komponen

### 1. MenuPage.tsx (Container Utama)
- Mengatur state untuk categories dan menu items
- Mengelola drawer visibility dan editing state
- Mengintegrasikan semua komponen child

### 2. CategoryRail.tsx (Bagian Atas)
- Menampilkan daftar kategori dalam bentuk kartu horizontal
- Scrollable pada mobile dengan `overflow-x-auto`
- Kategori aktif menggunakan warna merah (`bg-red-50`, `border-red-600`)
- Tombol "Add New Category" di pojok kanan

### 3. MenuTable.tsx (Bagian Bawah)
- Menampilkan daftar makanan berdasarkan kategori yang dipilih
- Tab filter: Normal Menu dan Special Deals
- Responsive: Desktop menggunakan table, Mobile menggunakan card list
- Tombol "Add Menu Item" sejajar dengan tab filter

### 4. CategoryDrawer.tsx (Form Input Kategori)
- Slide-over panel dari kanan
- Fields: Icon Upload, Category Name, Parent Menu, Description
- Validasi form dan error handling

### 5. MenuItemDrawer.tsx (Form Input Item)
- Slide-over panel dari kanan untuk menu items
- Fields: Image, Name, Price, Stock, Category selection, Description, Special Deal toggle
- Auto-calculate status berdasarkan stock

## Branding & Styling

### Color Scheme (Light Mode)
- **Background:** Putih/Abu-abu terang (`bg-white`, `bg-gray-50`)
- **Primary Action:** Merah (`bg-red-600`, `hover:bg-red-700`)
- **Active State:** Merah (`bg-red-50`, `border-red-600`, `text-red-700`)
- **Secondary/Icons:** Kuning/Amber (`text-amber-600`, `bg-amber-50`)
- **Text:** Dark Gray (`text-gray-900`, `text-gray-600`)

### Responsive Design
- **Desktop:** Full table layout dengan semua kolom
- **Mobile:** Card-based layout dengan informasi yang dioptimalkan
- **CategoryRail:** Horizontal scroll pada mobile

## State Management

### Local State (useState)
- `selectedCategory`: Kategori yang sedang aktif
- `categories`: Array kategori
- `menuItems`: Array menu items
- `activeDrawer`: Drawer mana yang sedang terbuka
- `editingCategory`: Kategori yang sedang diedit
- `editingMenuItem`: Menu item yang sedang diedit

## Data Structure

### Category
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
  parentId?: string;
  description?: string;
}
```

### MenuItem
```typescript
interface MenuItem {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  categoryId: string;
  status: 'in-stock' | 'out-of-stock';
  description?: string;
  isSpecialDeal?: boolean;
}
```

## Features

### Category Management
- ✅ Add new category
- ✅ Edit existing category
- ✅ Delete category (dengan konfirmasi)
- ✅ Parent-child category relationship
- ✅ Icon support (emoji/upload)

### Menu Item Management
- ✅ Add new menu item
- ✅ Edit existing menu item
- ✅ Delete menu item (dengan konfirmasi)
- ✅ Auto status calculation (in-stock/out-of-stock)
- ✅ Special deals marking
- ✅ Image support

### Filtering & Display
- ✅ Filter by category
- ✅ Filter by normal/special deals
- ✅ Responsive table/card layout
- ✅ Real-time item count per category

## Usage

```tsx
import { MenuPage } from '@/features/menu';

function App() {
  return <MenuPage />;
}
```

## Mock Data
File `menuData.ts` berisi data dummy untuk development dan testing dengan berbagai kategori dan menu items yang realistis.

## Styling Notes
- Menggunakan Tailwind CSS
- Konsisten dengan design system DEEPOS
- Hover states dan transitions untuk UX yang smooth
- Focus states untuk accessibility
- Loading states dan error handling (dapat ditambahkan)

## Future Enhancements
- [ ] Image upload functionality
- [ ] Bulk operations
- [ ] Search and advanced filtering
- [ ] Category reordering (drag & drop)
- [ ] Export/Import menu data
- [ ] Integration dengan backend API