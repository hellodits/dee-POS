# Profile & Settings Demo

## Feature Overview
The Profile & Settings feature provides comprehensive user and access management for DEEPOS with Light Mode branding.

## Demo Scenarios

### 1. My Profile Management
**Scenario**: Update personal information and change password

**Steps**:
1. Navigate to Profile & Settings from sidebar
2. Default view shows "My Profile" tab
3. Update profile picture by clicking camera icon
4. Edit personal information (name, email, address)
5. Change password using secure input fields
6. Save changes and see success message

**Key Features**:
- Profile picture upload with preview
- Form validation with real-time feedback
- Password visibility toggles
- Success/error message display
- Loading states during save operations

### 2. User Access Management
**Scenario**: Add new user and manage permissions

**Steps**:
1. Switch to "Manage Access" tab
2. Click "Add User" button
3. Fill out new user form with role selection
4. Search existing users using search bar
5. Expand user to view/edit permissions
6. Toggle individual permissions on/off
7. Delete user with confirmation dialog

**Key Features**:
- Role-based user creation (Admin/Manager/Cashier)
- Real-time user search and filtering
- Individual permission toggles
- User deletion with safety confirmation
- Last login time display

## Mock Data

### Current User (Admin)
- **Name**: John Doe
- **Email**: john.doe@deepos.com
- **Role**: Administrator
- **Permissions**: Full access to all features

### Sample Users
1. **Jane Smith** (Manager) - Full manager permissions
2. **Mike Johnson** (Manager) - Custom permissions (no reports)
3. **Sarah Wilson** (Cashier) - Standard cashier permissions
4. **David Brown** (Cashier) - Enhanced permissions (with inventory)

## UI Highlights

### Light Mode Design
- Clean white backgrounds with subtle shadows
- Red primary colors for active states and buttons
- Color-coded role badges (Red: Admin, Blue: Manager, Green: Cashier)
- Smooth transitions and hover effects

### Responsive Layout
- **Desktop**: Internal sidebar with main content area
- **Mobile**: Tab navigation with full-width forms
- **Tablet**: Optimized spacing and touch-friendly controls

### Interactive Elements
- Toggle switches for permissions (red when active)
- Password visibility controls with eye icons
- Expandable user cards for permission management
- Search functionality with instant filtering

## Navigation Flow
```
Profile & Settings
├── My Profile
│   ├── Profile Picture Upload
│   ├── Personal Information Form
│   └── Password Change Section
└── Manage Access
    ├── Add New User Form
    ├── User Search & Filter
    └── User List with Permissions
```

## Integration Points
- Accessible from main sidebar navigation
- Consistent with DEEPOS design system
- Follows established routing patterns
- Uses shared UI components and styling