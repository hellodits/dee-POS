export interface StatsData {
  title: string
  value: string
  subtitle: string
  icon: string
  chartData: number[]
}

export interface StatsCardProps {
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
  serving?: string
  orderCount?: string
  status: 'In Stock' | 'Out of Stock' | 'Low Stock'
  price: string
}

export interface DishListItemProps {
  id: string
  name: string
  image: string
  serving?: string
  orderCount?: string
  status: 'In Stock' | 'Out of Stock' | 'Low Stock'
  price: string
}

export interface ChartDataPoint {
  month: string
  sales: number
  revenue: number
}

export interface FilterOption {
  label: string
  value: string
}

export type FilterValue = 'monthly' | 'daily' | 'weekly'