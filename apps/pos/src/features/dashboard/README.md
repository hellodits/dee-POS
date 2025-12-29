# Dashboard Feature

DEEPOS Dashboard dengan light theme dan red/yellow branding.

## 🎨 Design System

- **Theme**: Light Mode (White background)
- **Primary Color**: Red (#dc2626) - untuk buttons, active states
- **Secondary Color**: Yellow (#f59e0b) - untuk icons, highlights
- **Background**: White (#FFFFFF) dan Light Gray (#F9FAFB)

## 📊 Components

### StatsCard
- Menampilkan statistik dengan icon dan mini chart
- Icon menggunakan yellow background
- Chart bars menggunakan red color
- Data: Daily Sales, Monthly Revenue, Table Occupancy

### DishListItem
- Reusable component untuk popular dishes
- Support untuk serving info atau order count
- Status colors: Green (In Stock), Red (Out of Stock), Yellow (Low Stock)
- Placeholder image jika gambar gagal load

### OverviewChart
- Line chart menggunakan Recharts
- Red line untuk Sales, Gray line untuk Revenue
- Filter tabs: Monthly, Daily, Weekly (active menggunakan red)
- Export button dengan red background

### DashboardPage
- Main dashboard layout
- Header dengan notification bell dan user avatar
- Grid layout untuk stats cards
- Dua kolom popular dishes
- Full-width overview chart

## 📁 Structure

```
src/features/dashboard/
├── components/
│   ├── DashboardPage.tsx      # Main dashboard
│   ├── StatsCard.tsx          # Stats dengan mini chart
│   ├── DishListItem.tsx       # Item dish dengan status
│   └── OverviewChart.tsx      # Chart dengan filter
├── hooks/
│   └── useDashboardData.ts    # Hook untuk data fetching
├── data/
│   └── mockData.ts            # Mock data untuk development
└── types/
    └── index.ts               # TypeScript interfaces
```

## 🔧 Features

- **Responsive Design**: Grid layout yang responsive
- **Interactive Charts**: Recharts dengan hover effects
- **Filter System**: Tab filters untuk chart
- **Status Indicators**: Color-coded status untuk dishes
- **Mock Data**: Realistic data untuk development
- **TypeScript**: Full type safety

## 🎯 Data Structure

### Stats Data
```typescript
{
  title: "Daily Sales",
  value: "$2k", 
  subtitle: "9 February 2024",
  icon: "dollar-sign",
  chartData: [20, 35, 25, 40, ...]
}
```

### Dish Data
```typescript
{
  id: "1",
  name: "Chicken Parmesan",
  image: "/api/placeholder/60/60",
  serving: "Serving: 01 person",
  status: "In Stock",
  price: "$55.00"
}
```

### Chart Data
```typescript
{
  month: "JAN",
  sales: 3000,
  revenue: 2400
}
```

## 🚀 Usage

```tsx
import { DashboardPage } from '@/features/dashboard'

// Dalam DashboardLayout
<Route path="/" element={<DashboardPage />} />
```

## 📱 Responsive

- Desktop: 3 kolom stats, 2 kolom dishes
- Tablet: 2-3 kolom stats, 1-2 kolom dishes  
- Mobile: 1 kolom semua

## 🎨 Colors Used

- **Red Primary**: `bg-red-600`, `text-red-600`
- **Yellow Secondary**: `bg-yellow-100`, `text-yellow-600`
- **Gray Backgrounds**: `bg-gray-50`, `bg-gray-100`
- **Text**: `text-gray-900`, `text-gray-600`

Ready untuk production! 🚀