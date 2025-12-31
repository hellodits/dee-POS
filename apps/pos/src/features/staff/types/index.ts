export interface Staff {
  id: string
  fullName: string
  email: string
  phone: string
  role: StaffRole
  salary: number
  dateOfBirth: string
  age: number
  shiftStart: string
  shiftEnd: string
  address: string
  additionalDetails?: string
  profileImage?: string
  createdAt: string
  updatedAt: string
}

export type StaffRole = 'Manager' | 'Cashier' | 'Chef' | 'Waiter' | 'Cleaner' | 'Security'

export interface StaffFormData {
  fullName: string
  email: string
  phone: string
  role: StaffRole
  salary: string
  dateOfBirth: string
  shiftStart: string
  shiftEnd: string
  address: string
  additionalDetails: string
  profileImage?: File | null
}

export interface AttendanceRecord {
  id: string
  staffId: string
  staffName?: string
  staffRole?: string
  staffImage?: string
  date: string
  timings: string
  status: AttendanceStatus
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Shift' | 'Leave'

export type SortOption = 'name' | 'role' | 'salary' | 'age' | 'recent'

export interface StaffFilters {
  sortBy: SortOption
  role?: StaffRole
  search?: string
}