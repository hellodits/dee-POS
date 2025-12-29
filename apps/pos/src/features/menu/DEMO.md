# Menu Management Demo

## Cara Menggunakan Fitur Menu Management

### 1. Akses Menu Management
- Buka aplikasi DEEPOS
- Klik menu "Menu" di sidebar
- Anda akan melihat halaman Menu Management dengan kategori dan item menu

### 2. Mengelola Kategori

#### Menambah Kategori Baru:
1. Klik tombol "Add New Category" di bagian atas
2. Isi form yang muncul:
   - **Icon**: Masukkan emoji (contoh: 🍕, 🥗, 🍰)
   - **Category Name**: Nama kategori (wajib)
   - **Parent Menu**: Pilih kategori induk (opsional)
   - **Description**: Deskripsi kategori (opsional)
3. Klik "Create Category"

#### Mengedit Kategori:
1. Klik pada kartu kategori yang ingin diedit
2. Form edit akan muncul dengan data yang sudah terisi
3. Ubah data yang diperlukan
4. Klik "Update Category"

### 3. Mengelola Menu Items

#### Filter Menu Items:
- **Normal Menu**: Menampilkan item menu biasa
- **Special Deals**: Menampilkan item dengan penawaran khusus
- Pilih kategori di bagian atas untuk memfilter berdasarkan kategori

#### Menambah Menu Item Baru:
1. Klik tombol "Add Menu Item"
2. Isi form yang muncul:
   - **Image**: URL gambar item
   - **Item Name**: Nama item (wajib)
   - **Category**: Pilih kategori (wajib)
   - **Price**: Harga dalam IDR (wajib)
   - **Stock**: Jumlah stok (wajib)
   - **Description**: Deskripsi item (opsional)
   - **Special Deal**: Toggle untuk menandai sebagai penawaran khusus
3. Klik "Create Item"

#### Mengedit Menu Item:
1. Klik icon edit (pensil) pada item yang ingin diedit
2. Form edit akan muncul dengan data yang sudah terisi
3. Ubah data yang diperlukan
4. Klik "Update Item"

#### Menghapus Menu Item:
1. Klik icon delete (tempat sampah) pada item yang ingin dihapus
2. Konfirmasi penghapusan
3. Item akan dihapus dan jumlah item di kategori akan diperbarui

### 4. Fitur Responsif

#### Desktop:
- Tampilan tabel lengkap dengan semua kolom
- Kategori ditampilkan dalam grid horizontal
- Drawer slide-over dari kanan untuk form

#### Mobile:
- Kategori dapat di-scroll horizontal
- Menu items ditampilkan dalam format card
- Form drawer menggunakan full width
- Tombol dan touch target dioptimalkan untuk mobile

### 5. Status dan Indikator

#### Status Stock:
- **In Stock** (hijau): Item tersedia (stock > 0)
- **Out of Stock** (merah): Item habis (stock = 0)

#### Special Deals:
- Item dengan toggle "Special Deal" akan muncul di filter "Special Deals"
- Ditandai dengan background amber pada toggle

#### Item Count:
- Setiap kategori menampilkan jumlah item
- Otomatis diperbarui saat menambah/menghapus item

### 6. Validasi Form

#### Kategori:
- Nama kategori wajib diisi
- Icon dan deskripsi opsional
- Parent category opsional (untuk subcategory)

#### Menu Item:
- Nama item wajib diisi
- Kategori wajib dipilih
- Harga harus lebih dari 0
- Stock harus angka (0 atau lebih)
- Image URL opsional
- Deskripsi opsional

### 7. Data Dummy

Aplikasi sudah dilengkapi dengan data dummy yang mencakup:
- 4 kategori utama: Appetizers, Main Course, Desserts, Beverages
- 24 menu items dengan berbagai status dan harga
- Beberapa item ditandai sebagai Special Deals
- Variasi stock (ada yang habis, ada yang tersedia)

### 8. Branding dan Styling

#### Color Scheme:
- **Primary Action**: Merah (`bg-red-600`)
- **Active State**: Merah muda (`bg-red-50`, `border-red-600`)
- **Secondary**: Amber/Kuning (`text-amber-600`)
- **Background**: Putih dan abu-abu terang
- **Text**: Dark gray untuk kontras yang baik

#### Responsive Design:
- Mobile-first approach
- Smooth transitions dan hover effects
- Consistent spacing dan typography
- Accessible touch targets (44px minimum)

### 9. Tips Penggunaan

1. **Organisasi Kategori**: Gunakan parent-child relationship untuk mengorganisir menu yang kompleks
2. **Gambar Item**: Gunakan URL gambar yang valid untuk tampilan yang optimal
3. **Harga**: Masukkan harga dalam format IDR (tanpa titik/koma)
4. **Stock Management**: Update stock secara berkala untuk akurasi status
5. **Special Deals**: Gunakan fitur ini untuk highlight item promosi

### 10. Pengembangan Selanjutnya

Fitur yang dapat ditambahkan:
- Upload gambar langsung (bukan hanya URL)
- Bulk operations (edit/delete multiple items)
- Search dan advanced filtering
- Drag & drop untuk reorder kategori
- Export/Import data menu
- Integration dengan sistem inventory
- Analytics dan reporting