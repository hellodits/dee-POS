# Inventory Management Feature

Fitur Inventory Management untuk DEEPOS dengan desain Light Mode dan split layout yang responsif.

## Struktur Komponen

### 1. InventoryPage.tsx (Container Utama)
- **Desktop Layout**: Split layout dengan filter sidebar (300px) dan list area (flex-1)
- **Mobile Layout**: Filter tersembunyi, dapat diakses melalui tombol Filter
- **Responsive**: Auto-hide filter pada layar mobile, tampilkan sebagai modal
- **Header**: Tombol toggle sidebar, judul, dan tombol filter mobile

### 2. InventoryFilters.tsx (Panel Filter)
- **Status Tabs**: All, Active, Inactive, Draft dengan counter
- **Dropdowns**: Category, Stock Status, Value range
- **Price Range**: Min/Max input untuk filter harga
- **Reset Button**: Tombol reset filter dengan outline red styling
- **Responsive**: Fixed width 300px di desktop, full modal di mobile

### 3. InventoryList.tsx & InventoryItem.tsx (Daftar Barang)
- **Header**: Judul, total count, search bar, dan tombol Add New
- **Search**: Real-time search dengan icon
- **Item Cards**: Layout horizontal dengan thumbnail, info, dan actions
- **Empty State**: Pesan dan tombol Add New saat tidak ada data

### 4. InventoryItem.tsx (Single Item Component)
- **Layout**: Thumbnail (64x64) + Content + Actions
- **Stock Status**: Warna merah untuk low/out of stock, hijau untuk in stock
- **Status Badge**: Active (hijau), Inactive (abu), Draft (kuning)
- **Actions**: Edit dan Delete buttons dengan hover effects

### 5. InventoryForm.tsx (Form Drawer)
- **Slide-over**: Right-side drawer dengan rounded left border
- **Navigation**: Back arrow button (bukan X)
- **Fields**: Image URL, Name, Category, Quantity, Stock Status, Status, Price, Perishable
- **Validation**: Required fields dan form validation
- **Dropdowns**: Custom dropdowns dengan proper z-index

## Branding & Styling

### Color Scheme (Light Mode)
- **Background Page**: Abu-abu sangat terang (`bg-gray-50`)
- **Background Cards**: Putih bersih (`bg-white`) dengan border tipis
- **Primary Color**: Merah (`bg-red-600`) untuk tombol utama dan state aktif
- **Secondary**: Teks gelap (`text-gray-900`) dan label abu (`text-gray-500`)
- **Status Colors**: 
  - Stock OK: Hijau (`text-green-600`)
  - Low/Out Stock: Merah (`text-red-600`)
  - Active: Hijau (`bg-green-100 text-green-800`)
  - Inactive: Abu (`bg-gray-100 text-gray-800`)
  - Draft: Kuning (`bg-yellow-100 text-yellow-800`)

### Responsive Design
- **Desktop (≥768px)**: Split layout dengan filter sidebar visible
- **Mobile (<768px)**: Filter tersembunyi, akses via tombol Filter
- **Touch Targets**: Minimum 44px untuk accessibility
- **Smooth Transitions**: Hover effects dan modal animations

## State Management

### Custom Hook (useInventoryData)
- **Data**: Filtered items, all items, filters, statistics
- **Actions**: addItem, updateItem, deleteItem, updateFilters, resetFilters
- **Filtering**: Real-time filtering berdasarkan multiple criteria
- **Statistics**: Total, active, inactive, draft, low stock, out of stock counts

### Local State
- `isFormOpen`: Status drawer form
- `editingItem`: Item yang sedang diedit
- `isMobileFiltersOpen`: Status modal filter di mobile

## Data Structure

### InventoryItem Interface
```typescript
interface InventoryItem {
  id: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  stockStatus: 'instock' | 'lowstock' | 'outofstock';
  status: 'active' | 'inactive' | 'draft';
  price: number;
  perishable: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Filters Interface
```typescript
interface InventoryFilters {
  status: 'all' | 'active' | 'inactive' | 'draft';
  category: string;
  stockStatus: string;
  value: string;
  priceMin: number;
  priceMax: number;
  search: string;
}
```

## Features

### Filtering & Search
- ✅ Status filter (All, Active, Inactive, Draft)
- ✅ Category dropdown filter
- ✅ Stock status filter (In Stock, Low Stock, Out of Stock)
- ✅ Value range filter (Low, Medium, High)
- ✅ Price range filter (Min/Max)
- ✅ Real-time search by name and category
- ✅ Reset all filters functionality

### CRUD Operations
- ✅ Add new inventory item
- ✅ Edit existing item
- ✅ Delete item (dengan konfirmasi)
- ✅ Form validation
- ✅ Auto-save dengan timestamp

### Responsive Features
- ✅ Desktop split layout
- ✅ Mobile filter modal
- ✅ Touch-friendly interface
- ✅ Responsive cards dan buttons

## Mock Data
File `inventoryData.ts` berisi 22 item dummy dengan:
- Berbagai kategori (Chicken, Beef, Seafood, Vegetables, Dairy, Beverages, Spices)
- Status yang bervariasi (Active, Inactive, Draft)
- Stock levels yang realistis (In Stock, Low Stock, Out of Stock)
- Harga yang beragam untuk testing filter
- Mix perishable dan non-perishable items

## Usage

```tsx
import { InventoryPage } from '@/features/inventory';

function App() {
  return (
    <InventoryPage 
      isSidebarCollapsed={false}
      isMobile={false}
      onToggleSidebar={() => {}}
    />
  );
}
```

## Integration Notes
- Terintegrasi dengan DashboardLayout
- Menggunakan design system yang konsisten dengan fitur lain
- Props interface yang sama dengan StaffPage dan MenuPage
- Responsive behavior yang konsisten

## Future Enhancements
- [ ] Bulk operations (select multiple items)
- [ ] Export/Import functionality
- [ ] Advanced sorting options
- [ ] Stock alerts dan notifications
- [ ] Barcode scanning integration
- [ ] Supplier management
- [ ] Stock movement history
- [ ] Integration dengan POS system