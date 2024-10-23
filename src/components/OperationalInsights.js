import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, AlertCircle, CheckCircle2, Building2, Wrench, RotateCw } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { LoadingSkeleton } from './LoadingSkeleton';

export const OperationalInsights = ({ insights, loading, fetchInsights }) => {
  const getCategoryDisplay = (category) => {
    switch (category) {
      case 'operational_efficiency':
        return 'Operational';
      case 'service_quality':
        return 'Service';
      case 'amenities_usage':
        return 'Amenities';
      case 'booking_process':
        return 'Booking';
      case 'maintenance_issues':
        return 'Maintenance';
      default:
        return category;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'operational_efficiency':
        return 'bg-blue-500/20 text-blue-700';
      case 'service_quality':
        return 'bg-green-500/20 text-green-700';
      case 'amenities_usage':
        return 'bg-purple-500/20 text-purple-700';
      case 'booking_process':
        return 'bg-orange-500/20 text-orange-700';
      case 'maintenance_issues':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-2"
    >
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <CardTitle className="text-xl font-semibold text-gray-900">Operational Insights</CardTitle>
            <InfoTooltip text="Key operational metrics and insights derived from user interactions and system performance" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchInsights(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            disabled={loading}
          >
            <RotateCw 
              size={20} 
              className={`text-gray-600 ${loading ? 'animate-spin' : ''}`}
            />
          </motion.button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton type="card" />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {insights.map((insight, index) => (
                  <Dialog key={insight.title}>
                    <DialogTrigger asChild>
                      <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        layout
                        className="relative bg-white border border-gray-200 p-4 rounded-lg shadow-sm transition-all duration-200"
                      >
                        <div>
                          <span className={`text-sm px-2 py-1 rounded ${getCategoryColor(insight.category)}`}>
                            {getCategoryDisplay(insight.category)}
                          </span>
                          <h3 className="text-lg font-medium mt-2 text-gray-900">{insight.title}</h3>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{insight.description}</p>
                        </div>
                        <motion.div
                          className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Plus size={20} />
                        </motion.div>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">{insight.title}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-6">
                        <div className="flex p-4 bg-blue-50 text-blue-900 rounded-lg">
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                          <p className="text-sm">{insight.description}</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Action Items
                          </h4>
                          <ul className="list-disc pl-5 space-y-2">
                            {insight.action_items.map((item, i) => (
                              <li key={i} className="text-sm text-gray-600">{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-600" />
                              Affected Areas
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {insight.affected_areas.map((area, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-blue-600" />
                              Potential Impact
                            </h4>
                            <p className="text-sm text-gray-600">{insight.potential_savings}</p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(insight.impact_level)}`}>
                            {insight.impact_level} Impact
                          </span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};