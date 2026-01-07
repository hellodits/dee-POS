import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { staffApi } from '@/lib/api'
import { Staff } from '../types'

interface StaffDetailProps {
  isSidebarCollapsed: boolean
  isMobile: boolean
  onToggleSidebar: () => void
}

export function StaffDetail({ isMobile, onToggleSidebar }: StaffDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [staff, setStaff] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleBack = () => {
    navigate('/staff')
  }

  useEffect(() => {
    const fetchStaff = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await staffApi.getById(id)
        
        if (response.data.success && response.data.data) {
          const s = response.data.data as any
          setStaff({
            id: s._id,
            fullName: s.fullName,
            email: s.email,
            phone: s.phone,
            role: s.role,
            salary: s.salary,
            dateOfBirth: s.dateOfBirth,
            age: s.age,
            shiftStart: s.shiftStart,
            shiftEnd: s.shiftEnd,
            address: s.address,
            additionalDetails: s.additionalDetails || '',
            profileImage: s.profileImage || '',
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
          })
        }
      } catch (err: any) {
        console.error('Error fetching staff:', err)
        setError(err.response?.data?.error || t('staff.failedToLoad'))
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const handleDeleteStaff = async () => {
    if (staff && window.confirm(t('staff.confirmDeleteStaff'))) {
      try {
        await staffApi.delete(staff.id)
        alert(t('staff.staffDeletedSuccessfully'))
        navigate('/staff')
      } catch (err: any) {
        alert(err.response?.data?.error || t('staff.failedToDelete'))
      }
    }
  }

  const [isUploading, setIsUploading] = useState(false)

  const handleChangePhoto = () => {
    // Create a file input element
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'
    
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file && staff) {
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
        
        // Upload to server
        setIsUploading(true)
        try {
          console.log('📸 Starting photo upload for staff:', staff.id)
          
          const formData = new FormData()
          // Only send the image file - the server will handle partial updates
          formData.append('profileImage', file)
          
          console.log('📤 Uploading photo:', file.name, file.size, 'bytes')
          
          const response = await staffApi.update(staff.id, formData)
          
          if (response.data.success && response.data.data) {
            const updatedData = response.data.data as any
            console.log('✅ Photo uploaded successfully:', updatedData.profileImage)
            console.log('📊 Updated staff data:', updatedData)
            
            // Update local state immediately with new image URL
            setStaff(prev => prev ? {
              ...prev,
              profileImage: updatedData.profileImage || '',
              updatedAt: updatedData.updatedAt || new Date().toISOString()
            } : null)
            
            // Force image refresh by adding timestamp to avoid caching issues
            if (updatedData.profileImage) {
              const imageUrl = updatedData.profileImage
              console.log('🖼️ New image URL set:', imageUrl)
              // Preload the new image to ensure it's ready
              const img = new Image()
              img.onload = () => {
                console.log('✅ New image preloaded successfully')
              }
              img.src = imageUrl
            }
            
            // Show success message
            alert(t('staff.photoUploadedSuccessfully'))
          }
        } catch (err: any) {
          console.error('❌ Photo upload error:', err)
          const errorMessage = err.response?.data?.error || err.message || t('staff.failedToUploadPhoto')
          alert(errorMessage)
        } finally {
          setIsUploading(false)
        }
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
          <div className="flex items-center justify-between">
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
                {t('staff.staffDetail')}
              </h1>
            </div>
            <button
              onClick={handleBack}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
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
                {t('staff.staffDetail')}
              </h1>
            </div>
            <button
              onClick={handleBack}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-4">{error}</p>
            <Button onClick={handleBack} variant="outline">
              {t('staff.backToStaffList')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
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
                {t('staff.staffDetail')}
              </h1>
            </div>
            <button
              onClick={handleBack}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
              title={t('common.close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t('staff.staffNotFound')}</p>
            <Button onClick={handleBack} variant="outline">
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
        <div className="flex items-center justify-between">
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
              {staff.fullName}
            </h1>
          </div>
          <button
            onClick={handleBack}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors touch-target"
            title={t('common.close')}
          >
            <X className="w-6 h-6" />
          </button>
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
                    {isUploading ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Mengupload...</p>
                      </div>
                    ) : staff.profileImage ? (
                      <>
                        <img 
                          key={staff.profileImage} // Force re-render when URL changes
                          src={staff.profileImage} 
                          alt={staff.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('❌ Image load error:', staff.profileImage)
                            // Hide broken image and show placeholder
                            e.currentTarget.style.display = 'none'
                          }}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', staff.profileImage)
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={handleChangePhoto}
                            className="p-2 bg-background rounded-full text-foreground hover:bg-accent transition-colors"
                            title={t('staff.changePhoto')}
                            disabled={isUploading}
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
                          disabled={isUploading}
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
                      disabled={isUploading}
                    >
                      {t('staff.editProfile')}
                    </Button>
                    <Button 
                      onClick={handleDeleteStaff}
                      variant="outline" 
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      size="sm"
                      disabled={isUploading}
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