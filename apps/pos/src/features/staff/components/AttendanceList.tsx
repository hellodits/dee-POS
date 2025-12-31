import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2, Trash2, Calendar, Clock, LogIn, LogOut, Edit2, UserCheck, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { staffApi } from '@/lib/api'
import { AttendanceStatus } from '../types'
import * as XLSX from 'xlsx'

interface AttendanceRecord {
  id: string
  staffId: string
  staffName: string
  staffRole: string
  staffImage: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
}

interface Staff { id: string; fullName: string; role: string; profileImage?: string }

interface StaffWorkSummary {
  staffId: string
  staffName: string
  staffRole: string
  staffImage: string
  totalDays: number
  presentDays: number
  absentDays: number
  halfShiftDays: number
  leaveDays: number
  totalHours: number
}

interface AttendanceListProps { isMobile: boolean }

export function AttendanceList({ }: AttendanceListProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'daily' | 'summary' | 'clockin'>('daily')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clockingStaffId, setClockingStaffId] = useState<string | null>(null)
  const [form, setForm] = useState({ staff_id: '', date: '', check_in: '', check_out: '', status: 'Present' })
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID'))

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('id-ID')), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchStaff = useCallback(async () => {
    try {
      const response = await staffApi.getAll({ active_only: 'true' })
      if (response.data.success && response.data.data) {
        const staffData = (response.data.data as any[]).map(s => ({ 
          id: s._id, 
          fullName: s.fullName, 
          role: s.role, 
          profileImage: s.profileImage 
        }))
        setStaff(staffData)
      }
    } catch (err) { console.error('Failed to fetch staff:', err) }
  }, [])

  const parseAttendance = (a: any): AttendanceRecord => ({
    id: a._id,
    staffId: a.staff_id?._id || a.staff_id,
    staffName: a.staff_id?.fullName || 'Unknown',
    staffRole: a.staff_id?.role || '',
    staffImage: a.staff_id?.profileImage || '',
    date: a.date?.split('T')[0] || '',
    checkIn: a.checkIn ? new Date(a.checkIn).toTimeString().slice(0, 5) : null,
    checkOut: a.checkOut ? new Date(a.checkOut).toTimeString().slice(0, 5) : null,
    status: a.status
  })

  const fetchAttendance = useCallback(async (date?: string) => {
    setIsLoading(true)
    try {
      const response = await staffApi.getAttendance({ date })
      if (response.data.success && response.data.data) {
        setAttendance((response.data.data as any[]).map(parseAttendance))
      }
    } catch (err) { console.error('Failed to fetch attendance:', err) }
    finally { setIsLoading(false) }
  }, [])

  const fetchAttendanceRange = useCallback(async (from: string, to: string) => {
    setIsLoading(true)
    try {
      const response = await staffApi.getAttendance({ date_from: from, date_to: to } as any)
      if (response.data.success && response.data.data) {
        setAllAttendance((response.data.data as any[]).map(parseAttendance))
      }
    } catch (err) { console.error('Failed to fetch attendance range:', err) }
    finally { setIsLoading(false) }
  }, [])

  const fetchTodayAttendance = useCallback(async () => {
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await staffApi.getAttendance({ date: today })
      if (response.data.success && response.data.data) {
        const parsed = (response.data.data as any[]).map(parseAttendance)
        setAttendance(parsed)
      }
    } catch (err) { console.error('Failed to fetch today attendance:', err) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])
  
  useEffect(() => {
    if (viewMode === 'daily') {
      fetchAttendance(selectedDate)
    } else if (viewMode === 'summary') {
      fetchAttendanceRange(dateFrom, dateTo)
    } else {
      fetchTodayAttendance()
    }
  }, [viewMode, selectedDate, dateFrom, dateTo, fetchAttendance, fetchAttendanceRange, fetchTodayAttendance])

  const calculateHours = (checkIn: string | null, checkOut: string | null): number => {
    if (!checkIn || !checkOut) return 0
    const [inH, inM] = checkIn.split(':').map(Number)
    const [outH, outM] = checkOut.split(':').map(Number)
    return Math.max(0, (outH + outM / 60) - (inH + inM / 60))
  }

  const getWorkSummary = (): StaffWorkSummary[] => {
    const summaryMap = new Map<string, StaffWorkSummary>()
    allAttendance.forEach(record => {
      if (!summaryMap.has(record.staffId)) {
        summaryMap.set(record.staffId, {
          staffId: record.staffId, staffName: record.staffName, staffRole: record.staffRole,
          staffImage: record.staffImage, totalDays: 0, presentDays: 0, absentDays: 0,
          halfShiftDays: 0, leaveDays: 0, totalHours: 0
        })
      }
      const summary = summaryMap.get(record.staffId)!
      summary.totalDays++
      if (record.status === 'Present') { summary.presentDays++; summary.totalHours += calculateHours(record.checkIn, record.checkOut) }
      else if (record.status === 'Absent') { summary.absentDays++ }
      else if (record.status === 'Half Shift') { summary.halfShiftDays++; summary.totalHours += calculateHours(record.checkIn, record.checkOut) }
      else if (record.status === 'Leave') { summary.leaveDays++ }
    })
    return Array.from(summaryMap.values()).sort((a, b) => b.totalHours - a.totalHours)
  }

  const handleClockIn = async (staffId: string) => {
    setClockingStaffId(staffId)
    try {
      console.log('🕐 Attempting clock-in for staff:', staffId)
      const response = await staffApi.clockIn(staffId)
      console.log('✅ Clock-in response:', response.data)
      if (response.data.success) {
        alert(response.data.message || 'Berhasil absen masuk!')
        // Refresh attendance data for all views
        await fetchTodayAttendance()
        // Also refresh daily view if date is today
        const today = new Date().toISOString().split('T')[0]
        if (selectedDate === today) {
          await fetchAttendance(today)
        }
      }
    } catch (err: any) { 
      console.error('❌ Clock-in error:', err.response?.data || err.message)
      alert(err.response?.data?.error || 'Gagal absen masuk') 
    }
    finally { setClockingStaffId(null) }
  }

  const handleClockOut = async (staffId: string) => {
    setClockingStaffId(staffId)
    try {
      const response = await staffApi.clockOut(staffId)
      if (response.data.success) {
        alert(response.data.message || 'Berhasil absen keluar!')
        // Refresh attendance data for all views
        await fetchTodayAttendance()
        // Also refresh daily view if date is today
        const today = new Date().toISOString().split('T')[0]
        if (selectedDate === today) {
          await fetchAttendance(today)
        }
      }
    } catch (err: any) { 
      console.error('❌ Clock-out error:', err.response?.data || err.message)
      alert(err.response?.data?.error || 'Gagal absen keluar') 
    }
    finally { setClockingStaffId(null) }
  }

  const handleDeleteAttendance = async (recordId: string) => {
    if (!window.confirm('Hapus data absensi ini?')) return
    try {
      await staffApi.deleteAttendance(recordId)
      setAttendance(prev => prev.filter(a => a.id !== recordId))
    } catch (err: any) { alert(err.response?.data?.error || 'Gagal menghapus absensi') }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (editingRecord) {
        await staffApi.updateAttendance(editingRecord.id, { check_in: form.check_in || undefined, check_out: form.check_out || undefined, status: form.status })
      } else {
        await staffApi.createAttendance({ staff_id: form.staff_id, date: form.date, check_in: form.check_in || undefined, check_out: form.check_out || undefined, status: form.status })
      }
      setIsAddModalOpen(false)
      setEditingRecord(null)
      fetchAttendance(selectedDate)
    } catch (err: any) { alert(err.response?.data?.error || 'Gagal menyimpan absensi') }
    finally { setIsSubmitting(false) }
  }

  const openAddModal = () => { setForm({ staff_id: '', date: selectedDate, check_in: '08:00', check_out: '', status: 'Present' }); setEditingRecord(null); setIsAddModalOpen(true) }
  const openEditModal = (record: AttendanceRecord) => { setForm({ staff_id: record.staffId, date: record.date, check_in: record.checkIn || '', check_out: record.checkOut || '', status: record.status }); setEditingRecord(record); setIsAddModalOpen(true) }

  const filteredAttendance = attendance.filter(item => {
    const matchSearch = !searchTerm || item.staffName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  const getStatusColor = (status: AttendanceStatus) => {
    const colors: Record<string, string> = { 'Present': 'bg-green-100 text-green-800', 'Absent': 'bg-red-100 text-red-800', 'Half Shift': 'bg-blue-100 text-blue-800', 'Leave': 'bg-yellow-100 text-yellow-800' }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatHours = (h: number) => h.toFixed(1) + ' jam'
  const statusCounts = { present: attendance.filter(a => a.status === 'Present').length, absent: attendance.filter(a => a.status === 'Absent').length, halfShift: attendance.filter(a => a.status === 'Half Shift').length, leave: attendance.filter(a => a.status === 'Leave').length }

  // Export functions
  const exportDailyToExcel = () => {
    const data = filteredAttendance.map(record => ({
      'Nama': record.staffName,
      'Jabatan': record.staffRole,
      'Tanggal': selectedDate,
      'Jam Masuk': (record.status === 'Present' || record.status === 'Half Shift') ? (record.checkIn || '-') : '-',
      'Jam Keluar': (record.status === 'Present' || record.status === 'Half Shift') ? (record.checkOut || '-') : '-',
      'Durasi (Jam)': (record.status === 'Present' || record.status === 'Half Shift') ? calculateHours(record.checkIn, record.checkOut).toFixed(1) : '-',
      'Status': record.status === 'Present' ? 'Hadir' : record.status === 'Absent' ? 'Tidak Hadir' : record.status === 'Half Shift' ? 'Setengah Hari' : 'Cuti'
    }))
    
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Absensi Harian')
    
    // Auto-size columns
    const colWidths = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }]
    ws['!cols'] = colWidths
    
    XLSX.writeFile(wb, `Absensi_Harian_${selectedDate}.xlsx`)
  }

  const exportSummaryToExcel = () => {
    const summaryData = getWorkSummary()
    const data = summaryData.map(summary => ({
      'Nama': summary.staffName,
      'Jabatan': summary.staffRole,
      'Hadir (Hari)': summary.presentDays,
      'Tidak Hadir (Hari)': summary.absentDays,
      'Setengah Hari': summary.halfShiftDays,
      'Cuti (Hari)': summary.leaveDays,
      'Total Jam Kerja': summary.totalHours.toFixed(1)
    }))
    
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi')
    
    // Auto-size columns
    const colWidths = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }]
    ws['!cols'] = colWidths
    
    XLSX.writeFile(wb, `Rekap_Absensi_${dateFrom}_sd_${dateTo}.xlsx`)
  }

  // Get staff attendance status for clock in view
  const getStaffAttendanceStatus = (staffId: string) => {
    const found = attendance.find(a => a.staffId === staffId)
    // Only return attendance if status is Present or Half Shift (actual work attendance)
    if (found && (found.status === 'Present' || found.status === 'Half Shift')) {
      return found
    }
    return null
  }

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="ml-2">Memuat...</span></div>

  return (
    <div className="space-y-4">
      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingRecord ? 'Edit Absensi' : 'Tambah Absensi'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-4">
              {!editingRecord && (<div><label className="block text-sm font-medium mb-1">Staff *</label><select value={form.staff_id} onChange={(e) => setForm(p => ({ ...p, staff_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" required><option value="">Pilih Staff</option>{staff.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select></div>)}
              {!editingRecord && (<div><label className="block text-sm font-medium mb-1">Tanggal *</label><Input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} required /></div>)}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1"><LogIn className="w-4 h-4 inline mr-1" />Jam Masuk</label><Input type="time" value={form.check_in} onChange={(e) => setForm(p => ({ ...p, check_in: e.target.value }))} /></div>
                <div><label className="block text-sm font-medium mb-1"><LogOut className="w-4 h-4 inline mr-1" />Jam Keluar</label><Input type="time" value={form.check_out} onChange={(e) => setForm(p => ({ ...p, check_out: e.target.value }))} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background"><option value="Present">Hadir</option><option value="Absent">Tidak Hadir</option><option value="Half Shift">Setengah Hari</option><option value="Leave">Cuti</option></select></div>
              {form.check_in && form.check_out && <div className="bg-muted p-3 rounded-md text-center"><span className="text-sm text-muted-foreground">Durasi: </span><span className="font-semibold">{formatHours(calculateHours(form.check_in, form.check_out))}</span></div>}
              <div className="flex space-x-3 pt-4"><Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingRecord(null) }} className="flex-1">Batal</Button><Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button></div>
            </form>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button onClick={() => setViewMode('clockin')} className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + (viewMode === 'clockin' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}><UserCheck className="w-4 h-4 inline mr-2" />Absen</button>
        <button onClick={() => setViewMode('daily')} className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + (viewMode === 'daily' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}><Calendar className="w-4 h-4 inline mr-2" />Harian</button>
        <button onClick={() => setViewMode('summary')} className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + (viewMode === 'summary' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}><Clock className="w-4 h-4 inline mr-2" />Rekap</button>
      </div>

      {viewMode === 'clockin' && (
        <>
          {/* Clock In/Out View */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Waktu Sekarang</p>
            <p className="text-4xl font-bold text-primary">{currentTime}</p>
            <p className="text-sm text-muted-foreground mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(s => {
              const att = getStaffAttendanceStatus(s.id)
              // Check if staff has any attendance record today (including non-working status)
              const fullAttendance = attendance.find(a => a.staffId === s.id)
              const hasCheckedIn = !!att?.checkIn
              const hasCheckedOut = !!att?.checkOut
              const isClocking = clockingStaffId === s.id

              return (
                <div key={s.id} className="bg-card border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {s.profileImage ? <img src={s.profileImage} className="w-full h-full object-cover" alt="" /> : <span className="text-lg font-semibold">{s.fullName.charAt(0)}</span>}
                    </div>
                    <div>
                      <p className="font-semibold">{s.fullName}</p>
                      <p className="text-sm text-muted-foreground">{s.role}</p>
                    </div>
                  </div>

                  {/* Show non-working status (Absent/Leave) */}
                  {fullAttendance && (fullAttendance.status === 'Absent' || fullAttendance.status === 'Leave') ? (
                    <div className="text-center py-4">
                      <div className={`inline-flex px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(fullAttendance.status)}`}>
                        {fullAttendance.status === 'Absent' ? 'Tidak Hadir' : 'Cuti'}
                      </div>
                    </div>
                  ) : att ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Masuk:</span>
                        <span className="font-medium text-green-600">{att.checkIn || '-'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Keluar:</span>
                        <span className="font-medium text-red-600">{att.checkOut || '-'}</span>
                      </div>
                      {hasCheckedIn && hasCheckedOut && (
                        <div className="flex justify-between text-sm border-t pt-2">
                          <span className="text-muted-foreground">Durasi:</span>
                          <span className="font-semibold text-primary">{formatHours(calculateHours(att.checkIn, att.checkOut))}</span>
                        </div>
                      )}
                      {hasCheckedIn && !hasCheckedOut && (
                        <Button onClick={() => handleClockOut(s.id)} className="w-full bg-red-500 hover:bg-red-600" disabled={isClocking}>
                          {isClocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
                          Absen Keluar
                        </Button>
                      )}
                      {hasCheckedIn && hasCheckedOut && (
                        <div className="text-center py-2 bg-green-50 rounded-md">
                          <span className="text-green-600 text-sm font-medium">Selesai</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button onClick={() => handleClockIn(s.id)} className="w-full bg-green-500 hover:bg-green-600" disabled={isClocking}>
                      {isClocking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                      Absen Masuk
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {viewMode === 'daily' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center flex-wrap gap-2">
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40" />
              <Input placeholder="Cari staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-48" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm"><option value="all">Semua</option><option value="Present">Hadir</option><option value="Absent">Tidak Hadir</option><option value="Half Shift">Setengah Hari</option><option value="Leave">Cuti</option></select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportDailyToExcel} disabled={filteredAttendance.length === 0}>
                <Download className="w-4 h-4 mr-2" />Export XLS
              </Button>
              <Button onClick={openAddModal}><Plus className="w-4 h-4 mr-2" />Tambah</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-green-700">{statusCounts.present}</p><p className="text-sm text-green-600">Hadir</p></div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-red-700">{statusCounts.absent}</p><p className="text-sm text-red-600">Tidak Hadir</p></div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-blue-700">{statusCounts.halfShift}</p><p className="text-sm text-blue-600">Setengah Hari</p></div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-yellow-700">{statusCounts.leave}</p><p className="text-sm text-yellow-600">Cuti</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-3 px-4">Nama</th><th className="text-left py-3 px-4">Masuk</th><th className="text-left py-3 px-4">Keluar</th><th className="text-left py-3 px-4">Durasi</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Aksi</th></tr></thead>
              <tbody>
                {filteredAttendance.map(record => (
                  <tr key={record.id} className="border-b hover:bg-accent/50">
                    <td className="py-4 px-4"><div className="flex items-center space-x-3"><div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">{record.staffImage ? <img src={record.staffImage} className="w-full h-full object-cover" alt="" /> : <span>{record.staffName?.charAt(0)}</span>}</div><div><p className="font-medium">{record.staffName}</p><p className="text-sm text-muted-foreground">{record.staffRole}</p></div></div></td>
                    <td className="py-4 px-4">{(record.status === 'Present' || record.status === 'Half Shift') && record.checkIn ? <span className="text-green-600 font-medium">{record.checkIn}</span> : <span className="text-muted-foreground">-</span>}</td>
                    <td className="py-4 px-4">{(record.status === 'Present' || record.status === 'Half Shift') && record.checkOut ? <span className="text-red-600 font-medium">{record.checkOut}</span> : <span className="text-muted-foreground">-</span>}</td>
                    <td className="py-4 px-4">{(record.status === 'Present' || record.status === 'Half Shift') ? formatHours(calculateHours(record.checkIn, record.checkOut)) : '-'}</td>
                    <td className="py-4 px-4"><span className={'px-2 py-1 rounded-full text-xs ' + getStatusColor(record.status)}>{record.status}</span></td>
                    <td className="py-4 px-4"><div className="flex items-center space-x-1"><button onClick={() => openEditModal(record)} className="p-1 text-primary hover:bg-primary/10 rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => handleDeleteAttendance(record.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAttendance.length === 0 && <div className="text-center py-12 text-muted-foreground">Tidak ada data</div>}
        </>
      )}

      {viewMode === 'summary' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center flex-wrap gap-3">
              <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Dari:</span><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" /></div>
              <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Sampai:</span><Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" /></div>
            </div>
            <Button variant="outline" onClick={exportSummaryToExcel} disabled={getWorkSummary().length === 0}>
              <Download className="w-4 h-4 mr-2" />Export XLS
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-3 px-4">Staff</th><th className="text-center py-3 px-4">Hadir</th><th className="text-center py-3 px-4">Tidak Hadir</th><th className="text-center py-3 px-4">Setengah Hari</th><th className="text-center py-3 px-4">Cuti</th><th className="text-right py-3 px-4">Total Jam</th></tr></thead>
              <tbody>
                {getWorkSummary().map(summary => (
                  <tr key={summary.staffId} className="border-b hover:bg-accent/50">
                    <td className="py-4 px-4"><div className="flex items-center space-x-3"><div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">{summary.staffImage ? <img src={summary.staffImage} className="w-full h-full object-cover" alt="" /> : <span>{summary.staffName?.charAt(0)}</span>}</div><div><p className="font-medium">{summary.staffName}</p><p className="text-sm text-muted-foreground">{summary.staffRole}</p></div></div></td>
                    <td className="py-4 px-4 text-center"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{summary.presentDays}</span></td>
                    <td className="py-4 px-4 text-center"><span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">{summary.absentDays}</span></td>
                    <td className="py-4 px-4 text-center"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{summary.halfShiftDays}</span></td>
                    <td className="py-4 px-4 text-center"><span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">{summary.leaveDays}</span></td>
                    <td className="py-4 px-4 text-right font-semibold text-primary">{formatHours(summary.totalHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {getWorkSummary().length === 0 && <div className="text-center py-12 text-muted-foreground">Tidak ada data</div>}
        </>
      )}
    </div>
  )
}