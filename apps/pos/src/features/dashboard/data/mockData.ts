// Mock data for DEEPOS Dashboard

export interface StatsData {
  title: string
  value: string
  subtitle: string
  icon: string
  chartData: number[]
}

export interface DishItem {
  id: string
  name: string
  image: string
  serving: string
  status: 'In Stock' | 'Out of Stock' | 'Low Stock'
  price: string
  orderCount?: string
}

export interface ChartDataPoint {
  month: string
  sales: number
  revenue: number
}

// Stats Cards Data
export const statsData: StatsData[] = [
  {
    title: "dailySales", // Will be translated
    value: "$2k",
    subtitle: "9 February 2024",
    icon: "dollar-sign",
    chartData: [20, 35, 25, 40, 30, 45, 35, 50, 40, 55, 45, 60]
  },
  {
    title: "monthlyRevenue", // Will be translated
    value: "$55k",
    subtitle: "1 Jan - 1 Feb",
    icon: "trending-up",
    chartData: [30, 25, 35, 20, 40, 35, 45, 30, 50, 40, 55, 45]
  },
  {
    title: "tableOccupancy", // Will be translated
    value: "25 Tables",
    subtitle: "Current Status",
    icon: "users",
    chartData: [15, 25, 20, 30, 25, 35, 30, 40, 35, 45, 40, 50]
  }
]

// Popular Dishes Data
export const popularDishes: DishItem[] = [
  {
    id: "1",
    name: "Chicken Parmesan",
    image: "/api/placeholder/60/60",
    serving: "Serving: 01 person",
    status: "In Stock",
    price: "$55.00"
  },
  {
    id: "2", 
    name: "Chicken Parmesan",
    image: "/api/placeholder/60/60",
    serving: "Serving: 01 person", 
    status: "In Stock",
    price: "$55.00"
  },
  {
    id: "3",
    name: "Chicken Parmesan", 
    image: "/api/placeholder/60/60",
    serving: "Serving: 01 person",
    status: "Out of Stock",
    price: "$55.00"
  },
  {
    id: "4",
    name: "Chicken Parmesan",
    image: "/api/placeholder/60/60", 
    serving: "Serving: 01 person",
    status: "In Stock",
    price: "$55.00"
  }
]

// Popular Dishes with Order Count (Right Side)
export const popularDishesWithOrders: DishItem[] = [
  {
    id: "5",
    name: "Chicken Parmesan",
    image: "/api/placeholder/60/60",
    serving: "Serving: 01 person",
    orderCount: "Order: 55",
    status: "In Stock", 
    price: "$55.00"
  },
  {
    id: "6",
    name: "Chicken Parmesan",
    image: "/api/placeholder/60/60",
    serving: "Serving: 01 person",
    orderCount: "Order: 55",
    status: "In Stock",
    price: "$110.00"
  },
  {
    id: "7", 
    name: "Chicken Parmesan",
    image: "/api/placeholder/60/60",
    serving: "Serving: 01 person",
    orderCount: "Order: 55", 
    status: "Out of Stock",
    price: "$55.00"
  },
  {
    id: "8",
    name: "Chicken Parmesan",
    image: "/api/placeholder/60/60",
    serving: "Serving: 01 person",
    orderCount: "Order: 55",
    status: "In Stock", 
    price: "$55.00"
  }
]

// Chart Data for Overview
export const chartData: ChartDataPoint[] = [
  { month: "JAN", sales: 3000, revenue: 2400 },
  { month: "FEB", sales: 2800, revenue: 2200 },
  { month: "MAR", sales: 3200, revenue: 2800 },
  { month: "APR", sales: 2900, revenue: 2500 },
  { month: "MAY", sales: 4200, revenue: 3800 },
  { month: "JUN", sales: 3800, revenue: 3200 },
  { month: "JUL", sales: 4500, revenue: 4000 },
  { month: "AUG", sales: 4800, revenue: 4200 },
  { month: "SEP", sales: 4200, revenue: 3800 },
  { month: "OCT", sales: 3900, revenue: 3400 },
  { month: "NOV", sales: 4100, revenue: 3600 },
  { month: "DEC", sales: 4600, revenue: 4100 }
]

// Filter options for chart
export const filterOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" }
]