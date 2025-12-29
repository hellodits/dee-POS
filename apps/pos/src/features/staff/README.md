# Staff Management Feature

## Overview
Complete staff management system for DEEPOS POS with CRUD operations, attendance tracking, responsive design, and multi-language support.

## Features Implemented

### ✅ Staff Management
- **Staff List**: Table view (desktop) and card view (mobile) with sorting and filtering
- **Add/Edit Staff**: Modal form (desktop) and drawer form (mobile)
- **Staff Detail**: Dedicated page with comprehensive staff information matching the provided design
- **Delete Staff**: Confirmation and removal functionality
- **Search & Filter**: Real-time search and role-based filtering
- **Sorting**: Multiple sort options (name, role, salary, age, recent)

### ✅ Staff Attendance
- **Attendance List**: Complete attendance tracking with table/card views
- **Attendance Records**: Shows staff attendance with status badges (Present, Absent, Half Shift, Leave)
- **Search & Filter**: Search by staff name/role and sort by name, date, or status
- **Status Management**: Color-coded status indicators
- **Responsive Design**: Mobile-optimized card view and desktop table view

### ✅ Staff Detail Page
- **Profile Layout**: Matches the provided design with left profile image and right details
- **Personal Details**: Full name, email, phone, date of birth, address
- **Job Details**: Role, salary, shift timings
- **Profile Actions**: Edit profile and delete profile buttons
- **Responsive**: Adapts to mobile/tablet/desktop layouts

### ✅ Responsive Design
- **Mobile**: Card-based layout with drawer forms and mobile-optimized interactions
- **Tablet**: Responsive grid layouts and touch-friendly controls
- **Desktop**: Full table view with modal forms and hover states

### ✅ Internationalization
- **English**: Complete translations for all staff-related text including attendance
- **Indonesian**: Complete translations for all staff-related text including attendance
- **Dynamic**: Language switching without page reload

### ✅ UI/UX Features
- **Light Theme**: Red primary (#dc2626) and yellow secondary colors
- **Consistent Design**: Follows established design system
- **Loading States**: Proper loading indicators and error handling
- **Form Validation**: Client-side validation with error messages
- **Touch Targets**: 44px minimum touch targets for mobile
- **Status Badges**: Color-coded status indicators for attendance

## File Structure

```
src/features/staff/
├── components/
│   ├── StaffPage.tsx         # Main staff management page with tabs
│   ├── StaffList.tsx         # Staff list with table/card views
│   ├── StaffForm.tsx         # Add/edit staff modal/drawer form
│   ├── StaffDetail.tsx       # Individual staff detail page (matches design)
│   ├── AttendanceList.tsx    # Attendance tracking component
│   └── index.ts              # Component exports
├── data/
│   └── mockStaffData.ts      # Mock data for staff and attendance
├── hooks/
│   └── useStaffData.ts       # Staff data management hook
├── types/
│   └── index.ts              # TypeScript interfaces
└── README.md                 # This file
```

## Routes

- `/staff` - Staff management page with tabs (Staff Management / Attendance)
- `/staff/:id` - Individual staff detail page

## Components

### StaffPage
Main container component with:
- Tab navigation (Staff Management / Attendance)
- Search and filter controls
- Add staff button
- Integration with StaffList, AttendanceList, and StaffForm

### StaffList
Responsive list component with:
- Desktop: Table view with sortable columns
- Mobile: Card view with essential information
- Sorting dropdown (name, role, salary, age, recent)
- Role filter dropdown
- Action buttons (view, edit, delete)

### AttendanceList
Attendance tracking component with:
- Desktop: Table view showing ID, Name, Date, Timings, Status
- Mobile: Card view with staff info and attendance details
- Status badges: Present (green), Absent (red), Half Shift (blue), Leave (orange)
- Search by staff name/role
- Sort by name, date, or status
- Add attendance functionality

### StaffForm
Modal/drawer form component with:
- Personal information section
- Work information section
- Form validation with error messages
- Responsive layout (modal on desktop, drawer on mobile)
- Add/edit mode support

### StaffDetail
Dedicated detail page matching the provided design with:
- Left column: Large profile image with edit/delete buttons
- Right column: Personal and job details in separate cards
- Navigation breadcrumbs with back button
- Responsive layout for mobile/tablet/desktop

## Data Structure

### Staff Interface
```typescript
interface Staff {
  id: string
  fullName: string
  email: string
  phone: string
  role: StaffRole
  salary: number
  dateOfBirth: string
  age: number
  shiftStart: string
  shiftEnd: string
  address: string
  additionalDetails?: string
  profileImage?: string
  createdAt: string
  updatedAt: string
}
```

### Attendance Interface
```typescript
interface AttendanceRecord {
  id: string
  staffId: string
  date: string
  timings: string
  status: AttendanceStatus
}

type AttendanceStatus = 'Present' | 'Absent' | 'Half Shift' | 'Leave'
```

### Staff Roles
- Manager
- Cashier
- Chef
- Waiter
- Cleaner
- Security

## Mock Data
- **Staff**: 8 sample staff members with realistic data and profile images
- **Attendance**: 8 attendance records for current date with various statuses
- Complete contact and work information
- Realistic salary ranges and shift timings

## Usage

### Staff Management
1. Navigate to `/staff` to access the staff management page
2. Use the "Staff Management" tab to manage staff members
3. Use the search bar to find specific staff members
4. Filter by role using the role dropdown
5. Sort the list using the sort dropdown
6. Click "Add Staff" to create a new staff member
7. Click "Edit" to modify existing staff information
8. Click "View" to see detailed staff information
9. Click "Delete" to remove a staff member

### Attendance Tracking
1. Navigate to `/staff` and click the "Attendance" tab
2. View all staff attendance records in table/card format
3. Search for specific staff attendance records
4. Sort by name, date, or status
5. View color-coded status indicators
6. Click "Add Attendance" to record new attendance (placeholder)

### Staff Detail
1. Click "View" on any staff member from the staff list
2. Navigate to `/staff/:id` to see the detailed staff profile
3. View large profile image and comprehensive details
4. Use "Edit profile" and "Delete profile" buttons for actions
5. Use the back button to return to staff list

## Integration

The staff management feature is fully integrated with:
- **Routing**: React Router for navigation between staff list and detail pages
- **Translations**: i18next for multi-language support (EN/ID)
- **Theme**: Consistent with light theme and red/yellow branding
- **Layout**: DashboardLayout with responsive sidebar
- **UI Components**: Shared UI component library (Button, Input, Card)
- **Responsive Design**: Mobile-first approach with breakpoint detection

## Design Compliance

The implementation matches the provided design images:
- **Attendance Tab**: Table layout with ID, Name, Date, Timings, Status columns
- **Staff Detail**: Left profile image, right details layout with proper spacing
- **Status Badges**: Color-coded Present, Absent, Half Shift, Leave indicators
- **Typography**: Consistent font sizes and weights
- **Spacing**: Proper padding and margins matching the design
- **Colors**: Light theme with red primary and appropriate status colors