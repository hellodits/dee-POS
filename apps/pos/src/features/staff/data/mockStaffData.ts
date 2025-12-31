import { Staff, AttendanceRecord } from '../types'

export const mockStaffData: Staff[] = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john.smith@deepos.com',
    phone: '+62 812-3456-7890',
    role: 'Manager',
    salary: 8000000,
    dateOfBirth: '1985-03-15',
    age: 38,
    shiftStart: '08:00',
    shiftEnd: '17:00',
    address: '123 Main Street, Downtown, City 12345',
    additionalDetails: 'Experienced manager with 10+ years in restaurant industry',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z'
  },
  {
    id: '2',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@deepos.com',
    phone: '+62 813-4567-8901',
    role: 'Cashier',
    salary: 4500000,
    dateOfBirth: '1992-07-22',
    age: 31,
    shiftStart: '09:00',
    shiftEnd: '18:00',
    address: '456 Oak Avenue, Suburb, City 12346',
    additionalDetails: 'Excellent customer service skills and cash handling experience',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-12-18T14:15:00Z'
  },
  {
    id: '3',
    fullName: 'Michael Chen',
    email: 'michael.chen@deepos.com',
    phone: '+62 814-5678-9012',
    role: 'Chef',
    salary: 6000000,
    dateOfBirth: '1988-11-08',
    age: 35,
    shiftStart: '06:00',
    shiftEnd: '15:00',
    address: '789 Pine Street, Uptown, City 12347',
    additionalDetails: 'Specialized in Asian cuisine with culinary arts degree',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-20T06:00:00Z',
    updatedAt: '2024-12-19T11:45:00Z'
  },
  {
    id: '4',
    fullName: 'Emily Rodriguez',
    email: 'emily.rodriguez@deepos.com',
    phone: '+62 815-6789-0123',
    role: 'Waiter',
    salary: 3500000,
    dateOfBirth: '1995-04-12',
    age: 28,
    shiftStart: '11:00',
    shiftEnd: '20:00',
    address: '321 Elm Drive, Midtown, City 12348',
    additionalDetails: 'Fluent in English and Spanish, great with customer relations',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-12-21T16:20:00Z'
  },
  {
    id: '5',
    fullName: 'David Wilson',
    email: 'david.wilson@deepos.com',
    phone: '+62 816-7890-1234',
    role: 'Cleaner',
    salary: 3000000,
    dateOfBirth: '1990-09-25',
    age: 33,
    shiftStart: '05:00',
    shiftEnd: '14:00',
    address: '654 Maple Lane, Eastside, City 12349',
    additionalDetails: 'Reliable and thorough, maintains high cleanliness standards',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-02-15T05:00:00Z',
    updatedAt: '2024-12-17T13:10:00Z'
  },
  {
    id: '6',
    fullName: 'Lisa Thompson',
    email: 'lisa.thompson@deepos.com',
    phone: '+62 817-8901-2345',
    role: 'Cashier',
    salary: 4200000,
    dateOfBirth: '1993-12-03',
    age: 30,
    shiftStart: '14:00',
    shiftEnd: '23:00',
    address: '987 Cedar Court, Westside, City 12350',
    additionalDetails: 'Evening shift specialist with POS system expertise',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-03-01T14:00:00Z',
    updatedAt: '2024-12-22T09:30:00Z'
  },
  {
    id: '7',
    fullName: 'Robert Garcia',
    email: 'robert.garcia@deepos.com',
    phone: '+62 818-9012-3456',
    role: 'Security',
    salary: 4000000,
    dateOfBirth: '1987-06-18',
    age: 36,
    shiftStart: '22:00',
    shiftEnd: '06:00',
    address: '147 Birch Boulevard, Northside, City 12351',
    additionalDetails: 'Night security with 8 years experience in hospitality security',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-25T22:00:00Z',
    updatedAt: '2024-12-16T07:45:00Z'
  },
  {
    id: '8',
    fullName: 'Amanda Lee',
    email: 'amanda.lee@deepos.com',
    phone: '+62 819-0123-4567',
    role: 'Waiter',
    salary: 3800000,
    dateOfBirth: '1996-01-30',
    age: 27,
    shiftStart: '17:00',
    shiftEnd: '01:00',
    address: '258 Spruce Street, Southside, City 12352',
    additionalDetails: 'Evening and late-night service specialist',
    profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-04-05T17:00:00Z',
    updatedAt: '2024-12-23T12:15:00Z'
  }
]

export const mockAttendanceData: AttendanceRecord[] = [
  {
    id: '1',
    staffId: '1',
    date: '2024-12-25',
    timings: '08:00 - 17:00',
    status: 'Present'
  },
  {
    id: '2',
    staffId: '2',
    date: '2024-12-25',
    timings: '09:00 - 18:00',
    status: 'Present'
  },
  {
    id: '3',
    staffId: '3',
    date: '2024-12-25',
    timings: '06:00 - 15:00',
    status: 'Present'
  },
  {
    id: '4',
    staffId: '4',
    date: '2024-12-25',
    timings: '11:00 - 20:00',
    status: 'Absent'
  },
  {
    id: '5',
    staffId: '5',
    date: '2024-12-25',
    timings: '05:00 - 14:00',
    status: 'Present'
  },
  {
    id: '6',
    staffId: '6',
    date: '2024-12-25',
    timings: '14:00 - 23:00',
    status: 'Half Shift'
  },
  {
    id: '7',
    staffId: '7',
    date: '2024-12-25',
    timings: '22:00 - 06:00',
    status: 'Present'
  },
  {
    id: '8',
    staffId: '8',
    date: '2024-12-25',
    timings: '17:00 - 01:00',
    status: 'Leave'
  }
]