import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InfoTooltip } from './InfoTooltip';
import { LoadingSkeleton } from './LoadingSkeleton';

export const UserInteractions = ({ data, loading }) => {
  const [hoveredDataPoint, setHoveredDataPoint] = React.useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-1"
    >
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-lg font-semibold">User Interaction Counts</CardTitle>
            <InfoTooltip text="Number of interactions per user over time" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton type="chart" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={data}
                  onMouseMove={(e) => {
                    if (e.activeTooltipIndex !== undefined) {
                      setHoveredDataPoint(e.activeTooltipIndex);
                    }
                  }}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    height={60}
                    angle={-45}
                    textAnchor="end"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <InfoTooltip
                    content={({ payload, label }) => {
                      if (payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded shadow-lg border border-gray-200">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-sm text-gray-600">
                              {`Interactions: ${payload[0].value}`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="interactions" 
                    stroke="rgb(177, 18, 43)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "rgb(177, 18, 43)" }}
                    activeDot={{ 
                      r: 8, 
                      fill: "rgb(177, 18, 43)",
                      stroke: "#fff",
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};