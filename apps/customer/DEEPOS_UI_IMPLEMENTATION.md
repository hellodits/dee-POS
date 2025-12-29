# DEEPOS Customer App - UI Implementation

## Overview
This is a pixel-perfect implementation of the DEEPOS Customer App based on the provided high-fidelity mockups. The app features a "Fire & Gold" theme with highly rounded UI elements and a mobile-first design.

## Design System

### Colors
- **Primary Red**: `#DC2626` (bg-red-600) - Main buttons, price text, "All Menu" active tab
- **Secondary Yellow/Cream**: `#FEF3C7` (bg-amber-100) to `#FBBF24` (text-amber-500) - Secondary buttons, "Best Seller" tags, star ratings, selected states
- **Dark Accent**: `#1F2937` (bg-gray-900) - Sticky bottom cart background
- **Background**: `#F9FAFB` (bg-gray-50) - Main app background

### Typography
- Font: Sans-serif (system default)
- Bold headings for emphasis
- Consistent text sizing with proper hierarchy

### Shape Language
- **Highly rounded UI**: `rounded-2xl` for cards and inputs
- **Fully rounded**: `rounded-full` for buttons and icons
- Consistent spacing and padding

## Implemented Screens

### 1. Menu/Home Page (`MenuPage.tsx`)
- **Header**: "Pesan Makanan" with close icon
- **Categories**: Horizontal scrolling pills with active/inactive states
- **Menu Items**: Vertical list with:
  - Circular food images (emoji placeholders)
  - Star ratings with yellow stars
  - Red price text
  - Red circular add buttons
  - "Best Seller" and "Healthy" tags
- **Reservation Banner**: White card with red icon and arrow
- **Sticky Bottom Cart**: Dark floating capsule with order summary and checkout button

### 2. Checkout Page (`CheckoutPage.tsx`)
- **Header**: Back arrow + "Checkout" title
- **Order Summary**: List of selected items with quantities and prices
- **Guest Information Form**:
  - Name input with user icon
  - Table number dropdown
  - Guest counter with +/- buttons
  - Notes textarea
- **Payment Methods**: Grid of QRIS and Cash payment options with selection states
- **Footer**: Total summary and "Buat Pesanan Sekarang" button

### 3. Reservation Page (`ReservationPage.tsx`)
- **Header**: Back arrow + "Reservasi Online" title
- **Date Picker**: Horizontal scrolling date pills with yellow selection
- **Time Slots**: 4-column grid of time buttons
- **Guest Counter**: Amber background section with stepper controls
- **Contact Form**: Name and WhatsApp inputs with icons
- **Confirmation Note**: Green background with check icon
- **Footer**: "Ajukan Reservasi" button

## Technical Features

### State Management
- Simple React state for navigation between screens
- Cart management with add/remove functionality
- Form state for user inputs
- Selection states for dates, times, and payment methods

### Navigation
- Screen-based navigation using state
- Proper back button functionality
- Smooth transitions between screens

### Responsive Design
- Mobile-first approach with `max-w-md` container
- Centered layout for desktop viewing
- Touch-friendly button sizes (minimum 44px)
- Proper spacing and padding for mobile interaction

### Icons
- Uses `lucide-react` for consistent iconography
- Proper icon sizing and positioning
- Semantic icon usage (Calendar, User, Phone, etc.)

## Key Components

### Interactive Elements
- **Add to Cart**: Red circular buttons with plus icons
- **Quantity Counters**: Amber/yellow increment buttons
- **Selection States**: Yellow/amber backgrounds for active selections
- **Form Inputs**: Rounded inputs with proper focus states

### Layout Features
- **Sticky Cart**: Fixed positioning at bottom with proper z-index
- **Scrollable Content**: Proper overflow handling with hidden scrollbars
- **Grid Layouts**: Responsive grids for time slots and payment methods
- **Flexible Cards**: Consistent card styling throughout

## Development Setup

```bash
cd apps/customer
npm run dev
```

The app will be available at `http://localhost:4001/` (or next available port).

## File Structure

```
apps/customer/src/
├── App.tsx                 # Main app with navigation state
├── pages/
│   ├── MenuPage.tsx       # Home/Menu screen
│   ├── CheckoutPage.tsx   # Checkout screen
│   └── ReservationPage.tsx # Reservation screen
├── index.css              # Global styles and utilities
└── ...
```

## Notes

- All mockup elements have been implemented with pixel-perfect attention to detail
- The design uses emoji placeholders for food images (can be replaced with actual images)
- Form validation and API integration are ready for implementation
- The app is fully responsive and touch-optimized
- All interactive elements have proper hover and focus states