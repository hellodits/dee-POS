import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Staff, StaffFilters, SortOption, StaffRole } from '../types'

interface StaffListProps {
  staff: Staff[]
  filters: StaffFilters
  onEdit: (staff: Staff) => void
  onDelete: (staffId: string) => void
  onSortChange: (sortBy: SortOption) => void
  onRoleFilter: (role?: StaffRole) => void
  isMobile: boolean
}

export function StaffList({ 
  staff, 
  filters, 
  onEdit, 
  onDelete, 
  onSortChange, 
  onRoleFilter,
  isMobile 
}: StaffListProps) {
  const { t } = useTranslation()
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showRoleFilter, setShowRoleFilter] = useState(false)

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name', label: t('staff.sortByName') },
    { value: 'role', label: t('staff.sortByRole') },
    { value: 'salary', label: t('staff.sortBySalary') },
    { value: 'age', label: t('staff.sortByAge') },
    { value: 'recent', label: t('staff.sortByRecent') }
  ]

  const roleOptions: StaffRole[] = ['Manager', 'Cashier', 'Chef', 'Waiter', 'Cleaner', 'Security']

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getRoleColor = (role: StaffRole) => {
    const colors = {
      Manager: 'bg-purple-100 text-purple-800',
      Cashier: 'bg-blue-100 text-blue-800',
      Chef: 'bg-orange-100 text-orange-800',
      Waiter: 'bg-green-100 text-green-800',
      Cleaner: 'bg-gray-100 text-gray-800',
      Security: 'bg-red-100 text-red-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (isMobile) {
    // Mobile Card View
    return (
      <div className="space-y-4">
        {/* Mobile Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-xs"
            >
              {t('staff.sortBy')}: {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
            </Button>
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[150px]">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value)
                      setShowSortMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                      filters.sortBy === option.value ? 'bg-accent' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleFilter(!showRoleFilter)}
              className="text-xs"
            >
              {filters.role ? filters.role : t('staff.allRoles')}
            </Button>
            {showRoleFilter && (
              <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onRoleFilter(undefined)
                    setShowRoleFilter(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                    !filters.role ? 'bg-accent' : ''
                  }`}
                >
                  {t('staff.allRoles')}
                </button>
                {roleOptions.map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleFilter(role)
                      setShowRoleFilter(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                      filters.role === role ? 'bg-accent' : ''
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Staff Cards */}
        <div className="space-y-3">
          {staff.map(member => (
            <div key={member.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {member.profileImage ? (
                    <img 
                      src={member.profileImage} 
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {member.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{member.fullName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('staff.salary')}:</span>
                  <p className="font-medium">{formatCurrency(member.salary)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('staff.age')}:</span>
                  <p className="font-medium">{member.age}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('staff.shift')}:</span>
                  <p className="font-medium">{member.shiftStart} - {member.shiftEnd}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('staff.phone')}:</span>
                  <p className="font-medium text-xs">{member.phone}</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-border">
                <Link to={`/staff/${member.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    {t('common.view')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(member)}
                  className="flex-1 text-xs"
                >
                  {t('common.edit')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete(member.id)}
                  className="text-destructive hover:text-destructive text-xs"
                >
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Desktop Table View
  return (
    <div className="space-y-4">
      {/* Desktop Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            {t('staff.sortBy')}: {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
          </Button>
          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[180px]">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value)
                    setShowSortMenu(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                    filters.sortBy === option.value ? 'bg-accent' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRoleFilter(!showRoleFilter)}
          >
            {filters.role ? filters.role : t('staff.allRoles')}
          </Button>
          {showRoleFilter && (
            <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[140px]">
              <button
                onClick={() => {
                  onRoleFilter(undefined)
                  setShowRoleFilter(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                  !filters.role ? 'bg-accent' : ''
                }`}
              >
                {t('staff.allRoles')}
              </button>
              {roleOptions.map(role => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleFilter(role)
                    setShowRoleFilter(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                    filters.role === role ? 'bg-accent' : ''
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.staff')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.role')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.salary')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.age')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.shift')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id} className="border-b border-border hover:bg-accent/50">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {member.profileImage ? (
                        <img 
                          src={member.profileImage} 
                          alt={member.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {member.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.fullName}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-4 px-4 font-medium text-foreground">
                  {formatCurrency(member.salary)}
                </td>
                <td className="py-4 px-4 text-foreground">
                  {member.age}
                </td>
                <td className="py-4 px-4 text-foreground">
                  {member.shiftStart} - {member.shiftEnd}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Link to={`/staff/${member.id}`}>
                      <Button variant="outline" size="sm">
                        {t('common.view')}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(member)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('staff.noStaffFound')}</p>
        </div>
      )}
    </div>
  )
}