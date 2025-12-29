# DEEPOS Frontend

React frontend untuk DEEPOS Point of Sale System dengan dark theme dan red accent.

## 🎨 Design System

- **Theme**: Dark Mode dengan Red Accents
- **Colors**:
  - Background: `#121212`
  - Surface: `#282828` 
  - Primary Red: `#ef4444`
- **UI Library**: Shadcn/UI + Tailwind CSS

## 📁 Structure

```
src/
├── features/
│   └── auth/
│       └── components/
│           ├── LoginForm.tsx
│           ├── RegisterForm.tsx
│           └── ForgotPasswordForm.tsx
├── components/ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── label.tsx
│   ├── checkbox.tsx
│   └── spinner.tsx
├── layouts/
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
└── lib/
    ├── api.ts
    └── utils.ts
```

## 🚀 Pages Ready

### Authentication Pages
- ✅ **Login Page** (`/auth/login`)
  - Email & password fields
  - Remember me checkbox
  - Show/hide password
  - Loading states
  - Link to forgot password

- ✅ **Register Page** (`/auth/register`)
  - Full name, email, password fields
  - Password confirmation
  - Show/hide password
  - Loading states

- ✅ **Forgot Password** (`/auth/forgot-password`)
  - Email input
  - Success state with email sent confirmation
  - Back to login link

## 🎯 Features

- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Consistent dark mode throughout
- **Loading States**: Spinner animations during API calls
- **Form Validation**: Client-side validation
- **Accessibility**: Proper labels and ARIA attributes
- **Type Safety**: Full TypeScript support

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Routes

- `/` → Redirect to `/auth/login`
- `/auth/login` → Login page
- `/auth/register` → Register page
- `/auth/forgot-password` → Forgot password page
- `/dashboard/*` → Dashboard (coming soon)

## 📱 Screenshots

Visit http://localhost:3000 to see the pages:
- Login form with dark theme
- Forgot password flow
- Register form
- Responsive design

## 🔗 API Integration

Ready untuk connect ke backend API:
- Axios instance configured
- Authentication interceptors
- Error handling
- Token management

## 🎨 UI Components

Semua komponen menggunakan Shadcn/UI dengan custom theme:
- Button variants
- Input dengan proper styling
- Card components
- Loading spinners
- Form labels
- Checkboxes

Ready untuk development selanjutnya! 🚀