import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

// Toast component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white`}
    >
      {message}
    </motion.div>
  );
};

// WorkOrderCard component
const WorkOrderCard = ({ wo, status, moveWorkOrder }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    hover: {
      scale: 1.05,
      rotateZ: Math.random() * 2 - 1, // Random slight rotation between -1 and 1 degree
      boxShadow: "0px 5px 10px rgba(0,0,0,0.2)",
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        yoyo: Infinity, // Creates a continuous pulsing effect
      }
    }
  };

  return (
    <motion.div
      key={wo.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white p-3 rounded mb-2 shadow-sm relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 z-0"
      />
      <p className="relative z-10">{wo.title}</p>
      <div className="flex flex-wrap justify-end mt-2 relative z-10">
        {status === 'inProgress' && (
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            onClick={() => moveWorkOrder(wo.id, status, 'pending')}
            className="text-sm bg-[#D9D9D6] hover:bg-gray-300 rounded px-2 py-1 mr-2 mb-2"
          >
            ← Pending
          </motion.button>
        )}
        {status === 'pending' && (
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            onClick={() => moveWorkOrder(wo.id, status, 'inProgress')}
            className="text-sm bg-green-200 hover:bg-green-300 rounded px-2 py-1 mr-2 mb-2"
          >
            In Progress →
          </motion.button>
        )}
        {status === 'inProgress' && (
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            onClick={() => moveWorkOrder(wo.id, status, 'completed')}
            className="text-sm bg-green-300 hover:bg-green-400 rounded px-2 py-1 mb-2"
          >
            Completed →
          </motion.button>
        )}
        {status === 'completed' && (
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            onClick={() => moveWorkOrder(wo.id, status, 'inProgress')}
            className="text-sm bg-[#D9D9D6] hover:bg-blue-300 rounded px-2 py-1 mr-2 mb-2"
          >
            ← In Progress
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// Main WorkOrderDashboard component
export const WorkOrderDashboard = () => {
  const [workOrders, setWorkOrders] = useState({
    pending: [],
    inProgress: [],
    completed: []
  });
  const [userDepartment, setUserDepartment] = useState('');
  const [allWorkOrders, setAllWorkOrders] = useState([]);
  const [changedOrders, setChangedOrders] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userType = Cookies.get('user_type');
    setUserDepartment(userType);
  }, []);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/requests/all_status', {
          headers: { 
            'API-Key': process.env.NEXT_PUBLIC_API_KEY, 
          }
        });
        if (!response.ok) throw new Error('Failed to fetch work orders');
        const data = await response.json();
        setAllWorkOrders(data.requests);
      } catch (error) {
        console.error('Error fetching work orders:', error);
        showToast('Failed to fetch work orders. Please try again.', 'error');
      }
    };

    fetchWorkOrders();
  }, []);

  useEffect(() => {
    if (userDepartment && allWorkOrders.length > 0) {
      processWorkOrders(allWorkOrders);
    }
  }, [userDepartment, allWorkOrders]);

  const processWorkOrders = (orders) => {
    const filteredOrders = orders.filter(order => 
      order.department.toLowerCase() === userDepartment.toLowerCase()
    );

    const categorizedOrders = filteredOrders.reduce((acc, order) => {
      const category = order.status === 'completed' ? 'completed' : 
                       order.status === 'pending' ? 'pending' : 'inProgress';
      acc[category].push({
        id: order.request_id,
        title: `${order.task} (${order.user_id})`,
        status: order.status
      });
      return acc;
    }, { pending: [], inProgress: [], completed: [] });

    setWorkOrders(categorizedOrders);
  };

  const moveWorkOrder = (id, from, to) => {
    setWorkOrders(prevState => {
      const workOrder = prevState[from].find(wo => wo.id === id);
      const apiStatus = to === 'inProgress' ? 'in_progress' : to;
      const updatedWorkOrder = { ...workOrder, status: apiStatus };
      setChangedOrders(prev => ({ ...prev, [id]: updatedWorkOrder }));
      return {
        ...prevState,
        [from]: prevState[from].filter(wo => wo.id !== id),
        [to]: [...prevState[to], updatedWorkOrder],
      };
    });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSubmit = async () => {
    const changedOrderIds = Object.keys(changedOrders);
    if (changedOrderIds.length === 0) {
      showToast('No changes to submit.', 'error');
      return;
    }

    try {
      const updatePromises = changedOrderIds.map(id => {
        const order = changedOrders[id];
        const body = JSON.stringify({
          status: order.status,
          time_completed: order.status === 'completed' ? new Date().toISOString() : null
        });

        console.log(`Submitting update for order ${id}:`, body);

        return fetch(`https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/requests/requests/${id}`, {
          method: 'PUT',
          headers: {
            'API-Key': process.env.NEXT_PUBLIC_API_KEY,
            'Content-Type': 'application/json'
          },
          body: body
        }).then(async response => {
          const responseData = await response.text();
          console.log(`Response for order ${id}:`, response.status, responseData);

          if (!response.ok) {
            throw new Error(`Failed to update order ${id}: ${response.status} ${responseData}`);
          }
          return responseData;
        });
      });

      await Promise.all(updatePromises);
      showToast('Work orders updated successfully!');
      setChangedOrders({});
    } catch (error) {
      console.error('Error updating work orders:', error);
      showToast('Failed to update work orders. Please try again.', 'error');
    }
  };

  const renderWorkOrderColumn = (title, status) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-100 p-4 rounded-lg shadow"
    >
      <h3 className="font-bold mb-4">{title}</h3>
      <AnimatePresence>
        {workOrders[status].map(wo => (
          <WorkOrderCard
            key={wo.id}
            wo={wo}
            status={status}
            moveWorkOrder={moveWorkOrder}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-gray-800"
        >
          Work Orders
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-700">{userDepartment}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {renderWorkOrderColumn('Pending', 'pending')}
            {renderWorkOrderColumn('In Progress', 'inProgress')}
            {renderWorkOrderColumn('Completed', 'completed')}
          </div>
          <div className="flex justify-end">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="bg-[#1d2121] hover:bg-[#0d0f0f] text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Submit Work Orders
            </motion.button>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};