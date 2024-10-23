import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { InfoTooltip } from './InfoTooltip';
import { LoadingSkeleton } from './LoadingSkeleton';

export const EngagementScore = ({ score, loading }) => {
    const scoreData = [{
      name: 'Score',
      value: score * 100,
      fill: '#0EA5E9'
    }];
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <CardTitle className="text-lg font-semibold">Engagement Score</CardTitle>
              <InfoTooltip text="Overall user engagement metric based on interaction frequency and quality" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton type="chart" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="60%" 
                    outerRadius="100%" 
                    barSize={10} 
                    data={scoreData}
                    startAngle={180} 
                    endAngle={0}
                  >
                    <RadialBar
                      background
                      dataKey="value"
                      cornerRadius={30}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl font-bold fill-current"
                    >
                      {`${(score * 100).toFixed(1)}%`}
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };