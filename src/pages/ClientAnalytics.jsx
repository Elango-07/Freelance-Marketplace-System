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
  CircularProgress,
  CircularProgressLabel,
  Grid
} from '@chakra-ui/react';
import { 
  FiFolder, 
  FiCheckCircle, 
  FiDollarSign, 
  FiClock,
  FiPieChart,
  FiArrowUpRight
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format, subMonths, startOfMonth } from 'date-fns';

const ClientAnalytics = () => {
  const { user } = useAuth();
  const { projects } = useAppContext();

  const clientProjects = projects.filter(p => p.clientId === user.id);
  const completedCount = clientProjects.filter(p => p.status === 'Completed').length;
  const activeCount = clientProjects.filter(p => p.status === 'Active').length;
  
  const totalSpending = clientProjects
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.budget, 0);

  const completionRate = clientProjects.length > 0 
    ? Math.round((completedCount / clientProjects.length) * 100) 
    : 0;

  // Monthly Spending Data
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return {
      month: format(d, 'MMM'),
      spending: 0
    };
  }).reverse();

  clientProjects.filter(p => p.status === 'Completed').forEach(p => {
    const finishDate = new Date(p.updatedAt || p.createdAt || Date.now());
    const monthStr = format(finishDate, 'MMM');
    const entry = last6Months.find(m => m.month === monthStr);
    if (entry) entry.spending += p.budget;
  });

  const StatCard = ({ title, value, icon, color }) => (
    <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
      <Flex justify="space-between" align="end">
        <VStack align="start" spacing="1">
          <Text color="gray.500" fontWeight="bold" fontSize="xs">{title.toUpperCase()}</Text>
          <Text fontSize="2xl" fontWeight="black">{value}</Text>
        </VStack>
        <Box p="3" bg={`${color}.50`} borderRadius="xl" color={`${color}.500`}>
          <Icon as={icon} boxSize="6" />
        </Box>
      </Flex>
    </Box>
  );

  return (
    <Box>
      <VStack align="start" spacing="1" mb="8">
        <Heading size="lg">Project Insights</Heading>
        <Text color="gray.500">Analyze your project requests and spending patterns.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mb="8">
        <StatCard title="Total Projects" value={clientProjects.length} icon={FiFolder} color="blue" />
        <StatCard title="Active Requests" value={activeCount} icon={FiClock} color="orange" />
        <StatCard title="Total Investment" value={`$${totalSpending.toLocaleString()}`} icon={FiDollarSign} color="green" />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '3fr 2fr' }} gap="8" mb="8">
        <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
          <Heading size="md" mb="6">Spending History (USD)</Heading>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spending" fill="#3182ce" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <VStack spacing="6" align="stretch">
          <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm" textAlign="center">
            <Heading size="sm" mb="4">Completion Rate</Heading>
            <CircularProgress value={completionRate} size="150px" color="green.400" thickness="12px">
              <CircularProgressLabel>
                <VStack spacing="0">
                  <Text fontSize="2xl" fontWeight="bold">{completionRate}%</Text>
                  <Text fontSize="xs" color="gray.500">Success</Text>
                </VStack>
              </CircularProgressLabel>
            </CircularProgress>
            <Text mt="4" fontSize="xs" color="gray.500">
               {completedCount} of {clientProjects.length} projects successfully finalized.
            </Text>
          </Box>

          <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
            <Heading size="sm" mb="4">Project Health</Heading>
            <VStack align="stretch" spacing="4">
               <Box>
                 <Flex justify="space-between" mb="1">
                    <Text fontSize="xs" fontWeight="bold">ACTIVE PROGRESS</Text>
                    <Text fontSize="xs" fontWeight="bold">92%</Text>
                 </Flex>
                 <Progress value={92} size="xs" colorScheme="blue" borderRadius="full" />
               </Box>
               <Box>
                 <Flex justify="space-between" mb="1">
                    <Text fontSize="xs" fontWeight="bold">REVIEWS GIVEN</Text>
                    <Text fontSize="xs" fontWeight="bold">{completedCount}</Text>
                 </Flex>
                 <Progress value={(completedCount / (projects.length || 1)) * 100} size="xs" colorScheme="green" borderRadius="full" />
               </Box>
            </VStack>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
};

export default ClientAnalytics;
