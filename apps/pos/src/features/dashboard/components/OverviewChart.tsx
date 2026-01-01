import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { ChartDataPoint, FilterValue } from '../types'
import * as XLSX from 'xlsx'

interface OverviewChartProps {
  data: ChartDataPoint[]
  onFilterChange?: (filter: FilterValue) => void
  activeFilter?: FilterValue
}

export function OverviewChart({ data, onFilterChange, activeFilter = 'monthly' }: OverviewChartProps) {
  const { t } = useTranslation()

  const filterOptions = [
    { label: t('dashboard.monthly'), value: 'monthly' as FilterValue },
    { label: t('dashboard.daily'), value: 'daily' as FilterValue },
    { label: t('dashboard.weekly'), value: 'weekly' as FilterValue }
  ]

  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = data.map(item => ({
        'Period': item.month,
        'Sales Count': item.sales,
        'Revenue (Rp)': item.revenue.toLocaleString('id-ID')
      }))

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Overview Report')

      // Auto-size columns
      const colWidths = [
        { wch: 15 }, // Period
        { wch: 15 }, // Sales Count
        { wch: 20 }  // Revenue
      ]
      ws['!cols'] = colWidths

      // Generate filename with current date
      const now = new Date()
      const filename = `Overview_Report_${activeFilter}_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`

      // Export file
      XLSX.writeFile(wb, filename)
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal export data. Silakan coba lagi.')
    }
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              {t('dashboard.overview')}
            </h3>
            <div className="flex items-center space-x-4 sm:space-x-6 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {t('dashboard.sales')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {t('dashboard.revenue')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            {/* Filter Tabs - Responsive */}
            <div className="flex bg-muted rounded-lg p-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterChange?.(option.value)}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                    activeFilter === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Export Button */}
            <Button 
              size="sm" 
              onClick={handleExport}
              className="bg-primary hover:bg-primary/90 text-primary-foreground touch-target"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('common.export')}</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data} 
              margin={{ 
                top: 5, 
                right: 10, 
                left: 10, 
                bottom: 5 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value / 1000}k`}
                className="text-xs"
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 4, stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}