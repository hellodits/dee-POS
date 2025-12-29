# Reports & Analytics Demo

## Feature Overview
The Reports & Analytics feature provides comprehensive business intelligence for DEEPOS with interactive charts, detailed tables, and export capabilities.

## Demo Scenarios

### 1. Revenue Report Analysis
**Scenario**: Analyze restaurant financial performance

**Steps**:
1. Navigate to Reports from sidebar
2. Default view shows Revenue Report tab (active red styling)
3. View donut chart showing revenue breakdown by status
4. Examine area chart showing monthly trends
5. Toggle filter buttons to hide/show data series
6. Review detailed revenue table with top-selling items
7. Check summary cards for key metrics

**Key Features**:
- Interactive donut chart with center total ($25,840)
- Filterable area chart (Confirmed, Awaited, Cancelled)
- Revenue table with profit margins and totals
- Growth indicators and trend analysis

### 2. Reservation Report Insights
**Scenario**: Monitor booking patterns and customer behavior

**Steps**:
1. Click "Reservation Report" tab
2. View reservation summary in donut chart (1,984 total)
3. Analyze monthly booking trends in area chart
4. Filter by reservation status using toggle buttons
5. Review reservation details table with customer info
6. Export report for external analysis

**Key Features**:
- Booking status breakdown with color coding
- Customer information and billing details
- Check-in/check-out time tracking
- Monthly reservation volume trends

### 3. Staff Performance Monitoring
**Scenario**: Evaluate employee productivity and scheduling

**Steps**:
1. Switch to "Staff Report" tab
2. View staff summary (15 total staff members)
3. Analyze active vs. leave status in charts
4. Toggle between Active and On Leave data series
5. Review staff performance table with metrics
6. Check individual sales and hours worked

**Key Features**:
- Staff status visualization (Active/Leave)
- Performance metrics (orders, hours, sales)
- Role-based analysis (Manager, Chef, Cashier, Waitress)
- Status badges with color coding

### 4. Date Range & Export Functions
**Scenario**: Generate custom reports for specific periods

**Steps**:
1. Select custom start and end dates
2. Click "Generate Report" button (shows loading state)
3. View updated data for selected period
4. Click "Export" button for download options
5. Choose export format (PDF, Excel, CSV)

**Key Features**:
- Calendar date pickers with icons
- Loading states during generation
- Multiple export format options
- Custom date range filtering

## Interactive Elements

### Chart Interactions
- **Donut Chart**: Hover for detailed values, center total display
- **Area Chart**: Toggle data series, smooth hover tooltips
- **Filter Buttons**: Color-coded active/inactive states
- **Responsive**: Proper scaling on all screen sizes

### Table Features
- **Dynamic Columns**: Different structure per report type
- **Status Badges**: Green (Active), Yellow (Leave), Red (Cancelled)
- **Currency Formatting**: Proper $ symbols and decimal places
- **Hover Effects**: Row highlighting for better UX

### Summary Cards
- **Growth Indicators**: Green arrows with percentage changes
- **Icon Representations**: Emojis for visual appeal
- **Metric Variations**: Different values per report type
- **Responsive Grid**: 1-3 columns based on screen size

## Data Highlights

### Revenue Report
- **Top Seller**: Margherita Pizza ($519.80 revenue)
- **Best Margin**: Vegetable Stir Fry (70.6%)
- **Total Revenue**: $25,840 across all periods
- **Growth Rate**: +15.3% month-over-month

### Reservation Report
- **Peak Month**: July (209 reservations)
- **Average Bill**: $125.50 per reservation
- **Confirmation Rate**: 68.3% (1,355/1,984)
- **Customer Retention**: Strong repeat booking patterns

### Staff Report
- **Most Productive**: David Wilson (428 orders, $15,678 sales)
- **Average Hours**: 168 hours per staff member
- **Active Rate**: 87% staff currently active
- **Top Performer**: Alice Johnson (Manager, $12,450 sales)

## UI/UX Highlights

### Light Mode Design
- Clean white cards on light gray background
- Red primary colors for active states and CTAs
- Proper contrast ratios for accessibility
- Subtle shadows and rounded corners

### Responsive Behavior
- **Desktop**: Full layout with side-by-side charts
- **Tablet**: Stacked layout with proper spacing
- **Mobile**: Horizontal scroll tables, compact tabs
- **Touch**: Proper target sizes for mobile interaction

### Loading & Feedback
- Loading spinners during report generation
- Success messages for export operations
- Hover states on interactive elements
- Proper disabled states for buttons

## Navigation Flow
```
Reports & Analytics
├── Revenue Report
│   ├── Summary Donut Chart
│   ├── Trend Area Chart
│   └── Revenue Details Table
├── Reservation Report
│   ├── Booking Summary Chart
│   ├── Monthly Trends Chart
│   └── Reservation Details Table
└── Staff Report
    ├── Staff Status Chart
    ├── Performance Trends Chart
    └── Staff Performance Table
```