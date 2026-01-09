import { useTranslation } from 'react-i18next'
import { Edit, Trash2, MapPin, Phone, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Branch } from '@/lib/api'

interface BranchListProps {
  branches: Branch[]
  onEdit: (branch: Branch) => void
  onDelete: (branchId: string) => void
  onToggleActive: (branch: Branch) => void
  isMobile: boolean
}

export function BranchList({ branches, onEdit, onDelete, onToggleActive, isMobile }: BranchListProps) {
  const { t } = useTranslation()

  if (branches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('branches.noBranches')}</p>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {branches.map(branch => (
          <div key={branch._id} className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{branch.name}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                  branch.is_active 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {branch.is_active ? t('branches.active') : t('branches.inactive')}
                </span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onToggleActive(branch)} title={branch.is_active ? t('branches.deactivate') : t('branches.activate')}>
                  {branch.is_active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(branch)} title={t('common.edit')}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(branch._id)} className="text-destructive hover:text-destructive" title={t('common.delete')}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{branch.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('branches.branchName')}</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('branches.address')}</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('branches.phone')}</th>
            <th className="text-center py-3 px-4 font-medium text-muted-foreground">{t('branches.status')}</th>
            <th className="text-center py-3 px-4 font-medium text-muted-foreground">{t('branches.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {branches.map(branch => (
            <tr key={branch._id} className="border-b border-border hover:bg-muted/50">
              <td className="py-3 px-4 font-medium text-foreground">{branch.name}</td>
              <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">{branch.address}</td>
              <td className="py-3 px-4 text-muted-foreground">{branch.phone}</td>
              <td className="py-3 px-4 text-center">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  branch.is_active 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {branch.is_active ? t('branches.active') : t('branches.inactive')}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onToggleActive(branch)} title={branch.is_active ? t('branches.deactivate') : t('branches.activate')}>
                    {branch.is_active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(branch)} title={t('common.edit')}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(branch._id)} className="text-destructive hover:text-destructive" title={t('common.delete')}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
