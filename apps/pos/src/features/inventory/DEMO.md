# Inventory Management Demo

## Cara Menggunakan Fitur Inventory Management

### 1. Akses Inventory Management
- Buka aplikasi DEEPOS
- Klik menu "Inventory" di sidebar
- Anda akan melihat halaman Inventory Management dengan layout split (desktop) atau list dengan filter button (mobile)

### 2. Layout dan Navigation

#### Desktop Layout:
- **Kolom Kiri**: Panel filter (300px width) dengan berbagai opsi filtering
- **Kolom Kanan**: Daftar inventory items dengan header dan search
- **Header**: Tombol toggle sidebar, judul halaman

#### Mobile Layout:
- **Filter tersembunyi**: Panel filter tidak terlihat secara default
- **Tombol Filter**: Icon corong di header untuk membuka modal filter
- **Responsive**: Layout menyesuaikan dengan ukuran layar

### 3. Filtering dan Search

#### Status Tabs (Panel Filter):
- **All**: Menampilkan semua items (150 items)
- **Active**: Items yang aktif (120 items)
- **Inactive**: Items yang tidak aktif (20 items)
- **Draft**: Items dalam status draft (10 items)

#### Dropdown Filters:
- **Category**: Filter berdasarkan kategori (All, Chicken, Beef, Seafood, dll)
- **Stock**: Filter berdasarkan status stok (All, In Stock, Low Stock, Out of Stock)
- **Value**: Filter berdasarkan range nilai (All, Low <50k, Medium 50k-100k, High >100k)

#### Price Range:
- **Min/Max Input**: Masukkan range harga dalam IDR
- **Real-time Filter**: Filter langsung diterapkan saat input berubah

#### Search Bar:
- **Real-time Search**: Cari berdasarkan nama item atau kategori
- **Icon Search**: Visual indicator untuk fungsi search

#### Reset Filters:
- **Reset Button**: Tombol merah outline untuk reset semua filter
- **Icon Rotate**: Visual indicator untuk reset action

### 4. Mengelola Inventory Items

#### Menambah Item Baru:
1. Klik tombol "Add New Inventory" (merah) di header list
2. Form drawer akan slide dari kanan
3. Isi semua field yang diperlukan:
   - **Product Image**: URL gambar produk
   - **Name**: Nama produk (required)
   - **Category**: Pilih kategori dari dropdown (required)
   - **Quantity**: Jumlah stok (required)
   - **Stock Status**: In Stock/Low Stock/Out of Stock
   - **Status**: Active/Inactive/Draft
   - **Price**: Harga dalam IDR (required)
   - **Perishable**: Radio button Yes/No
4. Klik "Save Item" untuk menyimpan

#### Mengedit Item:
1. Klik icon Edit (pensil) pada item yang ingin diedit
2. Form drawer akan terbuka dengan data yang sudah terisi
3. Ubah data yang diperlukan
4. Klik "Update Item" untuk menyimpan perubahan

#### Menghapus Item:
1. Klik icon Delete (tempat sampah) pada item
2. Konfirmasi penghapusan pada dialog yang muncul
3. Item akan dihapus dari daftar

### 5. Memahami Status dan Indikator

#### Stock Status Colors:
- **Hijau**: Stock aman (quantity ≥ 10)
- **Merah**: Low stock (quantity < 10) atau Out of stock (quantity = 0)

#### Status Badges:
- **Active**: Badge hijau - item aktif dan tersedia
- **Inactive**: Badge abu-abu - item tidak aktif
- **Draft**: Badge kuning - item dalam tahap draft

#### Item Information:
- **Thumbnail**: Gambar produk (64x64px, rounded)
- **Name**: Nama produk dengan truncate jika terlalu panjang
- **Stock Info**: Jumlah stok dengan icon package
- **Category**: Kategori produk
- **Price**: Harga dalam format IDR
- **Actions**: Tombol Edit dan Delete

### 6. Responsive Behavior

#### Desktop (≥768px):
- Split layout dengan filter sidebar selalu terlihat
- Hover effects pada buttons dan cards
- Smooth transitions untuk semua interactions

#### Mobile (<768px):
- Filter panel tersembunyi secara default
- Tombol Filter di header untuk akses filter
- Modal overlay untuk filter panel
- Touch-friendly button sizes (44px minimum)
- Optimized card layout untuk mobile

### 7. Data dan Statistics

#### Mock Data Tersedia:
- **22 inventory items** dengan data realistis
- **7 kategori**: Chicken, Beef, Seafood, Vegetables, Dairy, Beverages, Spices
- **Variasi status**: Active, Inactive, Draft
- **Variasi stock**: In Stock, Low Stock, Out of Stock
- **Range harga**: 8,000 - 250,000 IDR
- **Mix perishable**: Ya dan Tidak

#### Statistics Display:
- **Total Count**: Ditampilkan di header list
- **Filter Counts**: Ditampilkan di status tabs
- **Real-time Update**: Counter berubah sesuai filter aktif

### 8. Form Validation

#### Required Fields:
- Name (tidak boleh kosong)
- Category (harus dipilih)
- Price (harus > 0)

#### Optional Fields:
- Image URL
- Quantity (default 0)
- Stock Status (default In Stock)
- Status (default Active)
- Perishable (default No)

#### Error Handling:
- Disable save button jika validation gagal
- Visual feedback untuk required fields
- Proper error states untuk form inputs

### 9. Tips Penggunaan

#### Efficient Filtering:
1. Gunakan status tabs untuk filter cepat berdasarkan status
2. Kombinasikan multiple filters untuk hasil yang spesifik
3. Gunakan search untuk mencari item tertentu dengan cepat
4. Reset filters saat ingin melihat semua data

#### Stock Management:
1. Monitor items dengan status Low Stock (warna merah)
2. Update quantity secara berkala
3. Gunakan status Inactive untuk items yang tidak dijual sementara
4. Gunakan Draft untuk items yang belum siap dipublikasi

#### Mobile Usage:
1. Gunakan tombol Filter untuk akses filtering di mobile
2. Swipe atau scroll untuk navigasi yang smooth
3. Tap area yang cukup besar untuk easy interaction

### 10. Integration dengan Fitur Lain

#### Konsistensi Design:
- Menggunakan color scheme yang sama dengan Menu dan Staff
- Layout pattern yang konsisten
- Responsive behavior yang seragam

#### Navigation:
- Terintegrasi dengan sidebar navigation
- Breadcrumb dan page title yang jelas
- Consistent header dengan toggle sidebar

Fitur Inventory Management siap digunakan dengan interface yang intuitif dan responsive untuk mengelola stok restaurant dengan efisien!