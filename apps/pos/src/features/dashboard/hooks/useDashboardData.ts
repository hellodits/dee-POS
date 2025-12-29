import { useState, useEffect } from 'react'
import { 
  statsData, 
  popularDishes, 
  popularDishesWithOrders, 
  chartData 
} from '../data/mockData'
import { StatsData, DishItem, ChartDataPoint } from '../types'

interface DashboardData {
  stats: StatsData[]
  popularDishes: DishItem[]
  popularDishesWithOrders: DishItem[]
  chartData: ChartDataPoint[]
  isLoading: boolean
  error: string | null
}

export function useDashboardData(): DashboardData {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In a real app, this would be API calls
        // const stats = await api.get('/dashboard/stats')
        // const dishes = await api.get('/dashboard/popular-dishes')
        // etc.
        
        setError(null)
      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    stats: statsData,
    popularDishes,
    popularDishesWithOrders,
    chartData,
    isLoading,
    error
  }
}