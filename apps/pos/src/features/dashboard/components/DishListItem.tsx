import { useTranslation } from 'react-i18next'
import { DishListItemProps } from '../types'

export function DishListItem({ 
  name, 
  image, 
  serving, 
  orderCount, 
  status, 
  price 
}: DishListItemProps) {
  const { t } = useTranslation()
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'text-green-600 dark:text-green-400'
      case 'Out of Stock':
        return 'text-red-600 dark:text-red-400'
      case 'Low Stock':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'In Stock':
        return t('dashboard.inStock')
      case 'Out of Stock':
        return t('dashboard.outOfStock')
      case 'Low Stock':
        return t('dashboard.lowStock')
      default:
        return status
    }
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMzMC42Mjc0IDMyIDM2IDI2LjYyNzQgMzYgMjBDMzYgMTMuMzcyNiAzMC42Mjc0IDggMjQgOEMxNy4zNzI2IDggMTIgMTMuMzcyNiAxMiAyMEMxMiAyNi42Mjc0IDE3LjM3MjYgMzIgMjQgMzJaIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0yNCAyNkMyNy4zMTM3IDI2IDMwIDIzLjMxMzcgMzAgMjBDMzAgMTYuNjg2MyAyNy4zMTM3IDE0IDI0IDE0QzIwLjY4NjMgMTQgMTggMTYuNjg2MyAxOCAyMEMxOCAyMy4zMTM3IDIwLjY4NjMgMjYgMjQgMjZaIiBmaWxsPSIjOUI5Q0EwIi8+Cjwvc3ZnPgo='
            }}
          />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{name}</h4>
          <p className="text-sm text-muted-foreground">
            {serving || orderCount}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className={`text-sm font-medium ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </p>
        <p className="text-sm font-semibold text-foreground mt-1">
          {price}
        </p>
      </div>
    </div>
  )
}