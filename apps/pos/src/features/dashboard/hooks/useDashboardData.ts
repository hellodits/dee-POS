import { useState, useEffect, useCallback } from 'react'
import { reportsApi, tablesApi } from '@/lib/api'
import { StatsData, DishItem, ChartDataPoint, FilterValue } from '../types'

interface DashboardData {
  stats: StatsData[]
  popularDishes: DishItem[]
  topSellingDishes: DishItem[]
  chartData: ChartDataPoint[]
  isLoading: boolean
  error: string | null
  activeFilter: FilterValue
  refetch: () => void
  setFilter: (filter: FilterValue) => void
}

interface TopProduct {
  product_id: string
  name: string
  qty_sold: number
  revenue: number
  profit: number
  image_url?: string
  stock?: number
}

interface DailySales {
  date: string
  total: number
  orders: number
}

export function useDashboardData(): DashboardData {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsData[]>([])
  const [popularDishes, setPopularDishes] = useState<DishItem[]>([])
  const [topSellingDishes, setTopSellingDishes] = useState<DishItem[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterValue>('monthly')

  const fetchData = useCallback(async (period: FilterValue = 'monthly') => {
    try {
      setIsLoading(true)
      setError(null)

      // Map filter to API period
      const apiPeriod = period === 'daily' ? 'week' : period === 'weekly' ? 'month' : 'month'

      // Fetch all data in parallel, handle individual failures gracefully
      const results = await Promise.allSettled([
        reportsApi.getDashboard(),
        reportsApi.getTopProducts({ period: apiPeriod, limit: 8 }),
        reportsApi.getDailyTrend({ period: apiPeriod }),
        tablesApi.getSummary(),
      ])

      const [dashboardRes, topProductsRes, dailyTrendRes, tablesRes] = results

      // Process dashboard data
      type DashboardResponse = { today?: { total_sales?: number; total_orders?: number } }
      const dashboardData: DashboardResponse | null = dashboardRes.status === 'fulfilled' 
        ? (dashboardRes.value.data.data as DashboardResponse) 
        : null

      // Process tables data
      type TablesResponse = { total?: number; occupied?: number; available?: number; reserved?: number }
      const tablesData: TablesResponse = tablesRes.status === 'fulfilled' 
        ? (tablesRes.value.data.data as TablesResponse) 
        : { total: 0, occupied: 0 }

      // Process daily trend data
      const dailyData: DailySales[] = dailyTrendRes.status === 'fulfilled' 
        ? ((dailyTrendRes.value.data.data as DailySales[]) || [])
        : []

      // Build stats
      const newStats: StatsData[] = [
        {
          title: 'dailySales',
          value: formatCurrency(dashboardData?.today?.total_sales || 0),
          subtitle: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          icon: 'dollar-sign',
          chartData: generateMiniChartData(dashboardData?.today?.total_sales || 0)
        },
        {
          title: 'monthlyRevenue',
          value: formatCurrency(calculateMonthlyRevenue(dailyData)),
          subtitle: getMonthRange(),
          icon: 'trending-up',
          chartData: dailyData.slice(-12).map((d: DailySales) => d.total / 1000)
        },
        {
          title: 'tableOccupancy',
          value: `${tablesData?.occupied || 0}/${tablesData?.total || 0} Meja`,
          subtitle: 'Status Saat Ini',
          icon: 'users',
          chartData: generateTableChartData(tablesData?.occupied || 0, tablesData?.total || 0)
        }
      ]
      setStats(newStats)

      // Process top products for popular dishes
      const topProducts: TopProduct[] = topProductsRes.status === 'fulfilled' 
        ? ((topProductsRes.value.data.data as TopProduct[]) || [])
        : []
      
      // Split into two lists
      const firstHalf = topProducts.slice(0, 4).map((p, idx) => mapProductToDish(p, idx, 'serving'))
      const secondHalf = topProducts.slice(4, 8).map((p, idx) => mapProductToDish(p, idx + 4, 'orderCount'))
      
      setPopularDishes(firstHalf)
      setTopSellingDishes(secondHalf)

      // Process chart data based on filter
      const processedChartData = processChartData(dailyData, period)
      setChartData(processedChartData)

      // Check if all requests failed
      const allFailed = results.every(r => r.status === 'rejected')
      if (allFailed) {
        setError('Gagal memuat data dashboard')
      }

    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Gagal memuat data dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setFilter = useCallback((filter: FilterValue) => {
    setActiveFilter(filter)
    fetchData(filter)
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData(activeFilter)
  }, [fetchData, activeFilter])

  useEffect(() => {
    fetchData(activeFilter)
  }, [fetchData, activeFilter])

  return {
    stats,
    popularDishes,
    topSellingDishes,
    chartData,
    isLoading,
    error,
    activeFilter,
    refetch,
    setFilter
  }
}

// Helper functions
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}rb`
  }
  return `Rp ${amount.toLocaleString('id-ID')}`
}

function getMonthRange(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date()
  return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
}

function generateMiniChartData(todaySales: number): number[] {
  // Generate random-ish data for mini chart visualization
  const base = todaySales / 12
  return Array.from({ length: 12 }, () => Math.floor(base * (0.5 + Math.random())))
}

function generateTableChartData(occupied: number, total: number): number[] {
  const percentage = total > 0 ? (occupied / total) * 100 : 0
  return Array.from({ length: 12 }, (_, i) => Math.floor(percentage * (0.7 + (i / 20))))
}

function calculateMonthlyRevenue(dailyData: DailySales[]): number {
  return dailyData.reduce((sum, d) => sum + (d.total || 0), 0)
}

function mapProductToDish(product: TopProduct, index: number, type: 'serving' | 'orderCount'): DishItem {
  const stockStatus = getStockStatus(product.stock)
  
  return {
    id: product.product_id || String(index),
    name: product.name || 'Unknown Product',
    image: product.image_url || '/api/placeholder/60/60',
    ...(type === 'serving' 
      ? { serving: `Terjual: ${product.qty_sold || 0}` }
      : { orderCount: `Order: ${product.qty_sold || 0}` }
    ),
    status: stockStatus,
    price: `Rp ${(product.revenue || 0).toLocaleString('id-ID')}`
  }
}

function getStockStatus(stock?: number): 'In Stock' | 'Out of Stock' | 'Low Stock' {
  if (stock === undefined || stock === null) return 'In Stock'
  if (stock <= 0) return 'Out of Stock'
  if (stock <= 10) return 'Low Stock'
  return 'In Stock'
}

function processChartData(dailyData: DailySales[], period: FilterValue): ChartDataPoint[] {
  switch (period) {
    case 'daily':
      return aggregateToDaily(dailyData)
    case 'weekly':
      return aggregateToWeekly(dailyData)
    case 'monthly':
    default:
      return aggregateToMonthly(dailyData)
  }
}

function aggregateToDaily(dailyData: DailySales[]): ChartDataPoint[] {
  // Show last 7 days
  const last7Days = dailyData.slice(-7)
  return last7Days.map(day => ({
    month: new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    sales: day.orders || 0,
    revenue: day.total || 0
  }))
}

function aggregateToWeekly(dailyData: DailySales[]): ChartDataPoint[] {
  // Group by weeks (last 8 weeks)
  const weeklyMap = new Map<string, { sales: number; revenue: number }>()
  
  dailyData.forEach(day => {
    const date = new Date(day.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
    const weekKey = `Week ${Math.ceil(date.getDate() / 7)}`
    
    const existing = weeklyMap.get(weekKey) || { sales: 0, revenue: 0 }
    weeklyMap.set(weekKey, {
      sales: existing.sales + (day.orders || 0),
      revenue: existing.revenue + (day.total || 0)
    })
  })

  return Array.from(weeklyMap.entries()).slice(-8).map(([week, data]) => ({
    month: week,
    sales: data.sales,
    revenue: data.revenue
  }))
}

function aggregateToMonthly(dailyData: DailySales[]): ChartDataPoint[] {
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const monthlyMap = new Map<string, { sales: number; revenue: number }>()

  // Initialize all months
  monthNames.forEach(month => {
    monthlyMap.set(month, { sales: 0, revenue: 0 })
  })

  // Aggregate daily data into months
  dailyData.forEach(day => {
    const date = new Date(day.date)
    const monthKey = monthNames[date.getMonth()]
    const existing = monthlyMap.get(monthKey) || { sales: 0, revenue: 0 }
    monthlyMap.set(monthKey, {
      sales: existing.sales + (day.orders || 0),
      revenue: existing.revenue + (day.total || 0)
    })
  })

  return monthNames.map(month => ({
    month,
    sales: monthlyMap.get(month)?.sales || 0,
    revenue: monthlyMap.get(month)?.revenue || 0
  }))
}
