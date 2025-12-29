import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from './Header'
import { StatsCard } from './StatsCard'
import { DishListItem } from './DishListItem'
import { OverviewChart } from './OverviewChart'
import { 
  statsData, 
  popularDishes, 
  popularDishesWithOrders, 
  chartData 
} from '../data/mockData'

interface DashboardPageProps {
  isSidebarCollapsed: boolean
  isMobile: boolean
  onToggleSidebar: () => void
}

export function DashboardPage({ isSidebarCollapsed, isMobile, onToggleSidebar }: DashboardPageProps) {
  const { t } = useTranslation()

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
          {statsData.map((stat, index) => (
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
          {/* Left Popular Dishes */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                  {t('dashboard.popularDishes')}
                </CardTitle>
                <button className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium touch-target">
                  {t('dashboard.seeAll')}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {popularDishes.map((dish) => (
                <DishListItem
                  key={dish.id}
                  id={dish.id}
                  name={dish.name}
                  image={dish.image}
                  serving={dish.serving}
                  status={dish.status}
                  price={dish.price}
                />
              ))}
            </CardContent>
          </Card>

          {/* Right Popular Dishes */}
          <Card className="bg-card border border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                  {t('dashboard.popularDishes')}
                </CardTitle>
                <button className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium touch-target">
                  {t('dashboard.seeAll')}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {popularDishesWithOrders.map((dish) => (
                <DishListItem
                  key={dish.id}
                  id={dish.id}
                  name={dish.name}
                  image={dish.image}
                  orderCount={dish.orderCount}
                  status={dish.status}
                  price={dish.price}
                />
              ))}
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