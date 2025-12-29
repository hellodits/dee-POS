# Reservation Management Feature

## Overview
Complete reservation management system for DEEPOS restaurant with Light Mode branding. Features responsive design with desktop grid view and mobile list view.

## Features
- **Responsive Design**: Desktop grid scheduler and mobile-friendly list view
- **Floor Management**: Switch between 1st and 2nd floor tables
- **Real-time Availability**: Check table availability for time slots
- **CRUD Operations**: Create, read, update, and delete reservations
- **Customer Management**: Store customer details and special requests
- **Payment Tracking**: Track payment methods (cash, card, transfer)
- **Status Management**: Handle reservation statuses (confirmed, pending, cancelled, completed)

## Components

### ReservationPage
Main container component that handles:
- Floor tab switching (1st Floor, 2nd Floor)
- Date selection
- View mode switching (Grid/List for desktop)
- Add new reservation functionality
- Responsive layout management

### ReservationGrid (Desktop)
Grid scheduler component featuring:
- Time slots from 10:00 - 22:00 (30-minute intervals)
- Table rows with capacity information
- Visual reservation blocks with customer info
- Color-coded status indicators
- Horizontal scrolling for time navigation

### ReservationList (Mobile/Tablet)
Card-based list view with:
- Reservation cards showing key information
- Customer details and contact info
- Status badges and payment method
- Special requests display
- Edit functionality

### ReservationForm
Comprehensive form drawer with:
- Table selection with availability checking
- Customer information fields
- Date and time selection
- Payment method selection
- Special requests textarea
- Real-time validation

### ReservationDetail
Detailed view page featuring:
- Hero section with reservation overview
- Three information cards (Reservation, Customer, Payment)
- Action buttons (Cancel, Change Table)
- Status management
- Navigation back to main page

## Data Structure

### Reservation Interface
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

### Table Interface
```typescript
interface Table {
  id: string;
  name: string;
  floor: '1st' | '2nd';
  capacity: number;
  position: { x: number; y: number };
}
```

## Responsive Behavior

### Desktop (≥1024px)
- Grid view by default with scheduler layout
- View toggle between Grid and List
- Full sidebar navigation
- Horizontal scrolling for time slots

### Mobile/Tablet (<1024px)
- Automatic switch to List view
- No view toggle (List only)
- Mobile-optimized form drawer
- Touch-friendly interactions

## Color Scheme (Light Mode)
- **Primary**: Red (`bg-red-600`, `text-red-700`)
- **Confirmed Reservations**: Red background (`bg-red-50`, `border-red-200`)
- **Pending**: Yellow (`bg-yellow-50`, `border-yellow-200`)
- **Cancelled**: Gray (`bg-gray-50`, `border-gray-200`)
- **Completed**: Green (`bg-green-50`, `border-green-200`)
- **Background**: White and light gray (`bg-white`, `bg-gray-50`)

## Usage

### Basic Implementation
```tsx
import { ReservationPage } from '@/features/reservation/components';

// In your route
<Route path="/reservation" element={<ReservationPage />} />
<Route path="/reservation/:id" element={<ReservationDetail />} />
```

### With Props
```tsx
<ReservationPage
  isSidebarCollapsed={false}
  isMobile={false}
  onToggleSidebar={() => {}}
/>
```

## Key Features

### Availability Checking
- Real-time table availability validation
- Prevents double bookings
- Visual feedback for conflicts
- Automatic suggestion of available tables

### Time Management
- 30-minute time slot intervals
- Operating hours: 10:00 AM - 10:00 PM
- Duration calculation
- Time conflict detection

### Customer Experience
- Comprehensive customer information storage
- Special requests handling
- Multiple payment method support
- Status tracking throughout reservation lifecycle

### Staff Management
- Easy reservation creation and editing
- Quick status updates
- Table management
- Customer communication tracking

## Integration Points
- Integrates with DashboardLayout
- Uses consistent UI components
- Follows established routing patterns
- Maintains responsive design standards