import { useState } from 'react'
import { Staff, StaffFilters } from '../types'
import { mockStaffData } from '../data/mockStaffData'

export function useStaffData() {
  const [staff, setStaff] = useState<Staff[]>(mockStaffData)

  const addStaff = (staffData: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStaff: Staff = {
      ...staffData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setStaff(prev => [...prev, newStaff])
    return newStaff
  }

  const updateStaff = (id: string, staffData: Partial<Staff>) => {
    setStaff(prev => prev.map(staff => 
      staff.id === id 
        ? { ...staff, ...staffData, updatedAt: new Date().toISOString() }
        : staff
    ))
  }

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(staff => staff.id !== id))
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

  return {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    getStaffById,
    filterAndSortStaff
  }
}