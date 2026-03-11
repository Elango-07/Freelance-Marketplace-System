import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Progress,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Avatar
} from '@chakra-ui/react';
import { 
  FiBriefcase, 
  FiCheckCircle, 
  FiStar, 
  FiTrendingUp, 
  FiDollarSign,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format, subMonths, startOfMonth } from 'date-fns';

const PartnerAnalytics = () => {
  const { user } = useAuth();
  const { projects, reviews, getReputationData } = useAppContext();

  const partnerProjects = projects.filter(p => p.partnerId === user.id);
  const completedProjects = partnerProjects.filter(p => p.status === 'Completed');
  const repData = getReputationData(user.id);

  // Monthly Earnings Estimation (simulated based on completed projects)
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return {
      month: format(d, 'MMM'),
      fullDate: startOfMonth(d),
      earnings: 0
    };
  }).reverse();

  completedProjects.forEach(p => {
    const finishDate = new Date(p.updatedAt || p.createdAt || Date.now());
    const monthStr = format(finishDate, 'MMM');
    const entry = last6Months.find(m => m.month === monthStr);
    if (entry) entry.earnings += p.budget;
  });

  const totalEarnings = completedProjects.reduce((sum, p) => sum + p.budget, 0);

  const StatCard = ({ title, value, helpText, icon, color }) => (
    <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
      <Flex justify="space-between" align="start">
        <Stat>
          <StatLabel color="gray.500" fontWeight="bold" fontSize="xs">{title.toUpperCase()}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="extrabold">{value}</StatNumber>
          {helpText && (
            <StatHelpText>
              <StatArrow type="increase" />
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        <Box p="3" bg={`${color}.50`} borderRadius="xl" color={`${color}.500`}>
          <Icon as={icon} boxSize="6" />
        </Box>
      </Flex>
    </Box>
  );

  return (
    <Box>
      <VStack align="start" spacing="1" mb="8">
        <Heading size="lg">My Analytics</Heading>
        <Text color="gray.500">Track your performance and earnings on Freelance Bridge.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6" mb="8">
        <StatCard title="Total Assigned" value={partnerProjects.length} icon={FiBriefcase} color="purple" />
        <StatCard title="Completed" value={completedProjects.length} icon={FiCheckCircle} color="green" />
        <StatCard title="Avg Rating" value={repData.avgRating} icon={FiStar} color="yellow" />
        <StatCard title="Earnings" value={`$${totalEarnings.toLocaleString()}`} icon={FiDollarSign} color="blue" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="8" mb="8">
        <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
          <Heading size="md" mb="6">Earnings Trend</Heading>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last6Months}>
                <defs>
                  <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182ce" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3182ce" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="earnings" stroke="#3182ce" fillOpacity={1} fill="url(#colorEarn)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
          <Heading size="md" mb="6">Reputation Breakdown</Heading>
          <VStack spacing="6" align="stretch">
             <Box>
                <Flex justify="space-between" mb="2">
                   <Text fontSize="sm" fontWeight="bold">Platform Reputation</Text>
                   <Text fontSize="sm" fontWeight="bold" color="blue.500">{repData.score}/100</Text>
                </Flex>
                <Progress value={repData.score} size="sm" colorScheme="blue" borderRadius="full" />
             </Box>
             
             <Box pt="4">
                <Text fontSize="xs" fontWeight="extrabold" color="gray.400" mb="4">EARNED BADGES</Text>
                <HStack spacing="4" wrap="wrap">
                   {repData.badges.length > 0 ? (
                     repData.badges.map(badge => (
                       <VStack key={badge} p="3" bg="gray.50" borderRadius="xl" spacing="1" minW="100px">
                          <Icon as={FiTrendingUp} color="blue.500" />
                          <Text fontSize="2xs" fontWeight="bold">{badge}</Text>
                       </VStack>
                     ))
                   ) : (
                     <Text fontSize="xs" color="gray.400" fontStyle="italic">Complete more projects to earn badges!</Text>
                   )}
                </HStack>
             </Box>

             <Box pt="2">
                <StatCard title="Success Rate" value={`${repData.successRate}%`} icon={FiPieChart} color="emerald" />
             </Box>
          </VStack>
        </Box>
      </SimpleGrid>

      <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
        <Heading size="md" mb="6">Project Status Overview</Heading>
        <HStack spacing="8" justify="center" p="4">
           {['Active', 'Completed', 'Pending'].map(status => (
             <VStack key={status}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">{status.toUpperCase()}</Text>
                <Text fontSize="3xl" fontWeight="black">{partnerProjects.filter(p => p.status === status).length}</Text>
                <Badge colorScheme={status === 'Completed' ? 'green' : status === 'Active' ? 'blue' : 'orange'}>{status}</Badge>
             </VStack>
           ))}
        </HStack>
      </Box>
    </Box>
  );
};

export default PartnerAnalytics;
