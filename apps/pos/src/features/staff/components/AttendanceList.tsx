import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockStaffData, mockAttendanceData } from '../data/mockStaffData'
import { AttendanceStatus } from '../types'

interface AttendanceListProps {
  isMobile: boolean
}

export function AttendanceList({ isMobile }: AttendanceListProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('name')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [attendanceData, setAttendanceData] = useState(mockAttendanceData)

  // Combine staff data with attendance data
  const attendanceWithStaff = attendanceData.map(attendance => {
    const staff = mockStaffData.find(s => s.id === attendance.staffId)
    return {
      ...attendance,
      staff
    }
  }).filter(item => item.staff) // Only include records with valid staff

  // Filter and sort attendance data
  const filteredAttendance = attendanceWithStaff
    .filter(item => {
      if (!searchTerm) return true
      return item.staff!.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.staff!.role.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.staff!.fullName.localeCompare(b.staff!.fullName)
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Absent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Half Shift':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Leave':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return t('staff.present')
      case 'Absent':
        return t('staff.absent')
      case 'Half Shift':
        return t('staff.halfShift')
      case 'Leave':
        return t('staff.leave')
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleStatusChange = (recordId: string, newStatus: AttendanceStatus) => {
    setAttendanceData(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, status: newStatus }
          : record
      )
    )
  }

  const handleEditAttendance = (recordId: string) => {
    // TODO: Open edit attendance modal/drawer
    console.log('Edit attendance:', recordId)
  }

  const handleDeleteAttendance = (recordId: string) => {
    if (window.confirm(t('staff.confirmDeleteAttendance'))) {
      setAttendanceData(prev => prev.filter(record => record.id !== recordId))
    }
  }

  const sortOptions = [
    { value: 'name' as const, label: t('staff.sortByName') },
    { value: 'date' as const, label: t('staff.sortByDate') },
    { value: 'status' as const, label: t('staff.sortByStatus') }
  ]

  if (isMobile) {
    // Mobile Card View
    return (
      <div className="space-y-4">
        {/* Mobile Controls */}
        <div className="flex flex-col space-y-3">
          <Input
            placeholder={t('staff.searchAttendance')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full text-xs"
              >
                {t('staff.sortBy')}: {sortOptions.find(opt => opt.value === sortBy)?.label}
              </Button>
              {showSortMenu && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 w-full">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                        sortBy === option.value ? 'bg-accent' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t('staff.addAttendance')}
            </Button>
          </div>
        </div>

        {/* Mobile Attendance Cards */}
        <div className="space-y-3">
          {filteredAttendance.map(record => (
            <div key={record.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {record.staff!.profileImage ? (
                      <img 
                        src={record.staff!.profileImage} 
                        alt={record.staff!.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {record.staff!.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{record.staff!.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{record.staff!.role}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                  {getStatusText(record.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('staff.date')}:</span>
                  <p className="font-medium">{formatDate(record.date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('staff.timings')}:</span>
                  <p className="font-medium">{record.timings}</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => handleEditAttendance(record.id)}
                >
                  {t('common.edit')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive text-xs"
                  onClick={() => handleDeleteAttendance(record.id)}
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

  // Desktop Table View - Matching the design
  return (
    <div className="space-y-4">
      {/* Desktop Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder={t('staff.searchAttendance')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              {t('staff.sortBy')}: {sortOptions.find(opt => opt.value === sortBy)?.label}
            </Button>
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[180px]">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setShowSortMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${
                      sortBy === option.value ? 'bg-accent' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {t('staff.addAttendance')}
        </Button>
      </div>

      {/* Desktop Table - Matching the design exactly */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground w-20">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.id')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.name')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.date')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.timings')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('staff.status')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map(record => (
              <tr key={record.id} className="border-b border-border hover:bg-accent/50">
                <td className="py-4 px-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-foreground">#{record.staffId}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {record.staff!.profileImage ? (
                        <img 
                          src={record.staff!.profileImage} 
                          alt={record.staff!.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {record.staff!.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{record.staff!.fullName}</p>
                      <p className="text-sm text-muted-foreground">{record.staff!.role}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">
                  {formatDate(record.date)}
                </td>
                <td className="py-4 px-4 text-foreground">
                  {record.timings}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {/* Status Buttons - Matching the design */}
                    <button
                      onClick={() => handleStatusChange(record.id, 'Present')}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        record.status === 'Present' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-50'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(record.id, 'Absent')}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        record.status === 'Absent' 
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-yellow-50'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleStatusChange(record.id, 'Half Shift')}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        record.status === 'Half Shift' 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50'
                      }`}
                    >
                      Half Shift
                    </button>
                    <button
                      onClick={() => handleStatusChange(record.id, 'Leave')}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        record.status === 'Leave' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-red-50'
                      }`}
                    >
                      Leave
                    </button>
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditAttendance(record.id)}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors ml-2"
                      title={t('common.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAttendance.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('staff.noAttendanceFound')}</p>
        </div>
      )}
    </div>
  )
}