# Responsive Design Implementation

DEEPOS dengan full responsive design untuk Mobile, Tablet, dan Desktop.

## 📱 Breakpoint Strategy

### Tailwind CSS Breakpoints
- **Mobile**: `< 768px` (sm and below)
- **Tablet**: `768px - 1023px` (md)
- **Desktop**: `≥ 1024px` (lg and above)

### Responsive Behavior
```tsx
// Auto-detection dan responsive state
const [isMobile, setIsMobile] = useState(false)
const [isTablet, setIsTablet] = useState(false)

useEffect(() => {
  const checkScreenSize = () => {
    const width = window.innerWidth
    setIsMobile(width < 768)
    setIsTablet(width >= 768 && width < 1024)
    
    // Auto-collapse sidebar on tablet
    if (width >= 768 && width < 1024) {
      setIsSidebarCollapsed(true)
    }
  }
}, [])
```

## 🎯 Layout Strategies

### 1. Sidebar Behavior

#### Desktop (≥1024px)
- **Default**: Visible dan expandable
- **Width**: w-64 (expanded) ↔ w-20 (collapsed)
- **Toggle**: ChevronLeft/ChevronRight icons
- **Position**: Static sidebar

#### Tablet (768px-1023px)
- **Default**: Auto-collapsed (icon-only)
- **Width**: w-20 (collapsed) ↔ w-64 (expanded)
- **Toggle**: ChevronLeft/ChevronRight icons
- **Position**: Static sidebar

#### Mobile (<768px)
- **Default**: Completely hidden
- **Toggle**: Hamburger menu (☰) button
- **Behavior**: Slide-over drawer dengan backdrop
- **Position**: Fixed overlay (z-50)
- **Close**: X button atau backdrop click

### 2. Grid Systems

#### Stats Cards
```tsx
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

#### Popular Dishes
```tsx
// Responsive layout
<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
```
- **Mobile/Tablet**: 1 column (stacked)
- **Desktop**: 2 columns (side-by-side)

### 3. Touch Targets

#### CSS Utility
```css
.touch-target {
  @apply min-h-[44px] min-w-[44px] flex items-center justify-center;
}
```

#### Implementation
- **Minimum Size**: 44px x 44px (Apple HIG standard)
- **Usage**: Semua buttons dan clickable elements
- **Spacing**: Adequate spacing untuk fat fingers

## 🎨 Component Adaptations

### Header Component
```tsx
// Responsive header
<header className="bg-card border-b border-border px-4 sm:px-6 py-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      {/* Dynamic toggle button */}
      <button className="touch-target">
        {isMobile ? <Menu /> : (isCollapsed ? <ChevronRight /> : <ChevronLeft />)}
      </button>
      
      {/* Responsive title */}
      <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">
        {title}
      </h1>
    </div>
    
    {/* Responsive user section */}
    <div className="flex items-center space-x-2 sm:space-x-4">
      <button className="touch-target">
        <Bell className="w-5 h-5" />
      </button>
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-full">
        <User className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    </div>
  </div>
</header>
```

### Sidebar Component
```tsx
// Mobile drawer classes
const sidebarClasses = `
  ${isMobile 
    ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : `${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`
  } 
  bg-card border-r border-border flex flex-col
`
```

### Chart Component
```tsx
// Responsive chart
<div className="h-64 sm:h-80">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
      <XAxis tick={{ fontSize: 10 }} className="text-xs" />
      <YAxis tick={{ fontSize: 10 }} className="text-xs" />
      <Line strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
    </LineChart>
  </ResponsiveContainer>
</div>
```

## 📊 Data Tables (Future Implementation)

### Option A: Horizontal Scroll
```tsx
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

### Option B: Card View (Recommended)
```tsx
{/* Desktop: Table view */}
<table className="hidden md:table">
  <thead className="hidden md:table-header-group">
    {/* Headers */}
  </thead>
  <tbody>
    {/* Rows */}
  </tbody>
</table>

{/* Mobile: Card view */}
<div className="md:hidden space-y-4">
  {data.map(item => (
    <div key={item.id} className="bg-card p-4 rounded-lg border">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">{item.name}</span>
          <span className="text-primary">{item.price}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {item.description}
        </div>
      </div>
    </div>
  ))}
</div>
```

## 🎯 Responsive Patterns

### 1. Spacing
```tsx
// Responsive padding/margin
className="p-4 sm:p-6"           // 16px → 24px
className="space-y-4 sm:space-y-6" // 16px → 24px gap
className="gap-4 sm:gap-6"       // Grid gaps
```

### 2. Typography
```tsx
// Responsive text sizes
className="text-xl sm:text-2xl"  // 20px → 24px
className="text-xs sm:text-sm"   // 12px → 14px
className="text-base sm:text-lg" // 16px → 18px
```

### 3. Layout
```tsx
// Responsive flex direction
className="flex flex-col sm:flex-row"

// Responsive grid columns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Responsive visibility
className="hidden sm:block"      // Hide on mobile
className="sm:hidden"            // Hide on tablet+
```

## 🚀 Implementation Checklist

### ✅ Completed Features
- ✅ **Responsive Sidebar**: Mobile drawer, tablet collapsed, desktop full
- ✅ **Touch Targets**: 44px minimum size untuk mobile
- ✅ **Responsive Grids**: Dynamic columns berdasarkan screen size
- ✅ **Mobile Navigation**: Hamburger menu dengan backdrop
- ✅ **Responsive Typography**: Scalable text sizes
- ✅ **Responsive Spacing**: Adaptive padding dan margins
- ✅ **Chart Responsiveness**: Smaller margins dan font sizes
- ✅ **Button Adaptations**: Touch-friendly sizes

### 🔄 Future Enhancements
- 📋 **Data Tables**: Card view untuk mobile
- 🎨 **Modal Dialogs**: Full-screen pada mobile
- 📱 **Swipe Gestures**: Sidebar swipe to open/close
- 🔍 **Search Interface**: Collapsible search pada mobile
- 📊 **Advanced Charts**: Mobile-optimized interactions

## 📱 Testing Guidelines

### Mobile Testing (< 768px)
1. **Sidebar**: Hidden by default, hamburger menu works
2. **Navigation**: Drawer slides in dengan backdrop
3. **Touch Targets**: All buttons easy to tap
4. **Content**: Single column layout
5. **Charts**: Readable dengan smaller fonts

### Tablet Testing (768px-1023px)
1. **Sidebar**: Auto-collapsed but visible
2. **Grid**: 2-column layouts where appropriate
3. **Navigation**: Toggle works smoothly
4. **Content**: Balanced layout

### Desktop Testing (≥1024px)
1. **Sidebar**: Full collapsible functionality
2. **Grid**: Full 3+ column layouts
3. **Navigation**: Hover states work
4. **Content**: Optimal use of space

## 🎨 Design Consistency

### Maintained Elements
- ✅ **Red/Yellow Branding**: Primary colors preserved
- ✅ **Light/Dark Themes**: Full theme support
- ✅ **Typography Scale**: Consistent font hierarchy
- ✅ **Component Styling**: Shadcn/UI components
- ✅ **Animation**: Smooth transitions across devices

Ready untuk production di semua device! 📱💻🖥️