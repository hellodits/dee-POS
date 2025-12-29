# Profile & Settings Feature

## Overview
Complete profile and user management system for DEEPOS with Light Mode branding.

## Features

### My Profile
- **Profile Picture Management**: Upload and update profile pictures with camera icon overlay
- **Personal Information**: Edit first name, last name, email, and address
- **Password Management**: Change password with confirmation and validation
- **Form Validation**: Real-time validation with error messages
- **Auto-save**: Automatic form submission with loading states

### Manage Access
- **User Management**: Add, edit, and delete users
- **Role-based Access**: Admin, Manager, and Cashier roles with default permissions
- **Permission Control**: Toggle individual permissions for each user
- **Search & Filter**: Search users by name, email, or role
- **User Information**: Display avatars, roles, and last login times

## Components

### ProfilePage
- Main container with internal sidebar navigation
- Responsive design with mobile tab navigation
- Handles view switching between profile and access management

### MyProfileView
- Profile editing form with avatar upload
- Password change functionality with show/hide toggles
- Form validation and error handling
- Success/error message display

### ManageAccessView
- User list with search functionality
- Add new user form with role selection
- Permission management with toggle switches
- User deletion with confirmation

## State Management

### useProfile Hook
- Manages current user data and user list
- Handles CRUD operations for users
- Permission management functions
- Loading states and error handling

## Data Structure

### User Types
- `User`: Basic user information with permissions
- `CurrentUser`: Extended user data for logged-in user
- `ProfileFormData`: Form data for profile updates
- `NewUserFormData`: Form data for creating new users
- `UserPermission`: Permission flags for different features

### Mock Data
- Current user with admin privileges
- 5 sample users with different roles and permissions
- Helper functions for role badges and permission labels

## Styling

### Light Mode Branding
- **Primary Color**: Red (`bg-red-600`, `text-red-700`)
- **Backgrounds**: White cards on gray background
- **Active States**: Red backgrounds with white text
- **Role Badges**: Color-coded (Admin: red, Manager: blue, Cashier: green)
- **Toggle Switches**: Red for active, gray for inactive

### Responsive Design
- Desktop: Side-by-side layout with internal sidebar
- Mobile: Tab navigation with full-width content
- Tablet: Optimized spacing and touch targets

## Usage

```tsx
import { ProfilePage } from '@/features/profile/components';

// In DashboardLayout
<Route path="/profile" element={
  <ProfilePage 
    isSidebarCollapsed={isSidebarCollapsed}
    isMobile={isMobile}
    onToggleSidebar={toggleSidebar}
  />
} />
```

## Integration
- Added to DashboardLayout routing
- Integrated with Sidebar navigation
- Uses existing UI components and styling patterns
- Follows DEEPOS design system and branding guidelines