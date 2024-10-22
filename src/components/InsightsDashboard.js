import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, CheckCircle2, Building2, Wrench  } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const InsightsDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loyaltyDistribution, setLoyaltyDistribution] = useState([]);
  const [interactionData, setInteractionData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [operationalInsights, setOperationalInsights] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    loyalty: true,
    interactions: true,
    chatInsights: true,
    operationalInsights: true
  });
  const [hoveredSector, setHoveredSector] = useState(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      // Fetch users and process loyalty/interaction data
      try {
        const usersResponse = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/auth/allnormal', {
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          }
        });
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const userData = await usersResponse.json();
        setUsers(userData);
        processData(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingStates(prev => ({
          ...prev,
          loyalty: false,
          interactions: false
        }));
      }

      // Fetch chat insights
      try {
        const insightsResponse = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/rag/interactions/insights/123', {
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          }
        });
        if (!insightsResponse.ok) throw new Error('Failed to fetch insights');
        const insightsData = await insightsResponse.json();
        setInsights(insightsData.insights);
      } catch (error) {
        console.error('Error fetching chat insights:', error);
      } finally {
        setLoadingStates(prev => ({
          ...prev,
          chatInsights: false
        }));
      }

      // Fetch operational insights
      try {
        const operationsResponse = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/rag/interactions/operations/insights', {
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          }
        });
        if (!operationsResponse.ok) throw new Error('Failed to fetch operational insights');
        const operationsData = await operationsResponse.json();
        setOperationalInsights(operationsData.insights);
      } catch (error) {
        console.error('Error fetching operational insights:', error);
      } finally {
        setLoadingStates(prev => ({
          ...prev,
          operationalInsights: false
        }));
      }
    };
    fetchData();
  }, []);

  const processData = (userData) => {
    // Process loyalty distribution
    const loyaltyCount = userData.reduce((acc, user) => {
      acc[user.loyalty_program] = (acc[user.loyalty_program] || 0) + 1;
      return acc;
    }, {});

    const loyaltyData = Object.entries(loyaltyCount).map(([name, value]) => ({ name, value }));
    setLoyaltyDistribution(loyaltyData);

    // Process interaction data
    const interactionData = userData.map(user => ({
      name: `${user.first_name} ${user.last_name}`,
      interactions: user.interaction_counter
    }));
    setInteractionData(interactionData);
  };

  const COLORS = ['rgb(94, 94, 90)', 'rgb(37, 40, 42)', 'rgb(177, 18, 43)'];

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

  const LoadingSkeleton = ({ type }) => {
    switch (type) {
      case 'chart':
        return (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        );
      case 'card':
        return (
          <div className="animate-pulse space-y-4">
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
            <div className="h-36 bg-gray-200 rounded-lg"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const cardVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gray-100 min-h-screen p-4 sm:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1 variants={itemVariants} className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-[#252A2A]">
          Insights Dashboard
        </motion.h1>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          {/* Loyalty Distribution */}
          <motion.div 
            variants={itemVariants} 
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#5E5E5A]">Loyalty Distribution</h2>
            {loadingStates.loyalty ? (
              <LoadingSkeleton type="chart" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={loyaltyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={(_, index) => setHoveredSector(index)}
                    onMouseLeave={() => setHoveredSector(null)}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {loyaltyDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        opacity={hoveredSector === null || hoveredSector === index ? 1 : 0.5}
                        stroke={hoveredSector === index ? "#fff" : "none"}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* User Interactions */}
          <motion.div 
            variants={itemVariants} 
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#5E5E5A]">User Interaction Counts</h2>
            {loadingStates.interactions ? (
              <LoadingSkeleton type="chart" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart 
                  data={interactionData}
                  onMouseMove={(e) => {
                    if (e.activeTooltipIndex !== undefined) {
                      setHoveredDataPoint(e.activeTooltipIndex);
                    }
                  }}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="interactions" 
                    stroke="rgb(177, 18, 43)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8, fill: "rgb(177, 18, 43)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Chat Log Insights */}
          <motion.div variants={itemVariants} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-[#5E5E5A]">Chat Log Insights</h2>
            {loadingStates.chatInsights ? (
              <LoadingSkeleton type="card" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <AnimatePresence>
                  {insights.map((insight, index) => (
                    <Dialog key={insight.title}>
                      <DialogTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative bg-[#B1122B] text-white p-4 rounded-lg shadow-md transition-colors duration-200 h-36 flex flex-col justify-between cursor-pointer"
                          variants={cardVariants}
                          whileHover="hover"
                        >
                          <h3 className="text-lg font-medium mb-2">{insight.title}</h3>
                          <motion.div
                            className="absolute bottom-4 right-4 bg-white text-[#B1122B] rounded-full p-1 hover:bg-[#D9D9D6] transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={24} />
                          </motion.div>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">{insight.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="flex p-4 bg-blue-50 text-blue-900 rounded-lg">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <p className="text-sm">{insight.description}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-sm text-gray-500">Frequency:</span>
                              <span className="ml-2 font-semibold">{insight.frequency} occurrences</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(insight.priority)}`}>
                              {insight.priority}
                            </span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Operational Insights */}
          <motion.div variants={itemVariants} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-[#5E5E5A]">Operational Insights</h2>
            {loadingStates.operationalInsights ? (
              <LoadingSkeleton type="card" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <AnimatePresence>
                  {operationalInsights.map((insight, index) => (
                    <Dialog key={insight.title}>
                      <DialogTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative bg-[#5E5E5A] text-white p-4 rounded-lg shadow-md transition-colors duration-200 h-36 flex flex-col justify-between cursor-pointer"
                          variants={cardVariants}
                          whileHover="hover"
                        >
                          <div>
                            <span className={`text-sm px-2 py-1 rounded ${getCategoryColor(insight.category)}`}>
                              {getCategoryDisplay(insight.category)}
                            </span>
                            <h3 className="text-lg font-medium mt-2">{insight.title}</h3>
                          </div>
                          <motion.div
                            className="absolute bottom-4 right-4 bg-white text-[#5E5E5A] rounded-full p-1 hover:bg-[#D9D9D6] transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={24} />
                          </motion.div>
                        </motion.div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">{insight.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="flex p-4 bg-blue-50 text-blue-900 rounded-lg">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                            <p className="text-sm">{insight.description}</p>
                          </div>
                          
                          {/* Action Items Section */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                              <CheckCircle2 className="h-4 w-4" />
                              Action Items
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {insight.action_items.map((item, i) => (
                                <li key={i} className="text-sm text-gray-600">{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Affected Areas & Impact Section */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
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
                                <Wrench className="h-4 w-4" />
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
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightsDashboard;