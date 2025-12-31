import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from './Header'
import { StatsCard } from './StatsCard'
import { DishListItem } from './DishListItem'
import { OverviewChart } from './OverviewChart'
import { useDashboardData } from '../hooks/useDashboardData'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'

interface DashboardPageProps {
  isSidebarCollapsed: boolean
  isMobile: boolean
  onToggleSidebar: () => void
}

export function DashboardPage({ isSidebarCollapsed, isMobile, onToggleSidebar }: DashboardPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { stats, popularDishes, topSellingDishes, chartData, isLoading, error, refetch } = useDashboardData()

  const handleSeeAllMenu = () => {
    navigate('/menu')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <Header 
          title={t('dashboard.title')}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobile={isMobile}
          onToggleSidebar={onToggleSidebar}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 bg-background min-h-screen flex flex-col">
        <Header 
          title={t('dashboard.title')}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobile={isMobile}
          onToggleSidebar={onToggleSidebar}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium mb-2">{error}</p>
            <button 
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        title={t('dashboard.title')}
        isSidebarCollapsed={isSidebarCollapsed}
        isMobile={isMobile}
        onToggleSidebar={onToggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* Stats Row - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={t(`dashboard.${stat.title}`)}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              chartData={stat.chartData}
            />
          ))}
        </div>

        {/* Popular Dishes Section - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Popular Dishes - By Revenue */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                  {t('dashboard.popularDishes')}
                </CardTitle>
                <button 
                  onClick={handleSeeAllMenu}
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium touch-target"
                >
                  {t('dashboard.seeAll')}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {popularDishes.length > 0 ? (
                popularDishes.map((dish) => (
                  <DishListItem
                    key={dish.id}
                    id={dish.id}
                    name={dish.name}
                    image={dish.image}
                    serving={dish.serving}
                    status={dish.status}
                    price={dish.price}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Belum ada data</p>
              )}
            </CardContent>
          </Card>

          {/* Right Popular Dishes - By Order Count */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                  {t('dashboard.topSelling') || 'Paling Laris'}
                </CardTitle>
                <button 
                  onClick={handleSeeAllMenu}
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium touch-target"
                >
                  {t('dashboard.seeAll')}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {topSellingDishes.length > 0 ? (
                topSellingDishes.map((dish) => (
                  <DishListItem
                    key={dish.id}
                    id={dish.id}
                    name={dish.name}
                    image={dish.image}
                    orderCount={dish.orderCount}
                    status={dish.status}
                    price={dish.price}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Belum ada data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Overview Chart - Responsive */}
        <div className="w-full">
          <OverviewChart data={chartData} />
        </div>
      </main>
    </div>
  )
}
