import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const InteractionsPanel = ({ userId }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await fetch(
          `https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws//api/rag/interactions/user/${userId}`,
          {
            headers: {
              'API-Key': process.env.NEXT_PUBLIC_API_KEY,
            }
          }
        );
        
        if (!response.ok) throw new Error('Failed to fetch interactions');
        
        const data = await response.json();
        // Extract the last 9 user queries
        const queries = data
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 9)
          .map(interaction => interaction.user_query);
          
        setInteractions(queries);
      } catch (err) {
        setError('Failed to load interactions');
        console.error('Error fetching interactions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchInteractions();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="bg-white rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-3">Recent Inquiries</h3>
        <div className="max-h-64 overflow-y-auto pr-2">
          <ul className="space-y-2">
            {interactions.map((query, index) => (
              <li key={index} className="flex items-center text-gray-700 py-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                <span className="break-words">{query}</span>
              </li>
            ))}
          </ul>
          {interactions.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent inquiries</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InteractionsPanel;