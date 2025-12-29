import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users } from 'lucide-react'
import { StatsCardProps } from '../types'

const iconMap = {
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'users': Users,
}

export function StatsCard({ title, value, subtitle, icon, chartData }: StatsCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || DollarSign
  
  // Simple sparkline bars
  const maxValue = Math.max(...chartData)
  
  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-secondary" />
          </div>
        </div>
        
        {/* Mini Chart */}
        <div className="flex items-end space-x-1 h-8">
          {chartData.map((value, index) => (
            <div
              key={index}
              className="bg-primary rounded-sm flex-1 min-w-[2px]"
              style={{
                height: `${(value / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}