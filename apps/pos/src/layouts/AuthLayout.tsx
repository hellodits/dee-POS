import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export function AuthLayout() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}