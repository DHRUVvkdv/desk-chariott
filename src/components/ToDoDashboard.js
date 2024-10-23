import React, { useState, useEffect, useMemo } from 'react';
import { Search, RotateCw } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';

const statuses = ['All', 'Pending', 'In Progress', 'Completed'];
const departments = ['All', 'Reception', 'Housekeeping', 'Maintenance'];
const COLORS = ['#3B82F6', '#F97316', '#22C55E', '#A855F7'];

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

const formatStatus = (status) => {
  if (!status) return '';
  const statusMap = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'completed': 'Completed'
  };
  return statusMap[status] || status;
};

const getBackendStatus = (displayStatus) => {
  const backendMap = {
    'Pending': 'pending',
    'In Progress': 'in_progress',
    'Completed': 'completed'
  };
  return backendMap[displayStatus] || displayStatus;
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-orange-500';
    case 'in_progress': return 'bg-blue-500';
    case 'completed': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const formatDepartment = (department) => {
  if (!department) return '';
  return department.charAt(0).toUpperCase() + department.slice(1);
};

export const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [hoveredSector, setHoveredSector] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingDepartment, setIsLoadingDepartment] = useState(false);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/requests/all_status', {
        headers: { 
          'API-Key': process.env.NEXT_PUBLIC_API_KEY,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.requests);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchStatusData = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/requests/all_status', {
        headers: { 
          'API-Key': process.env.NEXT_PUBLIC_API_KEY,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch status data');
      const data = await response.json();
      setOrders(prevOrders => {
        const updatedOrders = [...prevOrders];
        data.requests.forEach(newOrder => {
          const index = updatedOrders.findIndex(order => order.request_id === newOrder.request_id);
          if (index !== -1) {
            updatedOrders[index].status = newOrder.status;
          }
        });
        return updatedOrders;
      });
    } catch (error) {
      console.error('Error fetching status data:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const fetchDepartmentData = async () => {
    setIsLoadingDepartment(true);
    try {
      const response = await fetch('https://p5vfoq23g5ps45rtvky2xydcxe0sbwph.lambda-url.us-east-1.on.aws/api/requests/all_status', {
        headers: { 
          'API-Key': process.env.NEXT_PUBLIC_API_KEY,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch department data');
      const data = await response.json();
      setOrders(prevOrders => {
        const updatedOrders = [...prevOrders];
        data.requests.forEach(newOrder => {
          const index = updatedOrders.findIndex(order => order.request_id === newOrder.request_id);
          if (index !== -1) {
            updatedOrders[index].department = newOrder.department;
          }
        });
        return updatedOrders;
      });
    } catch (error) {
      console.error('Error fetching department data:', error);
    } finally {
      setIsLoadingDepartment(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const sortedOrders = useMemo(() => {
    let sortableOrders = [...orders];
    if (sortConfig.key !== null) {
      sortableOrders.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      const matchesSearch = Object.values(order).some((value) => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      const matchesStatus = statusFilter === 'All' || 
        order.status === getBackendStatus(statusFilter);
      
      const matchesDepartment = departmentFilter === 'All' || 
        order.department.toLowerCase() === departmentFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [sortedOrders, searchTerm, statusFilter, departmentFilter]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const statusData = useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      const displayStatus = formatStatus(order.status);
      acc[displayStatus] = (acc[displayStatus] || 0) + 1;
      return acc;
    }, {});
    return [statusCounts];
  }, [orders]);

  const departmentData = useMemo(() => {
    const deptCounts = orders.reduce((acc, order) => {
      const formattedDept = formatDepartment(order.department);
      acc[formattedDept] = (acc[formattedDept] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gray-100 p-4 w-full h-screen overflow-hidden flex flex-col"
    >
      <motion.h1 variants={itemVariants} className="text-2xl font-bold mb-4 text-gray-800">
        Orders Dashboard
      </motion.h1>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search orders..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants} className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-lg overflow-hidden flex flex-col md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-gray-800">Current Orders</CardTitle>
            <RotateCw
              className={`cursor-pointer text-gray-500 hover:text-gray-700 transition-all ${isLoadingOrders ? 'animate-spin' : ''}`}
              size={20}
              onClick={fetchOrders}
            />
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <div className="h-[calc(115vh-300px)] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[80px]" onClick={() => requestSort('request_id')}>ID</TableHead>
                    <TableHead onClick={() => requestSort('task')}>Task</TableHead>
                    <TableHead onClick={() => requestSort('user_id')}>User</TableHead>
                    <TableHead onClick={() => requestSort('time_issued')}>Time Issued</TableHead>
                    <TableHead onClick={() => requestSort('status')}>Status</TableHead>
                    <TableHead onClick={() => requestSort('department')}>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredOrders.map((order) => (
                      <motion.tr
                        key={order.request_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>{order.request_id.slice(0, 8)}</TableCell>
                        <TableCell className="font-medium">{order.task}</TableCell>
                        <TableCell>{order.user_id}</TableCell>
                        <TableCell>{new Date(order.time_issued).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {formatStatus(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDepartment(order.department)}</TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-800">Order Status Distribution</CardTitle>
              <RotateCw
                className={`cursor-pointer text-gray-500 hover:text-gray-700 transition-all ${isLoadingStatus ? 'animate-spin' : ''}`}
                size={20}
                onClick={fetchStatusData}
              />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart
                  layout="vertical"
                  data={statusData}
                  margin={{
                    right: 50,
                  }}
                  onMouseMove={(state) => {
                    if (state.isTooltipActive) {
                      setHoveredBar(state.activeTooltipIndex);
                    } else {
                      setHoveredBar(null);
                    }
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Legend />
                  {Object.keys(statusData[0] || {}).map((status, index) => (
                    <Bar 
                      key={status} 
                      dataKey={status} 
                      fill={COLORS[index % COLORS.length]} 
                      name={status}
                      opacity={hoveredBar === null || hoveredBar === index ? 1 : 0.5}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg flex-grow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-800">Orders by Department</CardTitle>
              <RotateCw
                className={`cursor-pointer text-gray-500 hover:text-gray-700 transition-all ${isLoadingDepartment ? 'animate-spin' : ''}`}
                size={20}
                onClick={fetchDepartmentData}
              />
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={(_, index) => setHoveredSector(index)}
                    onMouseLeave={() => setHoveredSector(null)}
                  >
                    {departmentData.map((entry, index) => (
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
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};