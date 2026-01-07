import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '@/features/dashboard/components/Sidebar'
import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { StaffPage } from '@/features/staff/components/StaffPage'
import { StaffDetail } from '@/features/staff/components/StaffDetail'
import { MenuPage } from '@/features/menu/components/MenuPage'
import { InventoryPage } from '@/features/inventory/components/InventoryPage'
import { ReservationPage, ReservationDetail } from '@/features/reservation/components'
import { OrdersPage } from '@/features/orders/components'
import { NotificationPage } from '@/features/notifications/components'
import { ProfilePage } from '@/features/profile/components'
import { ReportsPage } from '@/features/reports/components'
import { auth } from '@/lib/api'

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if user is authenticated
  const isAuthenticated = auth.isAuthenticated()

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  // Responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768) // sm and below
      const isTablet = width >= 768 && width < 1024 // md
      
      // Auto-collapse sidebar on tablet
      if (isTablet) {
        setIsSidebarCollapsed(true)
      } else if (width >= 1024) {
        setIsSidebarCollapsed(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(prev => !prev)
    } else {
      setIsSidebarCollapsed(prev => !prev)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Floating Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        isMobile={isMobile}
        onCloseMobileMenu={closeMobileMenu}
        onToggleSidebar={toggleSidebar}
      />
      
      {/* Main Content */}
      <div className={`
        min-h-screen transition-all duration-300 ease-in-out
        ${isMobile 
          ? 'ml-0' 
          : isSidebarCollapsed 
            ? 'ml-24' 
            : 'ml-72'
        }
      `}>
        <Routes>
          <Route 
            path="/" 
            element={
              <DashboardPage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/menu" 
            element={
              <MenuPage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/staff" 
            element={
              <StaffPage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/staff/:id" 
            element={
              <StaffDetail 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <InventoryPage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/reservation" 
            element={
              <ReservationPage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/reservation/:id" 
            element={
              <ReservationDetail 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/orders" 
            element={
              <OrdersPage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <NotificationPage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProfilePage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ReportsPage 
                isSidebarCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onToggleSidebar={toggleSidebar}
              />
            } 
          />
        </Routes>
      </div>
    </div>
  )
}