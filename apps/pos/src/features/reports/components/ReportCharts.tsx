import { useState } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ReportTab, ChartFilter } from '../types';
import { getReportData } from '../data/reportData';

interface ReportChartsProps {
  activeTab: ReportTab;
}

export function ReportCharts({ activeTab }: ReportChartsProps) {
  const reportData = getReportData(activeTab);
  
  const [chartFilter, setChartFilter] = useState<ChartFilter>({
    confirmed: true,
    awaited: true,
    cancelled: true,
    active: true,
    leave: true,
  });

  const getFilterButtons = () => {
    switch (activeTab) {
      case 'revenue':
      case 'reservation':
        return [
          { key: 'confirmed', label: 'Confirmed', color: '#10B981' },
          { key: 'awaited', label: 'Awaited', color: '#F59E0B' },
          { key: 'cancelled', label: 'Cancelled', color: '#EF4444' },
        ];
      case 'staff':
        return [
          { key: 'active', label: 'Active', color: '#10B981' },
          { key: 'leave', label: 'On Leave', color: '#F59E0B' },
        ];
      default:
        return [];
    }
  };

  const toggleFilter = (key: string) => {
    setChartFilter(prev => ({
      ...prev,
      [key]: !prev[key as keyof ChartFilter]
    }));
  };

  const getAreaChartData = () => {
    return reportData.chartData.map(item => {
      const filteredItem: any = { month: item.month };
      
      if (activeTab === 'staff') {
        if (chartFilter.active) filteredItem.active = item.active;
        if (chartFilter.leave) filteredItem.leave = item.leave;
      } else {
        if (chartFilter.confirmed) filteredItem.confirmed = item.confirmed;
        if (chartFilter.awaited) filteredItem.awaited = item.awaited;
        if (chartFilter.cancelled) filteredItem.cancelled = item.cancelled;
      }
      
      return filteredItem;
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Donut Chart */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reportData.summary}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportData.summary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [value.toLocaleString(), '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{reportData.totalValue}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {reportData.summary.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Area Chart */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2">
              {getFilterButtons().map((button) => (
                <button
                  key={button.key}
                  onClick={() => toggleFilter(button.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    chartFilter[button.key as keyof ChartFilter]
                      ? 'text-white'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: chartFilter[button.key as keyof ChartFilter] 
                      ? button.color 
                      : undefined
                  }}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={getAreaChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {activeTab === 'staff' ? (
                <>
                  {chartFilter.active && (
                    <Area
                      type="monotone"
                      dataKey="active"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                  )}
                  {chartFilter.leave && (
                    <Area
                      type="monotone"
                      dataKey="leave"
                      stackId="1"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.6}
                    />
                  )}
                </>
              ) : (
                <>
                  {chartFilter.confirmed && (
                    <Area
                      type="monotone"
                      dataKey="confirmed"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                  )}
                  {chartFilter.awaited && (
                    <Area
                      type="monotone"
                      dataKey="awaited"
                      stackId="1"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.6}
                    />
                  )}
                  {chartFilter.cancelled && (
                    <Area
                      type="monotone"
                      dataKey="cancelled"
                      stackId="1"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.6}
                    />
                  )}
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}