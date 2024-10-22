"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightsDashboard } from '../../components/InsightsDashboard';
import { UserDataDashboard } from '../../components/UserDashboard';
import { OrdersDashboard } from '../../components/ToDoDashboard';
import { WorkOrderDashboard } from '../../components/WorkOrderDashboard';
import { DocumentManagementDashboard } from '../../components/DocManagerDashboard.js';
import UserAvatar from '../../components/UserAvatar';

import { Calendar, Award, FileText, Users, Wrench, LogOut, Menu } from 'lucide-react';

const DashboardPage = () => {
  const [activePage, setActivePage] = useState('');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [userType, setUserType] = useState('');
  const [userName, setUserName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  const fetchUserDetails = async (email) => {
    try {
      const response = await fetch(`https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/auth/user/${encodeURIComponent(email)}`, {
        headers: {
          'API-Key': process.env.NEXT_PUBLIC_API_KEY,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  useEffect(() => {
    const sessionToken = Cookies.get('session_token');
    const userEmail = Cookies.get('user_email');
    if (!sessionToken || !userEmail) {
      router.push('/login');
      return;
    }

    const loadUserDetails = async () => {
      const userData = await fetchUserDetails(userEmail);
      if (userData) {
        setUserName(`${userData.first_name} ${userData.last_name}`);
        setUserType(userData.staff_type.charAt(0).toUpperCase() + userData.staff_type.slice(1));
        setActivePage(getInitialActivePage(userData.staff_type));
      }
    };

    loadUserDetails();

    const checkBackend = async () => {
      try {
        const response = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/test', {
          headers: {
            'accept': 'application/json',
            'API-Key': process.env.NEXT_PUBLIC_API_KEY
          }
        });
        if (response.ok) {
          const data = await response.text();
          setBackendStatus(`Backend is working: ${data}`);
        } else {
          setBackendStatus('Backend request failed');
        }
      } catch (error) {
        setBackendStatus('Error connecting to backend');
      }
    };

    checkBackend();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('session_token');
    Cookies.remove('user_type');
    Cookies.remove('user_email');
    router.push('/');
  };

  const getInitialActivePage = (staffType) => {
    switch (staffType.toLowerCase()) {
      case 'manager':
        return 'Insights';
      case 'maintenance':
        return 'Work Orders';
      case 'reception':
      case 'housekeeping':
        return 'User Data';
      default:
        return 'User Data';
    }
  };

  const getAvailablePages = () => {
    switch (userType.toLowerCase()) {
      case 'manager':
        return ['To Do', 'Insights', 'Manage Documents', 'User Data'];
      case 'maintenance':
        return ['Work Orders'];
      case 'reception':
      case 'housekeeping':
        return ['User Data', 'Work Orders'];
      default:
        return ['User Data'];
    }
  };

  const renderDashboard = () => {
    switch (activePage) {
      case 'Insights':
        return <InsightsDashboard />;
      case 'User Data':
        return <UserDataDashboard />;
      case 'To Do':
        return <OrdersDashboard />;
      case 'Work Orders':
        return <WorkOrderDashboard />;
      case 'Manage Documents':
        return <DocumentManagementDashboard />;
      default:
        return <UserDataDashboard />;
    }
  };

  const getPageIcon = (page) => {
    switch (page) {
      case 'To Do':
        return <Calendar size={20} />;
      case 'Insights':
        return <Award size={20} />;
      case 'Manage Documents':
        return <FileText size={20} />;
      case 'User Data':
        return <Users size={20} />;
      case 'Work Orders':
        return <Wrench size={20} />;
      default:
        return null;
    }
  };

  const availablePages = getAvailablePages();

  const sidebarVariants = {
    open: { x: 0, transition: { duration: 0.3 } },
    closed: { x: '-100%', transition: { duration: 0.3 } },
  };

  const toggleButtonVariants = {
    open: { x: 182, transition: { duration: 0.3 } },
    closed: { x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <motion.aside
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="w-64 bg-white shadow-md flex flex-col fixed h-full z-20"
      >
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="block">
            <h2 className="text-3xl font-bold">
              Desk <span className="text-sm font-normal text-gray-500">by Chariott</span>
            </h2>
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 flex items-center border-b border-gray-200"
        >
          <div className="w-12 h-12 mr-3 flex-shrink-0">
            <UserAvatar />
          </div>
          <div>
            <h3 className="font-semibold">{userName}</h3>
            <p className="text-sm text-gray-600">{userType}</p>
          </div>
        </motion.div>
        
        <nav className="flex-grow mt-6 space-y-2 px-4">
          <AnimatePresence>
            {availablePages.map((page) => (
              <motion.button
                key={page}
                onClick={() => setActivePage(page)}
                className={`w-full text-left p-3 rounded-lg flex items-center ${
                  activePage === page 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {getPageIcon(page)}
                <span className="ml-3">{page}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </nav>
        <motion.button
          onClick={handleLogout}
          className="w-full p-4 bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={20} className="mr-2" />
          Log Out
        </motion.button>
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-gray-50 border-b border-gray-200"
        >
          <p className="text-sm font-medium">
            Backend Status: 
            <span className={`ml-1 ${backendStatus.includes('working') ? 'text-green-600' : 'text-red-600'}`}>
              {backendStatus}
            </span>
          </p>
        </motion.div> */}
      </motion.aside>
      <motion.button
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={toggleButtonVariants}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Menu size={24} />
      </motion.button>
      <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <motion.div
          key={activePage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {renderDashboard()}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;