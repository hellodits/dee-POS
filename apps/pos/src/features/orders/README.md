# Order & Table Management Feature

## Overview
Complete order and table management system for DEEPOS restaurant with dual-mode interface: Order Dashboard and Point of Sale (POS) system. Features Light Mode branding with responsive design.

## Features
- **Dual Mode Interface**: Order List Dashboard and POS Interface
- **Real-time Order Management**: Create, update, and track orders
- **Payment Processing**: Complete payment flow with tips and multiple methods
- **Table Management**: Select and manage table assignments
- **Menu Catalog**: Browse and add items to cart with categories
- **Status Tracking**: Track orders through in-process, ready, completed, cancelled states
- **PIN Security**: PIN pad for sensitive operations like order deletion

## Components

### OrdersPage
Main container component that handles view mode switching between:
- **Dashboard Mode**: Order list with status filtering and search
- **POS Mode**: Point of sale interface for creating new orders

### OrderListPage (Dashboard Mode)
Order management dashboard featuring:
- **Status Tabs**: Filter by All, In Process, Completed, Cancelled
- **Search Functionality**: Search orders by number, customer, or table
- **Order Cards**: Visual cards showing order details and actions
- **Pay Bill**: Direct payment processing for ready orders
- **Order Actions**: Edit and delete with PIN confirmation

### POSPage (POS Mode)
Point of sale interface with:
- **Split Layout**: Menu catalog (left) and cart sidebar (right) on desktop
- **Category Navigation**: Horizontal category rail with icons
- **Menu Grid**: Product cards with add/remove quantity controls
- **Cart Management**: Real-time cart updates with item management
- **Table Selection**: Modal for choosing available tables
- **Mobile Responsive**: Floating cart button with drawer on mobile

### OrderCard
Individual order display component with:
- **Order Information**: Number, customer, table, timing
- **Item Summary**: First 3 items with "...more" indicator
- **Status Badges**: Color-coded status indicators
- **Action Buttons**: Pay Bill, Edit, Delete based on status
- **Subtotal Display**: Clear pricing information

### PaymentModal
Comprehensive payment processing with:
- **Tips Input**: Numeric keypad for tip entry
- **Payment Methods**: Cash, Card, E-Wallet selection
- **Order Summary**: Subtotal, tax, tip, total breakdown
- **Cash Handling**: Received amount and change calculation
- **Receipt Options**: Print receipt functionality

### PinPadModal
Security PIN entry for sensitive operations:
- **4-Digit PIN**: Secure numeric input
- **Visual Feedback**: Filled/empty circles for PIN progress
- **Numeric Keypad**: Clean button layout with backspace
- **Confirmation**: Validate PIN before proceeding

## Data Structure

### Order Interface
```typescript
interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  tableName?: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: 'in-process' | 'ready' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'e-wallet';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### CartItem Interface
```typescript
interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
  notes?: string;
}
```

## State Management (Zustand)

### useOrderStore Hook
Centralized state management for:
- **Cart Operations**: Add, remove, update quantities, clear cart
- **Order Management**: Create, update status, delete orders
- **UI State**: View mode, selected table, customer name, filters
- **Computed Values**: Cart totals, tax calculations, filtered orders

### Key Store Methods
```typescript
// Cart Management
addToCart(menuItem: MenuItem): void
removeFromCart(itemId: string): void
updateCartItemQuantity(itemId: string, quantity: number): void
clearCart(): void

// Order Operations
createOrder(): void
updateOrderStatus(orderId: string, status: Order['status']): void
deleteOrder(orderId: string): void

// UI Controls
setViewMode(mode: ViewMode): void
setSelectedTable(table: Table | null): void
setOrderStatus(status: OrderStatus): void
```

## Responsive Design

### Desktop Experience (≥768px)
- **Split POS Layout**: Menu catalog + fixed cart sidebar
- **Grid View**: Multi-column order cards
- **Full Navigation**: All features accessible simultaneously
- **Hover Interactions**: Enhanced button states and tooltips

### Mobile Experience (<768px)
- **Single Column**: Stacked layout for better touch interaction
- **Floating Cart**: Cart button with item count badge
- **Drawer Interface**: Slide-out cart with full functionality
- **Touch Optimized**: Larger buttons and touch targets

## Color Scheme (Light Mode)

### Status Colors
- **In Process**: Yellow (`bg-yellow-100`, `text-yellow-700`)
- **Ready**: Green (`bg-green-100`, `text-green-700`)
- **Completed**: Blue (`bg-blue-100`, `text-blue-700`)
- **Cancelled**: Gray (`bg-gray-100`, `text-gray-700`)

### UI Elements
- **Primary Actions**: Red (`bg-red-600`) for main buttons
- **Active States**: Red backgrounds (`bg-red-50`, `border-red-600`)
- **Cards**: White (`bg-white`) with subtle shadows
- **Backgrounds**: Light gray (`bg-gray-50`) for main areas

## Business Logic

### Order Workflow
1. **Create Order**: Select table → Add items → Enter customer name → Send to kitchen
2. **Kitchen Processing**: Order status changes to "in-process"
3. **Ready for Service**: Status updates to "ready"
4. **Payment**: Process payment with tips and method selection
5. **Completion**: Order marked as "completed"

### Tax Calculation
- **Tax Rate**: 10% applied to subtotal
- **Tax Base**: Calculated on subtotal before tips
- **Total**: Subtotal + Tax + Tips

### Cart Management
- **Quantity Controls**: Add/remove with visual feedback
- **Real-time Updates**: Instant price and total calculations
- **Persistence**: Cart maintained during session
- **Validation**: Prevent empty orders and missing information

## Integration Points

### Menu Integration
- **Shared Menu Data**: Uses menu items from menu management feature
- **Category System**: Consistent categorization across features
- **Pricing**: Real-time pricing from menu database

### Table Management
- **Table Selection**: Integration with reservation system tables
- **Availability**: Check table status before assignment
- **Capacity**: Display table capacity for staff reference

### Payment Processing
- **Multiple Methods**: Support for cash, card, and e-wallet
- **Receipt Generation**: Print receipt functionality
- **Change Calculation**: Automatic change computation for cash payments

## Usage Examples

### Basic Order Creation
```typescript
// Switch to POS mode
setViewMode('pos');

// Select table and customer
setSelectedTable(table);
setCustomerName('John Doe');

// Add items to cart
addToCart(menuItem);
updateCartItemQuantity(cartItemId, 2);

// Create order
createOrder(); // Automatically switches back to dashboard
```

### Payment Processing
```typescript
// Handle payment for ready order
const handlePayBill = (order: Order) => {
  setSelectedOrder(order);
  setIsPaymentModalOpen(true);
};

// Complete payment
const handlePaymentComplete = (paymentData: PaymentData) => {
  updateOrderStatus(order.id, 'completed');
};
```

### Order Filtering
```typescript
// Filter orders by status
setOrderStatus('in-process');

// Search orders
setSearchQuery('Table 01');

// Get filtered results
const filteredOrders = getFilteredOrders();
```

## Key Features

### Real-time Updates
- **Live Status**: Order status updates reflect immediately
- **Cart Sync**: Cart changes update totals instantly
- **Search Results**: Filter results update as you type

### Security Features
- **PIN Protection**: Sensitive operations require PIN entry
- **Confirmation Dialogs**: Prevent accidental deletions
- **Access Control**: Role-based feature access

### User Experience
- **Intuitive Navigation**: Clear mode switching between dashboard and POS
- **Visual Feedback**: Loading states, hover effects, status indicators
- **Error Handling**: Graceful error messages and validation
- **Accessibility**: Keyboard navigation and screen reader support

## Performance Optimizations
- **Efficient Filtering**: Optimized order filtering and search
- **Image Loading**: Lazy loading for menu item images
- **State Management**: Minimal re-renders with Zustand
- **Memory Management**: Proper cleanup of event listeners and timers