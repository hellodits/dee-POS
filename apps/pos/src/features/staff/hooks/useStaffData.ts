import { useState, useEffect, useCallback } from 'react'
import { staffApi } from '@/lib/api'
import { Staff, StaffFilters, AttendanceRecord } from '../types'

interface UseStaffDataReturn {
  staff: Staff[]
  attendance: AttendanceRecord[]
  isLoading: boolean
  error: string | null
  addStaff: (staffData: FormData) => Promise<Staff | null>
  updateStaff: (id: string, staffData: FormData) => Promise<Staff | null>
  deleteStaff: (id: string) => Promise<boolean>
  getStaffById: (id: string) => Staff | undefined
  filterAndSortStaff: (filters: StaffFilters) => Staff[]
  refetch: () => void
  // Attendance
  fetchAttendance: (params?: { date?: string; staff_id?: string }) => Promise<void>
  addAttendance: (data: { staff_id: string; date: string; timings: string; status: string; notes?: string }) => Promise<boolean>
  updateAttendance: (id: string, data: { timings?: string; status?: string; notes?: string }) => Promise<boolean>
  deleteAttendance: (id: string) => Promise<boolean>
}

export function useStaffData(): UseStaffDataReturn {
  const [staff, setStaff] = useState<Staff[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await staffApi.getAll({ active_only: 'true' })
      
      if (response.data.success && response.data.data) {
        // Map API response to frontend Staff type
        const mappedStaff: Staff[] = (response.data.data as any[]).map(s => {
          return {
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
          }
        })
        setStaff(mappedStaff)
      }
    } catch (err: any) {
      console.error('Failed to fetch staff:', err)
      setError(err.response?.data?.error || 'Gagal memuat data staff')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const addStaff = async (formData: FormData): Promise<Staff | null> => {
    try {
      const response = await staffApi.create(formData)
      
      if (response.data.success && response.data.data) {
        const newStaff = response.data.data as any
        console.log('✅ Staff created with ID:', newStaff._id)
        const mappedStaff: Staff = {
          id: newStaff._id,
          fullName: newStaff.fullName,
          email: newStaff.email,
          phone: newStaff.phone,
          role: newStaff.role,
          salary: newStaff.salary,
          dateOfBirth: newStaff.dateOfBirth,
          age: newStaff.age,
          shiftStart: newStaff.shiftStart,
          shiftEnd: newStaff.shiftEnd,
          address: newStaff.address,
          additionalDetails: newStaff.additionalDetails || '',
          profileImage: newStaff.profileImage || '',
          createdAt: newStaff.createdAt,
          updatedAt: newStaff.updatedAt
        }
        // Update state immediately
        setStaff(prev => [...prev, mappedStaff])
        return mappedStaff
      }
      return null
    } catch (err: any) {
      console.error('Failed to add staff:', err)
      throw new Error(err.response?.data?.error || 'Gagal menambah staff')
    }
  }

  const updateStaff = async (id: string, formData: FormData): Promise<Staff | null> => {
    try {
      console.log('📝 Updating staff with ID:', id)
      
      // Validate ID format (MongoDB ObjectId is 24 hex characters)
      if (!id || id.length !== 24 || !/^[a-f0-9]{24}$/i.test(id)) {
        console.error('❌ Invalid staff ID format:', id)
        throw new Error('ID staff tidak valid. Silakan refresh halaman dan coba lagi.')
      }
      
      // Log what we're sending
      const hasImage = formData.has('profileImage')
      console.log('📤 Sending update request:', { hasImage, id })
      
      const response = await staffApi.update(id, formData)
      
      if (response.data.success && response.data.data) {
        const updatedData = response.data.data as any
        console.log('✅ Staff updated successfully:', updatedData._id)
        
        const mappedStaff: Staff = {
          id: updatedData._id,
          fullName: updatedData.fullName,
          email: updatedData.email,
          phone: updatedData.phone,
          role: updatedData.role,
          salary: updatedData.salary,
          dateOfBirth: updatedData.dateOfBirth,
          age: updatedData.age,
          shiftStart: updatedData.shiftStart,
          shiftEnd: updatedData.shiftEnd,
          address: updatedData.address,
          additionalDetails: updatedData.additionalDetails || '',
          profileImage: updatedData.profileImage || '',
          createdAt: updatedData.createdAt,
          updatedAt: updatedData.updatedAt
        }
        
        // Update state immediately without full refetch
        setStaff(prev => prev.map(s => s.id === id ? mappedStaff : s))
        
        // If this was just a photo update, log it
        if (hasImage && formData.has('profileImage')) {
          console.log('📸 Photo updated for staff:', mappedStaff.fullName, 'New URL:', mappedStaff.profileImage)
        }
        
        return mappedStaff
      }
      return null
    } catch (err: any) {
      console.error('❌ Failed to update staff:', err)
      throw new Error(err.response?.data?.error || err.message || 'Gagal mengupdate staff')
    }
  }

  const deleteStaff = async (id: string): Promise<boolean> => {
    try {
      const response = await staffApi.delete(id)
      
      if (response.data.success) {
        setStaff(prev => prev.filter(s => s.id !== id))
        return true
      }
      return false
    } catch (err: any) {
      console.error('Failed to delete staff:', err)
      throw new Error(err.response?.data?.error || 'Gagal menghapus staff')
    }
  }

  const getStaffById = (id: string): Staff | undefined => {
    return staff.find(s => s.id === id)
  }

  const filterAndSortStaff = (filters: StaffFilters): Staff[] => {
    return staff
      .filter(staffMember => {
        const matchesSearch = !filters.search || 
          staffMember.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
          staffMember.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          staffMember.role.toLowerCase().includes(filters.search.toLowerCase())
        
        const matchesRole = !filters.role || staffMember.role === filters.role
        
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
  }

  // Attendance functions
  const fetchAttendance = useCallback(async (params?: { date?: string; staff_id?: string }) => {
    try {
      console.log('📋 Fetching attendance with params:', params)
      const response = await staffApi.getAttendance(params)
      
      if (response.data.success && response.data.data) {
        const mappedAttendance: AttendanceRecord[] = (response.data.data as any[]).map(a => ({
          id: a._id,
          staffId: a.staff_id?._id || a.staff_id,
          staffName: a.staff_id?.fullName || 'Unknown',
          staffRole: a.staff_id?.role || '',
          staffImage: a.staff_id?.profileImage || '',
          date: a.date.split('T')[0],
          timings: a.timings,
          status: a.status
        }))
        console.log('✅ Attendance fetched:', mappedAttendance.length, 'records')
        setAttendance(mappedAttendance)
      }
    } catch (err: any) {
      console.error('❌ Failed to fetch attendance:', err)
    }
  }, [])

  const addAttendance = async (data: { staff_id: string; date: string; timings: string; status: string; notes?: string }): Promise<boolean> => {
    try {
      console.log('➕ Adding attendance:', data)
      const response = await staffApi.createAttendance(data)
      
      if (response.data.success) {
        console.log('✅ Attendance added successfully')
        await fetchAttendance({ date: data.date })
        return true
      }
      return false
    } catch (err: any) {
      console.error('❌ Failed to add attendance:', err)
      throw new Error(err.response?.data?.error || 'Gagal menambah absensi')
    }
  }

  const updateAttendance = async (id: string, data: { timings?: string; status?: string; notes?: string }): Promise<boolean> => {
    try {
      console.log('📝 Updating attendance:', id, data)
      const response = await staffApi.updateAttendance(id, data)
      
      if (response.data.success) {
        console.log('✅ Attendance updated successfully')
        // Update local state
        setAttendance(prev => prev.map(a => 
          a.id === id ? { ...a, ...data } : a
        ))
        return true
      }
      return false
    } catch (err: any) {
      console.error('❌ Failed to update attendance:', err)
      throw new Error(err.response?.data?.error || 'Gagal mengupdate absensi')
    }
  }

  const deleteAttendance = async (id: string): Promise<boolean> => {
    try {
      const response = await staffApi.deleteAttendance(id)
      
      if (response.data.success) {
        setAttendance(prev => prev.filter(a => a.id !== id))
        return true
      }
      return false
    } catch (err: any) {
      console.error('Failed to delete attendance:', err)
      throw new Error(err.response?.data?.error || 'Gagal menghapus absensi')
    }
  }

  return {
    staff,
    attendance,
    isLoading,
    error,
    addStaff,
    updateStaff,
    deleteStaff,
    getStaffById,
    filterAndSortStaff,
    refetch: fetchStaff,
    fetchAttendance,
    addAttendance,
    updateAttendance,
    deleteAttendance
  }
}
