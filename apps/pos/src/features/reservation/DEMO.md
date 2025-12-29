# Reservation Management Demo

## 🎯 Feature Overview
Complete reservation management system for DEEPOS restaurant with responsive design and Light Mode branding.

## 🚀 Key Features Implemented

### ✅ Responsive Design
- **Desktop (≥1024px)**: Grid scheduler with time slots and table layout
- **Mobile/Tablet (<1024px)**: Card-based list view for better touch interaction
- **Auto-switching**: Automatically switches to list view on smaller screens

### ✅ Floor Management
- **1st Floor & 2nd Floor** tabs with separate table management
- **8 tables per floor** with different capacities (2-8 seats)
- **Real-time statistics** showing reservation counts per floor

### ✅ Scheduler Grid (Desktop)
- **Time slots**: 10:00 AM - 10:00 PM (30-minute intervals)
- **Visual blocks**: Color-coded reservation blocks with customer info
- **Horizontal scrolling**: Navigate through time slots easily
- **Click interactions**: Click reservations to view details

### ✅ List View (Mobile)
- **Card layout**: Clean reservation cards with key information
- **Status badges**: Color-coded status indicators
- **Touch-friendly**: Optimized for mobile interactions
- **Edit functionality**: Quick edit access from list items

### ✅ Comprehensive Form
- **Table selection**: Dropdown with availability checking
- **Customer details**: Name, phone, email capture
- **Time management**: Start/end time with conflict detection
- **Payment methods**: Cash, Card, Bank Transfer options
- **Special requests**: Textarea for additional notes

### ✅ Availability System
- **Real-time checking**: Prevents double bookings
- **Visual feedback**: Shows availability errors immediately
- **Smart suggestions**: Highlights available tables
- **Conflict resolution**: Clear error messages for time conflicts

### ✅ Detail View
- **Hero section**: Beautiful header with reservation overview
- **Information cards**: Organized sections for different data types
- **Action buttons**: Cancel reservation and change table options
- **Status management**: Update reservation status easily

## 🎨 Light Mode Branding

### Color Scheme
- **Primary**: Red (`bg-red-600`, `text-red-700`) for buttons and active states
- **Confirmed**: Red background (`bg-red-50`, `border-red-200`) for booked slots
- **Pending**: Yellow (`bg-yellow-50`, `border-yellow-200`) for pending reservations
- **Cancelled**: Gray (`bg-gray-50`, `border-gray-200`) for cancelled bookings
- **Completed**: Green (`bg-green-50`, `border-green-200`) for completed reservations

### UI Elements
- **Clean backgrounds**: White cards on light gray backgrounds
- **Subtle borders**: Light gray borders for clean separation
- **Consistent spacing**: Proper padding and margins throughout
- **Modern typography**: Clear hierarchy with proper font weights

## 📱 Responsive Behavior

### Desktop Experience
```
┌─────────────────────────────────────────────────────────┐
│ Header: Floor Tabs | Date Picker | View Toggle | Add    │
├─────────────────────────────────────────────────────────┤
│ Tables │ 10:00 │ 10:30 │ 11:00 │ 11:30 │ 12:00 │ ... │
├────────┼───────┼───────┼───────┼───────┼───────┼─────┤
│ A1     │       │ [John Doe - 2 pax] │       │       │
│ A2     │       │       │       │ [Jane Smith - 4]  │
│ A3     │ [Michael Johnson - 6 pax - Birthday]     │
└─────────────────────────────────────────────────────────┘
```

### Mobile Experience
```
┌─────────────────────────────────┐
│ Header: Floor Tabs | Date | Add │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ John Doe          [Confirmed]│ │
│ │ Table A1 • 2 guests • 12:00 │ │
│ │ +62 812-3456-7890           │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Jane Smith        [Pending] │ │
│ │ Table A2 • 4 guests • 18:00 │ │
│ │ +62 813-9876-5432           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🔧 Technical Implementation

### Data Structure
```typescript
interface Reservation {
  id: string;
  tableId: string;
  tableName: string;
  floor: '1st' | '2nd';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pax: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentMethod: 'cash' | 'card' | 'transfer';
  specialRequests?: string;
  createdAt: string;
}
```

### Key Components
1. **ReservationPage**: Main container with responsive switching
2. **ReservationGrid**: Desktop scheduler grid layout
3. **ReservationList**: Mobile-friendly card list
4. **ReservationForm**: Comprehensive booking form
5. **ReservationDetail**: Full reservation details page

### State Management
- **useReservationData**: Custom hook for all reservation operations
- **Real-time filtering**: By floor, date, and status
- **CRUD operations**: Create, read, update, delete reservations
- **Availability checking**: Prevent booking conflicts

## 🎮 User Interactions

### Adding Reservations
1. Click "Add New Reservation" button
2. Select table from available options
3. Choose date and time slots
4. Enter customer information
5. Select payment method
6. Add special requests (optional)
7. Save with real-time validation

### Managing Reservations
- **View**: Click any reservation to see full details
- **Edit**: Use edit button in list view or detail page
- **Cancel**: Cancel reservations with confirmation
- **Status**: Update reservation status as needed

### Navigation
- **Floor switching**: Toggle between 1st and 2nd floor
- **Date navigation**: Use date picker to view different days
- **View modes**: Switch between grid and list on desktop
- **Detail pages**: Navigate to individual reservation details

## 📊 Mock Data
- **16 tables total**: 8 per floor with varying capacities
- **8 sample reservations**: Spread across both floors and dates
- **Multiple statuses**: Confirmed, pending, cancelled examples
- **Realistic data**: Phone numbers, emails, special requests

## 🔄 Integration
- **Seamless routing**: Integrated with React Router
- **Consistent UI**: Follows established design patterns
- **Responsive layout**: Works with existing sidebar system
- **Type safety**: Full TypeScript implementation

## 🎯 Business Value
- **Efficient booking**: Streamlined reservation process
- **Conflict prevention**: Avoid double bookings automatically
- **Customer management**: Store and track customer information
- **Staff productivity**: Easy-to-use interface for restaurant staff
- **Mobile support**: Manage reservations on any device