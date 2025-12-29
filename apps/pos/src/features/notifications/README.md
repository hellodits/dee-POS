# Notifications Feature

## Overview
Complete notification management system for DEEPOS restaurant with Light Mode branding. Features real-time notification display, filtering, and management capabilities.

## Features
- **Real-time Notifications**: Display system alerts, order updates, and important messages
- **Filter System**: Filter by All or Unread notifications with counts
- **Mark as Read**: Individual and bulk mark as read functionality
- **Delete Notifications**: Remove notifications with responsive delete buttons
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Type-based Icons**: Different icons and colors for different notification types

## Components

### NotificationPage
Main container component that handles:
- Header with title and unread count
- Mark all as read functionality
- Filter tabs (All/Unread) with counts
- Integration with notification hook

### NotificationList
List container component featuring:
- Empty state when no notifications
- Responsive grid layout
- Handles notification rendering

### NotificationItem
Individual notification component with:
- Type-based icon and color coding
- Title, description, and timestamp
- Read/unread visual indicators
- Responsive delete button (text on desktop, icon-only on mobile)
- Click to mark as read functionality

## Data Structure

### Notification Interface
```typescript
interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}
```

### Notification Types & Colors
- **Alert**: Red (`bg-red-100`, `text-red-600`) - Critical issues, payment failures
- **Success**: Green (`bg-green-100`, `text-green-600`) - Completed orders, successful operations
- **Info**: Blue (`bg-blue-100`, `text-blue-600`) - New features, general information
- **Warning**: Yellow (`bg-yellow-100`, `text-yellow-600`) - Low stock, maintenance notices

## State Management

### useNotifications Hook
Custom hook providing:
- **Notification Management**: Add, delete, mark as read
- **Filtering**: Filter by all or unread notifications
- **Statistics**: Total, unread, and read counts
- **Real-time Updates**: Automatic state updates

### Key Methods
```typescript
// Mark individual notification as read
markAsRead(id: string): void

// Mark all notifications as read
markAllAsRead(): void

// Delete notification
deleteNotification(id: string): void

// Add new notification
addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void
```

## Responsive Behavior

### Desktop Experience (≥768px)
- Full delete button with text and icon
- Larger notification cards with full content
- Side-by-side layout for optimal screen usage
- Hover effects and detailed interactions

### Mobile Experience (<768px)
- Icon-only delete buttons to save space
- Stacked layout for better touch interaction
- Condensed header with essential information
- Touch-optimized button sizes

## Visual Design (Light Mode)

### Color Scheme
- **Background**: Light gray (`bg-gray-50`) for main area
- **Cards**: White (`bg-white`) with subtle borders
- **Active Tab**: Red background (`bg-red-50`) with red text (`text-red-700`)
- **Unread Indicator**: Red left border and red dot
- **Interactive Elements**: Red hover states throughout

### Typography
- **Title**: Dark text (`text-gray-900`) with medium font weight
- **Description**: Gray text (`text-gray-600`) with line clamping
- **Timestamp**: Light gray (`text-gray-400`) with small font size
- **Counts**: Badge-style with appropriate background colors

## Usage Examples

### Basic Implementation
```tsx
import { NotificationPage } from '@/features/notifications/components';

// In your route
<Route path="/notifications" element={<NotificationPage />} />
```

### With Props
```tsx
<NotificationPage
  isSidebarCollapsed={false}
  isMobile={false}
  onToggleSidebar={() => {}}
/>
```

### Using the Hook
```tsx
const {
  notifications,
  stats,
  filter,
  setFilter,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = useNotifications();
```

## Mock Data
Includes 10 sample notifications with:
- **Varied Types**: Alert, success, info, warning notifications
- **Realistic Content**: Low stock alerts, order completions, system updates
- **Mixed Read States**: Both read and unread notifications
- **Time Distribution**: Notifications from minutes to days ago
- **Priority Levels**: High, medium, and low priority examples

## Key Features

### Real-time Updates
- **Live Counts**: Unread count updates automatically
- **Status Changes**: Read/unread status reflects immediately
- **Filter Updates**: Filter results update in real-time

### User Experience
- **Visual Indicators**: Clear read/unread distinction
- **Intuitive Actions**: Click to read, hover for delete
- **Responsive Design**: Adapts to screen size automatically
- **Empty States**: Helpful messages when no notifications

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and descriptions
- **Color Contrast**: High contrast for readability
- **Touch Targets**: Appropriate sizes for mobile interaction

## Integration Points
- **Dashboard Integration**: Can be accessed from main navigation
- **Real-time Systems**: Ready for WebSocket integration
- **Notification API**: Structured for backend integration
- **Cross-feature**: Can receive notifications from other features

## Business Value
- **Staff Awareness**: Keep staff informed of important events
- **Issue Management**: Quick notification of problems requiring attention
- **System Updates**: Communicate system changes and maintenance
- **Order Tracking**: Real-time updates on order status changes