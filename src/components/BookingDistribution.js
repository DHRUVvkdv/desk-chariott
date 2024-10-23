import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InfoTooltip } from './InfoTooltip';
import { LoadingSkeleton } from './LoadingSkeleton';

export const BookingDistribution = ({ data, loading }) => {
  const [hoveredSector, setHoveredSector] = React.useState(null);
  const COLORS = ['#22C55E', '#EAB308', '#EF4444']; // Green, Yellow, Red for Past, Current, Upcoming
  
  // Data validation and filtering
  const validData = React.useMemo(() => {
    if (!Array.isArray(data)) {
      console.warn('BookingDistribution: Invalid data format', data);
      return [];
    }
    return data.filter(item => 
      item && 
      typeof item.value === 'number' && 
      item.value >= 0 &&
      item.name !== 'Unknown' // Exclude Unknown bookings
    );
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-1"
    >
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-lg font-semibold">Booking Distribution</CardTitle>
            <InfoTooltip text="Distribution of bookings across past, current, and upcoming categories" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton type="chart" />
          ) : !validData.length ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No booking data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={validData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    onMouseEnter={(_, index) => setHoveredSector(index)}
                    onMouseLeave={() => setHoveredSector(null)}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {validData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        opacity={hoveredSector === null || hoveredSector === index ? 1 : 0.5}
                        stroke={hoveredSector === index ? "#fff" : "none"}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded shadow-lg border border-gray-200">
                            <p className="text-sm font-medium">{payload[0].name}</p>
                            <p className="text-sm text-gray-600">{`Bookings: ${payload[0].value}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};