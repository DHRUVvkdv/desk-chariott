import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { RotateCw } from 'lucide-react';

// Import components
import { LoyaltyDistribution } from './LoyaltyDistribution';
import { UserInteractions } from './UserInteractions';
import { BookingDistribution } from './BookingDistribution';
import { EngagementScore } from './EngagementScore';
import { OperationalInsights } from './OperationalInsights';
import { LoadingSkeleton } from './LoadingSkeleton';

// Cookie configuration
const COOKIE_EXPIRY = 7;
const OPERATIONAL_INSIGHTS_COOKIE_KEY = 'operational_insights_data';
const ENGAGEMENT_DATA_COOKIE_KEY = 'engagement_data';
const USER_DATA_COOKIE_KEY = 'user_data';

// Helper functions
const parseBookingsFromSummary = (summary) => {
  if (!summary) return null;
  
  try {
    // Extract booking numbers using regex
    const pastMatch = summary.match(/past: (\d+)/);
    const currentMatch = summary.match(/current: (\d+)/);
    const upcomingMatch = summary.match(/upcoming: (\d+)/);

    return {
      past_bookings: pastMatch ? parseInt(pastMatch[1]) : 0,
      current_bookings: currentMatch ? parseInt(currentMatch[1]) : 0,
      upcoming_bookings: upcomingMatch ? parseInt(upcomingMatch[1]) : 0
    };
  } catch (error) {
    console.error('Error parsing bookings from summary:', error);
    return null;
  }
};

export const InsightsDashboard = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loyaltyDistribution, setLoyaltyDistribution] = useState([]);
  const [interactionData, setInteractionData] = useState([]);
  const [engagementData, setEngagementData] = useState(null);
  const [operationalInsights, setOperationalInsights] = useState([]);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [loadingStates, setLoadingStates] = useState({
    loyalty: true,
    interactions: true,
    engagement: true,
    operationalInsights: true
  });

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Data processing functions
  const processUserData = (userData) => {
    try {
      // Process loyalty distribution
      const loyaltyCount = userData.reduce((acc, user) => {
        acc[user.loyalty_program] = (acc[user.loyalty_program] || 0) + 1;
        return acc;
      }, {});

      const loyaltyData = Object.entries(loyaltyCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setLoyaltyDistribution(loyaltyData);

      // Process interaction data
      const interactionData = userData
        .map(user => ({
          name: `${user.first_name} ${user.last_name}`,
          interactions: user.interaction_counter
        }))
        .sort((a, b) => b.interactions - a.interactions);

      setInteractionData(interactionData);
    } catch (error) {
      console.error('Error processing user data:', error);
      setError('Error processing user data');
    }
  };

  const formatBookingData = (data) => {
    if (!data?.summary) return [];
    
    const bookings = parseBookingsFromSummary(data.summary);
    if (!bookings) return [];

    return [
      { name: "Past", value: bookings.past_bookings },
      { name: "Current", value: bookings.current_bookings },
      { name: "Upcoming", value: bookings.upcoming_bookings }
    ].filter(item => item.value > 0);
  };

  // API fetch functions
  const fetchUserData = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cookieData = Cookies.get(USER_DATA_COOKIE_KEY);
      if (cookieData) {
        const userData = JSON.parse(cookieData);
        setUsers(userData);
        processUserData(userData);
        setLoadingStates(prev => ({ ...prev, loyalty: false, interactions: false }));
        return;
      }
    }

    setLoadingStates(prev => ({ ...prev, loyalty: true, interactions: true }));
    try {
      const response = await fetch(
        'https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/auth/allnormal',
        {
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const userData = await response.json();
      setUsers(userData);
      processUserData(userData);
      
      // Store in cookie
      Cookies.set(USER_DATA_COOKIE_KEY, JSON.stringify(userData), { expires: COOKIE_EXPIRY });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error fetching user data');
    } finally {
      setLoadingStates(prev => ({ ...prev, loyalty: false, interactions: false }));
    }
  };

  const fetchEngagementData = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cookieData = Cookies.get(ENGAGEMENT_DATA_COOKIE_KEY);
      if (cookieData) {
        setEngagementData(JSON.parse(cookieData));
        setLoadingStates(prev => ({ ...prev, engagement: false }));
        return;
      }
    }

    setLoadingStates(prev => ({ ...prev, engagement: true }));
    try {
      const response = await fetch(
        'https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/rag/interactions/engagement/analysis',
        {
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch engagement data');
      
      const data = await response.json();
      setEngagementData(data);
      
      // Store in cookie
      Cookies.set(ENGAGEMENT_DATA_COOKIE_KEY, JSON.stringify(data), { expires: COOKIE_EXPIRY });
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      setError('Error fetching engagement data');
    } finally {
      setLoadingStates(prev => ({ ...prev, engagement: false }));
    }
  };

  const fetchOperationalInsights = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cookieData = Cookies.get(OPERATIONAL_INSIGHTS_COOKIE_KEY);
      if (cookieData) {
        setOperationalInsights(JSON.parse(cookieData));
        setLoadingStates(prev => ({ ...prev, operationalInsights: false }));
        return;
      }
    }

    setLoadingStates(prev => ({ ...prev, operationalInsights: true }));
    try {
      const response = await fetch(
        'https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/rag/interactions/operations/insights',
        {
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_API_KEY,
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch operational insights');
      
      const data = await response.json();
      setOperationalInsights(data.insights);
      
      // Store in cookie
      Cookies.set(OPERATIONAL_INSIGHTS_COOKIE_KEY, JSON.stringify(data.insights), { expires: COOKIE_EXPIRY });
    } catch (error) {
      console.error('Error fetching operational insights:', error);
      setError('Error fetching operational insights');
    } finally {
      setLoadingStates(prev => ({ ...prev, operationalInsights: false }));
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchUserData(true),
        fetchEngagementData(true)
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Error refreshing data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setError(null);
      await Promise.all([
        fetchUserData(),
        fetchEngagementData(),
        fetchOperationalInsights()
      ]);
    };

    fetchAllData();
  }, []);

  // Debug logging
  useEffect(() => {
    if (engagementData?.summary) {
      console.log('Raw Engagement Data:', engagementData);
      console.log('Parsed Booking Data:', parseBookingsFromSummary(engagementData.summary));
      console.log('Formatted Booking Data:', formatBookingData(engagementData));
    }
  }, [engagementData]);

  // Error display component
  const ErrorDisplay = ({ message }) => (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 p-4 sm:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div variants={itemVariants} className="relative">
          <h1 className="text-3xl font-bold text-gray-900">Insights Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RotateCw
              size={24}
              className={`${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
          {error && <ErrorDisplay message={error} />}
        </motion.div>

        {/* User Metrics Section */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <LoyaltyDistribution 
            data={loyaltyDistribution}
            loading={loadingStates.loyalty}
          />
          <UserInteractions 
            data={interactionData}
            loading={loadingStates.interactions}
          />
        </motion.div>

        {/* Engagement Metrics Section */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <BookingDistribution 
            data={formatBookingData(engagementData)}
            loading={loadingStates.engagement}
          />
          <EngagementScore 
            score={engagementData?.overall_engagement_score || 0}
            loading={loadingStates.engagement}
          />
        </motion.div>

        {/* Operational Insights Section */}
        <motion.div variants={itemVariants}>
          <OperationalInsights 
            insights={operationalInsights}
            loading={loadingStates.operationalInsights}
            fetchInsights={fetchOperationalInsights}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InsightsDashboard;