# Reports & Analytics Feature

## Overview
Comprehensive reporting and analytics system for DEEPOS with Light Mode branding and interactive charts.

## Features

### Multi-Tab Reports
- **Revenue Report**: Financial performance analysis with top-selling items
- **Reservation Report**: Booking analytics and customer insights  
- **Staff Report**: Employee performance and productivity metrics

### Interactive Charts
- **Donut/Pie Charts**: Summary visualization with center totals
- **Area Charts**: Trend analysis with filterable data series
- **Dynamic Filtering**: Toggle chart series visibility
- **Custom Tooltips**: Detailed hover information

### Data Tables
- **Dynamic Columns**: Different table structure per report type
- **Responsive Design**: Horizontal scroll on mobile
- **Status Badges**: Color-coded status indicators
- **Pagination**: Navigation controls (placeholder)

### Export & Generation
- **Date Range Selection**: Custom reporting periods
- **Generate Reports**: Simulated API integration
- **Export Options**: PDF, Excel, CSV formats (placeholder)
- **Loading States**: User feedback during operations

## Components

### ReportsPage
- Main container with tab navigation and controls
- Date range picker with calendar icons
- Generate and export functionality
- Summary cards with growth metrics

### ReportCharts
- Recharts integration for data visualization
- Split layout: 1/3 donut chart, 2/3 area chart
- Filter buttons for toggling data series
- Responsive chart containers

### ReportTable
- Conditional rendering based on active tab
- Formatted currency, percentage, and status displays
- Hover effects and proper spacing
- Pagination controls

## Data Structure

### Report Types
- `RevenueData`: Sales performance metrics
- `ReservationData`: Booking and customer information
- `StaffData`: Employee performance statistics
- `ChartData`: Time-series data for visualizations

### Mock Data
- 8 entries per report type with realistic values
- 12 months of chart data for trend analysis
- Color-coded summary data for pie charts
- Proper data relationships and calculations

## Styling

### Light Mode Branding
- **Background**: Light gray (`bg-gray-50`)
- **Cards**: White with subtle shadows
- **Primary**: Red (`bg-red-600`) for active tabs and buttons
- **Chart Colors**: 
  - Success/Confirmed: Green (`#10B981`)
  - Pending/Awaited: Amber (`#F59E0B`)
  - Error/Cancelled: Red (`#EF4444`)
  - Info/Total: Blue/Purple variants

### Responsive Design
- Mobile-first approach with proper breakpoints
- Horizontal scroll for tables on small screens
- Collapsible tab labels on mobile
- Touch-friendly controls and spacing

## Chart Configuration

### Recharts Implementation
- `PieChart` with inner radius for donut effect
- `AreaChart` with stacked areas and smooth curves
- Custom tooltips with proper styling
- Responsive containers with proper aspect ratios

### Interactive Features
- Filter buttons to toggle data series
- Hover effects with detailed information
- Legend with color indicators and values
- Center value display in donut charts

## Usage

```tsx
import { ReportsPage } from '@/features/reports/components';

// In DashboardLayout
<Route path="/reports" element={
  <ReportsPage 
    isSidebarCollapsed={isSidebarCollapsed}
    isMobile={isMobile}
    onToggleSidebar={toggleSidebar}
  />
} />
```

## State Management

### useReports Hook
- Tab switching and date range management
- Report generation with loading states
- Export functionality with format options
- Summary calculations and data retrieval

## Integration
- Integrated with DashboardLayout routing
- Uses existing UI components and patterns
- Follows DEEPOS design system
- Ready for API integration with mock data structure