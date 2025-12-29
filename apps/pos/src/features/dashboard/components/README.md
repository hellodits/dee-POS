# Dashboard Components

Komponen-komponen untuk DEEPOS Dashboard dengan fitur Collapsible Sidebar.

## 🎯 Components

### Sidebar.tsx
Sidebar yang dapat dilipat dengan animasi smooth.

**Features:**
- ✅ **Collapsible**: Dapat dilipat dari w-64 ke w-20
- ✅ **Smooth Animation**: transition-all duration-300
- ✅ **Icon Only Mode**: Saat collapsed, hanya tampil icon
- ✅ **Mini Logo**: Logo "D" saat collapsed
- ✅ **Tooltips**: Tooltip untuk menu saat collapsed
- ✅ **Theme & Language**: Switchers yang responsive

**Props:**
```tsx
interface SidebarProps {
  isCollapsed: boolean
}
```

**States:**
- **Expanded** (w-64): Full menu dengan text dan icons
- **Collapsed** (w-20): Icon-only dengan tooltips

### Header.tsx
Header dengan toggle button untuk sidebar.

**Features:**
- ✅ **Toggle Button**: ChevronLeft/ChevronRight icons
- ✅ **Dynamic Icon**: Berubah sesuai state sidebar
- ✅ **Page Title**: Menampilkan judul halaman
- ✅ **User Actions**: Notification bell dan user avatar
- ✅ **Tooltips**: Expand/Collapse tooltips

**Props:**
```tsx
interface HeaderProps {
  title: string
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}
```

### DashboardPage.tsx
Main dashboard page dengan header terintegrasi.

**Features:**
- ✅ **Integrated Header**: Menggunakan Header component
- ✅ **Responsive Layout**: Menyesuaikan dengan sidebar state
- ✅ **Props Passing**: Menerima sidebar state dan toggle function

**Props:**
```tsx
interface DashboardPageProps {
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}
```

## 🏗️ Architecture

### State Management
```tsx
// DashboardLayout.tsx
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

const toggleSidebar = () => {
  setIsSidebarCollapsed(prev => !prev)
}
```

### Component Hierarchy
```
DashboardLayout
├── Sidebar (isCollapsed)
└── Routes
    └── DashboardPage (isSidebarCollapsed, onToggleSidebar)
        └── Header (title, isSidebarCollapsed, onToggleSidebar)
```

## 🎨 UI States

### Sidebar Expanded (Default)
- **Width**: w-64 (256px)
- **Logo**: "DEEPOS" text
- **Menu**: Icons + text labels
- **Switchers**: Horizontal layout (theme | language)

### Sidebar Collapsed
- **Width**: w-20 (80px)
- **Logo**: "D" dalam circle
- **Menu**: Icons only dengan tooltips
- **Switchers**: Vertical layout (stacked)

### Header Icons
- **Expanded**: ChevronLeft (<) - "Collapse sidebar"
- **Collapsed**: ChevronRight (>) - "Expand sidebar"

## 🔧 Implementation

### Toggle Animation
```css
.sidebar {
  @apply transition-all duration-300 ease-in-out;
}
```

### Responsive Menu Items
```tsx
<a className={`flex items-center ${
  isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-3 py-2.5'
} rounded-lg transition-colors`}>
  <IconComponent className="w-5 h-5 flex-shrink-0" />
  {!isCollapsed && <span>{item.label}</span>}
</a>
```

### Conditional Logo
```tsx
{isCollapsed ? (
  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
    <span className="text-primary-foreground font-bold text-sm">D</span>
  </div>
) : (
  <h2 className="text-xl font-bold text-primary">DEEPOS</h2>
)}
```

## 🌍 Internationalization

### Translation Keys
```json
{
  "common": {
    "expand": "Expand sidebar",
    "collapse": "Collapse sidebar"
  }
}
```

### Usage
```tsx
title={isCollapsed ? t('common.expand') : t('common.collapse')}
```

## 📱 Responsive Behavior

### Desktop
- Sidebar dapat di-toggle dengan smooth animation
- Header toggle button selalu visible
- Tooltips muncul saat hover pada collapsed state

### Mobile (Future Enhancement)
- Sidebar bisa menjadi overlay
- Auto-collapse pada screen kecil
- Swipe gesture support

## 🎯 User Experience

### Visual Feedback
- ✅ Smooth 300ms transition
- ✅ Icon rotation (< ↔ >)
- ✅ Tooltips untuk guidance
- ✅ Hover states yang consistent

### Accessibility
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management

## 🚀 Usage Example

```tsx
// DashboardLayout.tsx
import { Sidebar } from '@/features/dashboard/components/Sidebar'
import { DashboardPage } from '@/features/dashboard/components/DashboardPage'

function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev)
  }

  return (
    <div className="flex">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <DashboardPage 
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  )
}
```

Ready untuk production! 🚀