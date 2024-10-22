import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Toast component (reused from previous example)
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

export const UserDataDashboard = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/auth/allnormal', {
                    headers: {
                        'API-Key': process.env.NEXT_PUBLIC_API_KEY,
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
                setUsers(data.map(user => ({
                    ...user,
                    isOpen: false,
                    activeTab: 'Preferences'
                })));
                showToast('Users loaded successfully', 'success');
            } catch (error) {
                console.error('Error fetching users:', error);
                showToast('Failed to load users', 'error');
            }
        };
        fetchUsers();
    }, []);

    const toggleDropdown = (userId) => {
        setUsers(users.map(user => 
            user.user_id === userId ? { ...user, isOpen: !user.isOpen } : user
        ));
    };

    const changeTab = (userId, tab) => {
        setUsers(users.map(user => 
            user.user_id === userId ? { ...user, activeTab: tab } : user
        ));
    };

    const TabContent = ({ tab, user }) => {
        switch(tab) {
            case 'Preferences':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p>Dietary Restrictions: {user.preferences.dietary_restrictions}</p>
                        <p>Bedding Pillows: {user.preferences.bedding_pillows}</p>
                        <p>Climate Control: {user.preferences.climate_control}</p>
                        <p>Room View: {user.preferences.room_view}</p>
                        <p>Quiet Room: {user.preferences.quiet_room ? 'Yes' : 'No'}</p>
                    </motion.div>
                );
            case 'Recommendations':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {user.recommendations.length > 0 ? (
                            <ul>
                                {user.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        ) : <p>No recommendations available.</p>}
                    </motion.div>
                );
            case 'Inquiries':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p>Recent inquiries: Asked about local restaurants, Requested extra pillows, Inquired about late check-out</p>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = Object.values(user).some(
                value => typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesFilter = !filterColumn || !filterValue || 
                (user[filterColumn] && user[filterColumn].toString().toLowerCase() === filterValue.toLowerCase());
            return matchesSearch && matchesFilter;
        });
    }, [users, searchTerm, filterColumn, filterValue]);

    const uniqueValues = useMemo(() => {
        const values = {};
        ['first_name', 'last_name', 'loyalty_program'].forEach(column => {
            values[column] = [...new Set(users.map(user => user[column]))];
        });
        return values;
    }, [users]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-1 p-4 sm:p-8 overflow-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow mb-6 p-4"
                >
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search users"
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <select
                                className="appearance-none bg-white border rounded-md pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                value={filterColumn}
                                onChange={(e) => {
                                    setFilterColumn(e.target.value);
                                    setFilterValue('');
                                }}
                            >
                                <option value="">Filter by...</option>
                                <option value="first_name">First Name</option>
                                <option value="last_name">Last Name</option>
                                <option value="loyalty_program">Loyalty Status</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <Filter size={16} />
                            </div>
                        </div>
                        {filterColumn && (
                            <select
                                className="appearance-none bg-white border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                            >
                                <option value="">Select {filterColumn}</option>
                                {uniqueValues[filterColumn].map(value => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-lg shadow overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loyalty Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interaction Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredUsers.map((user) => (
                                        <React.Fragment key={user.user_id}>
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">{`${user.first_name} ${user.last_name}`}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap capitalize">{user.loyalty_program}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{user.interaction_counter}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <motion.button 
                                                        className="text-blue-600 hover:text-blue-800 flex items-center focus:outline-none"
                                                        onClick={() => toggleDropdown(user.user_id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        View
                                                        {user.isOpen ? <ChevronUp className="ml-1" size={16} /> : <ChevronDown className="ml-1" size={16} />}
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                            <AnimatePresence>
                                                {user.isOpen && (
                                                    <motion.tr
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                                                            <div className="flex flex-col sm:flex-row">
                                                                <div className="w-full sm:w-1/4 pr-0 sm:pr-4 space-y-2 mb-4 sm:mb-0">
                                                                    {['Preferences', 'Recommendations', 'Inquiries'].map((tab) => (
                                                                        <motion.button
                                                                            key={tab}
                                                                            className={`w-full text-left px-4 py-2 rounded-md ${
                                                                                user.activeTab === tab
                                                                                    ? 'bg-blue-500 text-white'
                                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                            }`}
                                                                            onClick={() => changeTab(user.user_id, tab)}
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                        >
                                                                            {tab}
                                                                        </motion.button>
                                                                    ))}
                                                                </div>
                                                                <div className="w-full sm:w-3/4 bg-white p-4 rounded-md shadow">
                                                                    <TabContent tab={user.activeTab} user={user} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
                {filteredUsers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-4 text-gray-500"
                    >
                        No users found matching the current filters.
                    </motion.div>
                )}
            </div>
            {/* <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence> */}
        </div>
    );
};