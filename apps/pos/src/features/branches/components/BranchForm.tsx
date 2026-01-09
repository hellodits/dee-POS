import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Branch } from '@/lib/api'

interface BranchFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; address: string; phone: string }) => void
  editingBranch: Branch | null
  isSaving: boolean
}

export function BranchForm({ isOpen, onClose, onSave, editingBranch, isSaving }: BranchFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingBranch) {
      setFormData({
        name: editingBranch.name,
        address: editingBranch.address,
        phone: editingBranch.phone
      })
    } else {
      setFormData({ name: '', address: '', phone: '' })
    }
    setErrors({})
  }, [editingBranch, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = t('branches.nameRequired')
    if (!formData.address.trim()) newErrors.address = t('branches.addressRequired')
    if (!formData.phone.trim()) newErrors.phone = t('branches.phoneRequired')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {editingBranch ? t('branches.editBranch') : t('branches.addBranch')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('branches.branchName')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('branches.namePlaceholder')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('branches.address')} *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder={t('branches.addressPlaceholder')}
              className={errors.address ? 'border-destructive' : ''}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('branches.phone')} *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder={t('branches.phonePlaceholder')}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('branches.saving')}
                </>
              ) : (
                editingBranch ? t('branches.saveChanges') : t('branches.addBranch')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
