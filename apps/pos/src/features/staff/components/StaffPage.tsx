import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StaffList } from './StaffList'
import { StaffForm } from './StaffForm'
import { AttendanceList } from './AttendanceList'
import { mockStaffData } from '../data/mockStaffData'
import { Staff, StaffFilters, SortOption, StaffRole } from '../types'

interface StaffPageProps {
  isSidebarCollapsed: boolean
  isMobile: boolean
  onToggleSidebar: () => void
}

export function StaffPage({ isSidebarCollapsed, isMobile, onToggleSidebar }: StaffPageProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'staff' | 'attendance'>('staff')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [staffData, setStaffData] = useState<Staff[]>(mockStaffData)
  const [filters, setFilters] = useState<StaffFilters>({
    sortBy: 'name',
    search: ''
  })

  // Handle navigation state for editing staff from detail page
  useEffect(() => {
    const state = location.state as { editStaff?: Staff; openForm?: boolean } | null
    if (state?.editStaff && state?.openForm) {
      setEditingStaff(state.editStaff)
      setIsFormOpen(true)
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleAddStaff = () => {
    setEditingStaff(null)
    setIsFormOpen(true)
  }

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff)
    setIsFormOpen(true)
  }

  const handleDeleteStaff = (staffId: string) => {
    setStaffData(prev => prev.filter(staff => staff.id !== staffId))
  }

  const handleSaveStaff = (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStaff) {
      // Update existing staff
      setStaffData(prev => prev.map(staff => 
        staff.id === editingStaff.id 
          ? { ...staff, ...staffData, updatedAt: new Date().toISOString() }
          : staff
      ))
    } else {
      // Add new staff
      const newStaff: Staff = {
        ...staffData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setStaffData(prev => [...prev, newStaff])
    }
    setIsFormOpen(false)
    setEditingStaff(null)
  }

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }

  const handleSortChange = (sortBy: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  const handleRoleFilter = (role?: StaffRole) => {
    setFilters(prev => ({ ...prev, role }))
  }

  // Filter and sort staff data
  const filteredStaff = staffData
    .filter(staff => {
      const matchesSearch = !filters.search || 
        staff.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        staff.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        staff.role.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesRole = !filters.role || staff.role === filters.role
      
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName)
        case 'role':
          return a.role.localeCompare(b.role)
        case 'salary':
          return b.salary - a.salary
        case 'age':
          return a.age - b.age
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="flex-1 bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            title={isSidebarCollapsed ? t('common.expand') : t('common.collapse')}
          >
            {isMobile ? '☰' : (isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)}
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            {t('staff.title')}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors touch-target ${
              activeTab === 'staff'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('staff.staffManagement')}
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors touch-target ${
              activeTab === 'attendance'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('staff.attendance')}
          </button>
        </div>

        {/* Staff Management Tab */}
        {activeTab === 'staff' && (
          <Card className="bg-card border border-border">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {t('staff.staffList')}
                </CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex-1 sm:w-64">
                    <Input
                      placeholder={t('staff.searchStaff')}
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    onClick={handleAddStaff}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground touch-target"
                  >
                    {t('staff.addStaff')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StaffList
                staff={filteredStaff}
                filters={filters}
                onEdit={handleEditStaff}
                onDelete={handleDeleteStaff}
                onSortChange={handleSortChange}
                onRoleFilter={handleRoleFilter}
                isMobile={isMobile}
              />
            </CardContent>
          </Card>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <Card className="bg-card border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                {t('staff.attendance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceList isMobile={isMobile} />
            </CardContent>
          </Card>
        )}
      </main>

      {/* Staff Form Modal/Drawer */}
      <StaffForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingStaff(null)
        }}
        onSave={handleSaveStaff}
        editingStaff={editingStaff}
        isMobile={isMobile}
      />
    </div>
  )
}