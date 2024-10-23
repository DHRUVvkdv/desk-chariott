import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

const COOKIE_EXPIRY = 7; // Cookie expires in 7 days
const RECOMMENDATIONS_COOKIE_PREFIX = 'user_recommendations_';

const PriorityIcon = ({ priority }) => {
    switch (priority) {
        case 'HIGH':
            return <AlertTriangle className="text-red-500" size={18} />;
        case 'MEDIUM':
            return <AlertCircle className="text-yellow-500" size={18} />;
        case 'LOW':
            return <Info className="text-blue-500" size={18} />;
        default:
            return null;
    }
};

const RecommendationsTab = ({ userId, onDataFetched, cachedData }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState(null);

    const getCookieKey = (userId) => `${RECOMMENDATIONS_COOKIE_PREFIX}${userId}`;

    const fetchRecommendations = async (forceRefresh = false) => {
        setLoading(true);
        setError(null);

        try {
            const cookieKey = getCookieKey(userId);
            
            // Check cookies first if not forcing refresh
            if (!forceRefresh) {
                const cookieData = Cookies.get(cookieKey);
                if (cookieData) {
                    const parsedData = JSON.parse(cookieData);
                    setRecommendations(parsedData);
                    onDataFetched(userId, parsedData);
                    setLoading(false);
                    return;
                }
            }

            const response = await fetch(
                `https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/rag/interactions/insights/${userId}`,
                {
                    headers: {
                        'API-Key': process.env.NEXT_PUBLIC_API_KEY,
                    }
                }
            );
            
            if (!response.ok) throw new Error('Failed to fetch recommendations');
            
            const data = await response.json();
            
            // Store in cookie
            Cookies.set(cookieKey, JSON.stringify(data), { expires: COOKIE_EXPIRY });
            
            setRecommendations(data);
            onDataFetched(userId, data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeData = () => {
            // First check if we have data in props
            if (cachedData) {
                setRecommendations(cachedData);
                return;
            }

            // Then check cookies
            const cookieKey = getCookieKey(userId);
            const cookieData = Cookies.get(cookieKey);
            
            if (cookieData) {
                const parsedData = JSON.parse(cookieData);
                setRecommendations(parsedData);
                onDataFetched(userId, parsedData);
            } else {
                // If no cookie data, fetch from API
                fetchRecommendations();
            }
        };

        initializeData();
    }, [userId, cachedData]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-pulse text-gray-400">Loading recommendations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 rounded-md bg-red-50">
                Failed to load recommendations: {error}
            </div>
        );
    }

    if (!recommendations) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            <div className="flex justify-between items-center mb-4">
                <div className="p-3 bg-blue-50 rounded-md flex-grow mr-4">
                    <p className="text-sm text-blue-700">
                        Analysis based on {recommendations.total_interactions} interactions
                        <span className="text-gray-500"> • </span>
                        Last updated: {new Date(recommendations.timestamp).toLocaleString()}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchRecommendations(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                    <RotateCw size={16} />
                    <span>Refresh</span>
                </motion.button>
            </div>
            
            {recommendations.insights.map((insight, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start space-x-3">
                        <div className="mt-1">
                            <PriorityIcon priority={insight.priority} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                            <p className="text-gray-600 text-sm">{insight.description}</p>
                            <div className="mt-2 flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    insight.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                    insight.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {insight.priority} Priority
                                </span>
                                <span className="text-xs text-gray-500">
                                    {insight.frequency} {insight.frequency === 1 ? 'occurrence' : 'occurrences'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export { RecommendationsTab };