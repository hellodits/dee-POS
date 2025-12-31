import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Staff, StaffFormData, StaffRole } from '../types'

interface StaffFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>, imageFile?: File | null) => void
  editingStaff: Staff | null
  isMobile: boolean
  isSaving?: boolean
}

export function StaffForm({ isOpen, onClose, onSave, editingStaff, isMobile, isSaving = false }: StaffFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<StaffFormData>({
    fullName: '',
    email: '',
    phone: '',
    role: 'Waiter',
    salary: '',
    dateOfBirth: '',
    shiftStart: '',
    shiftEnd: '',
    address: '',
    additionalDetails: '',
    profileImage: null
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<StaffFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roles: StaffRole[] = ['Manager', 'Cashier', 'Chef', 'Waiter', 'Cleaner', 'Security']

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        fullName: editingStaff.fullName,
        email: editingStaff.email,
        phone: editingStaff.phone,
        role: editingStaff.role,
        salary: editingStaff.salary.toString(),
        dateOfBirth: editingStaff.dateOfBirth,
        shiftStart: editingStaff.shiftStart,
        shiftEnd: editingStaff.shiftEnd,
        address: editingStaff.address,
        additionalDetails: editingStaff.additionalDetails || '',
        profileImage: null
      })
      setImagePreview(editingStaff.profileImage || null)
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'Waiter',
        salary: '',
        dateOfBirth: '',
        shiftStart: '',
        shiftEnd: '',
        address: '',
        additionalDetails: '',
        profileImage: null
      })
      setImagePreview(null)
    }
    setImageFile(null)
    setErrors({})
  }, [editingStaff, isOpen])

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<StaffFormData> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('staff.errors.fullNameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('staff.errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('staff.errors.emailInvalid')
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('staff.errors.phoneRequired')
    }

    if (!formData.salary.trim()) {
      newErrors.salary = t('staff.errors.salaryRequired')
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) {
      newErrors.salary = t('staff.errors.salaryInvalid')
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t('staff.errors.dateOfBirthRequired')
    }

    if (!formData.shiftStart) {
      newErrors.shiftStart = t('staff.errors.shiftStartRequired')
    }

    if (!formData.shiftEnd) {
      newErrors.shiftEnd = t('staff.errors.shiftEndRequired')
    }

    if (!formData.address.trim()) {
      newErrors.address = t('staff.errors.addressRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const age = calculateAge(formData.dateOfBirth)
      
      const staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        salary: Number(formData.salary),
        dateOfBirth: formData.dateOfBirth,
        age,
        shiftStart: formData.shiftStart,
        shiftEnd: formData.shiftEnd,
        address: formData.address.trim(),
        additionalDetails: formData.additionalDetails.trim(),
        profileImage: editingStaff?.profileImage
      }

      onSave(staffData, imageFile)
    } catch (error) {
      console.error('Error saving staff:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Right-side Slide-over Drawer */}
      <div className={`fixed top-0 right-0 h-full z-50 bg-background border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
        isMobile ? 'w-full' : 'w-[500px] rounded-l-2xl'
      } ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header - Fixed */}
        <div className={`flex items-center space-x-3 px-6 py-4 border-b border-border bg-card flex-shrink-0 ${
          isMobile ? '' : 'rounded-tl-2xl'
        }`}>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title={t('common.back')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {editingStaff ? t('staff.editStaff') : t('staff.addStaff')}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Form Fields - Scrollable */}
            <div className="flex-1 p-6 space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-foreground border-b border-border pb-2">
                  {t('staff.personalInformation')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('staff.fullName')} *
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder={t('staff.enterFullName')}
                      className={errors.fullName ? 'border-destructive' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('staff.email')} *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('staff.enterEmail')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('staff.phone')} *
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('staff.enterPhone')}
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('staff.dateOfBirth')} *
                    </label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={errors.dateOfBirth ? 'border-destructive' : ''}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-destructive mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('staff.address')} *
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder={t('staff.enterAddress')}
                      className={errors.address ? 'border-destructive' : ''}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-foreground border-b border-border pb-2">
                  {t('staff.workInformation')}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('staff.role')} *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('staff.salary')} *
                    </label>
                    <Input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      placeholder={t('staff.enterSalary')}
                      className={errors.salary ? 'border-destructive' : ''}
                    />
                    {errors.salary && (
                      <p className="text-sm text-destructive mt-1">{errors.salary}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('staff.shiftStart')} *
                      </label>
                      <Input
                        type="time"
                        value={formData.shiftStart}
                        onChange={(e) => handleInputChange('shiftStart', e.target.value)}
                        className={errors.shiftStart ? 'border-destructive' : ''}
                      />
                      {errors.shiftStart && (
                        <p className="text-sm text-destructive mt-1">{errors.shiftStart}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('staff.shiftEnd')} *
                      </label>
                      <Input
                        type="time"
                        value={formData.shiftEnd}
                        onChange={(e) => handleInputChange('shiftEnd', e.target.value)}
                        className={errors.shiftEnd ? 'border-destructive' : ''}
                      />
                      {errors.shiftEnd && (
                        <p className="text-sm text-destructive mt-1">{errors.shiftEnd}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="space-y-4">
                <h3 className="text-base font-medium text-foreground border-b border-border pb-2">
                  {t('staff.additionalDetails')}
                </h3>
                
                {/* Profile Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('staff.profileImage')}
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-2xl">{formData.fullName?.[0]?.toUpperCase() || '?'}</span>
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        {imagePreview ? t('staff.changePhoto') : t('staff.uploadPhoto')}
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <textarea
                    value={formData.additionalDetails}
                    onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                    placeholder={t('staff.enterAdditionalDetails')}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions - Fixed at Bottom */}
            <div className={`flex-shrink-0 p-6 border-t border-border bg-background space-y-3 ${
              isMobile ? '' : 'rounded-bl-2xl'
            }`}>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                disabled={isSubmitting || isSaving}
              >
                {(isSubmitting || isSaving)
                  ? t('common.saving') 
                  : editingStaff 
                    ? t('staff.updateStaff') 
                    : t('staff.addStaff')
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full h-11"
                disabled={isSubmitting || isSaving}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}