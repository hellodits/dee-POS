import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Menu, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StaffList } from './StaffList'
import { StaffForm } from './StaffForm'
import { AttendanceList } from './AttendanceList'
import { useStaffData } from '../hooks/useStaffData'
import { Staff, StaffFilters, SortOption, StaffRole } from '../types'

interface StaffPageProps {
  isSidebarCollapsed: boolean
  isMobile: boolean
  onToggleSidebar: () => void
}

export function StaffPage({ isMobile, onToggleSidebar }: StaffPageProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { 
    staff, 
    isLoading, 
    error, 
    addStaff, 
    updateStaff, 
    deleteStaff, 
    filterAndSortStaff,
    refetch 
  } = useStaffData()
  
  const [activeTab, setActiveTab] = useState<'staff' | 'attendance'>('staff')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [isSaving, setIsSaving] = useState(false)
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

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setIsFormOpen(true)
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm(t('staff.confirmDeleteStaff'))) return
    
    try {
      await deleteStaff(staffId)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSaveStaff = async (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File | null) => {
    setIsSaving(true)
    
    try {
      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('fullName', staffData.fullName)
      formData.append('email', staffData.email)
      formData.append('phone', staffData.phone)
      formData.append('role', staffData.role)
      formData.append('salary', String(staffData.salary))
      formData.append('dateOfBirth', staffData.dateOfBirth)
      formData.append('shiftStart', staffData.shiftStart)
      formData.append('shiftEnd', staffData.shiftEnd)
      formData.append('address', staffData.address)
      if (staffData.additionalDetails) {
        formData.append('additionalDetails', staffData.additionalDetails)
      }
      if (imageFile) {
        console.log('📸 Adding image to FormData:', imageFile.name, imageFile.size, imageFile.type)
        formData.append('profileImage', imageFile)
      } else {
        console.log('📷 No image file to upload')
      }

      if (editingStaff) {
        console.log('📝 Editing staff with ID:', editingStaff.id)
        await updateStaff(editingStaff.id, formData)
      } else {
        console.log('➕ Creating new staff')
        await addStaff(formData)
      }
      
      setIsFormOpen(false)
      setEditingStaff(null)
    } catch (err: any) {
      console.error('❌ Save staff error:', err)
      const errorMessage = err.message || 'Terjadi kesalahan'
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
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
  const filteredStaff = filterAndSortStaff(filters)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button onClick={onToggleSidebar} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{t('staff.title')}</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat data staff...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button onClick={onToggleSidebar} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{t('staff.title')}</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">{error}</p>
            <button 
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
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
                  {t('staff.staffList')} ({staff.length})
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
        isSaving={isSaving}
      />
    </div>
  )
}
