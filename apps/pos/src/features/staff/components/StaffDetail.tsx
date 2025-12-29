import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockStaffData } from '../data/mockStaffData'
import { Staff } from '../types'

interface StaffDetailProps {
  // Props kept for compatibility but not used
  isSidebarCollapsed: boolean
  isMobile: boolean
  onToggleSidebar: () => void
}

export function StaffDetail({ }: StaffDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [staff, setStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchStaff = async () => {
      setLoading(true)
      try {
        const foundStaff = mockStaffData.find(s => s.id === id)
        setStaff(foundStaff || null)
      } catch (error) {
        console.error('Error fetching staff:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStaff()
    }
  }, [id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleEditStaff = () => {
    // Navigate to staff page with edit mode
    navigate('/staff', { 
      state: { 
        editStaff: staff,
        openForm: true 
      } 
    })
  }

  const handleDeleteStaff = () => {
    if (staff && window.confirm(t('staff.confirmDeleteStaff'))) {
      // In a real app, this would call an API to delete the staff
      // For now, we'll simulate the deletion and navigate back
      console.log('Deleting staff:', staff.id)
      
      // Show success message
      alert(t('staff.staffDeletedSuccessfully'))
      
      // Navigate back to staff list
      navigate('/staff')
    }
  }

  const handleChangePhoto = () => {
    // Create a file input element
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(t('staff.photoTooLarge'))
          return
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(t('staff.invalidFileType'))
          return
        }
        
        // In a real app, you would upload the file to a server
        // For now, we'll create a local URL for preview
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          console.log('New photo selected:', imageUrl)
          alert(t('staff.photoUploadedSuccessfully'))
          
          // In a real app, you would update the staff data
          // setStaff(prev => prev ? { ...prev, profileImage: imageUrl } : null)
        }
        reader.readAsDataURL(file)
      }
    }
    
    // Trigger file selection
    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  }

  if (loading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/staff')}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.back')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {t('staff.staffDetail')}
            </h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/staff')}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.back')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {t('staff.staffDetail')}
            </h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t('staff.staffNotFound')}</p>
            <Button onClick={() => navigate('/staff')} variant="outline">
              {t('staff.backToStaffList')}
            </Button>
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
          <button
            onClick={() => navigate('/staff')}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            title={t('staff.backToStaffList')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            {staff.fullName}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Image */}
            <div className="lg:col-span-1">
              <Card className="bg-card border border-border">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {t('staff.profileImage')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="w-48 h-64 mx-auto bg-muted rounded-lg flex items-center justify-center overflow-hidden relative group">
                    {staff.profileImage ? (
                      <>
                        <img 
                          src={staff.profileImage} 
                          alt={staff.fullName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={handleChangePhoto}
                            className="p-2 bg-white rounded-full text-gray-800 hover:bg-gray-100 transition-colors"
                            title={t('staff.changePhoto')}
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-semibold text-primary">
                            {staff.fullName.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{t('staff.noProfileImage')}</p>
                        <button
                          onClick={handleChangePhoto}
                          className="inline-flex items-center space-x-2 text-sm text-primary hover:text-primary/80"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{t('staff.uploadPhoto')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('staff.changeProfilePicture')}</p>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleEditStaff}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="sm"
                    >
                      {t('staff.editProfile')}
                    </Button>
                    <Button 
                      onClick={handleDeleteStaff}
                      variant="outline" 
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      size="sm"
                    >
                      {t('staff.deleteProfile')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Staff Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {t('staff.employeePersonalDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.fullName')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{staff.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.phoneNumber')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{staff.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.address')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{staff.address}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.email')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{staff.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.dateOfBirth')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{formatDate(staff.dateOfBirth)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {t('staff.employeeJobDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.role')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{staff.role}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.shiftStartTiming')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{staff.shiftStart}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.salary')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{formatCurrency(staff.salary)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          {t('staff.shiftEndTiming')}
                        </label>
                        <p className="text-foreground font-medium mt-1">{staff.shiftEnd}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}