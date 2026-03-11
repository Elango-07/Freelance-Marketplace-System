import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Badge,
  Grid,
  GridItem,
  VStack,
  HStack,
  Icon,
  Avatar,
  Divider,
  Button,
  Flex,
  Progress,
} from '@chakra-ui/react';
import { FiBriefcase, FiDollarSign, FiClock, FiActivity, FiLayout, FiCheckCircle, FiStar, FiFolder, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import BadgeIcon from '../components/BadgeIcon';
import { format } from 'date-fns';

const PartnerDashboard = () => {
  const { projects, activities, getReputationData } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const partnerProjects = projects.filter(p => p.partnerId === user.id);
  const assignedProjects = partnerProjects;
  const repData = getReputationData(user.id);

  const activeProjectsCount = partnerProjects.filter(p => p.status === 'Active').length;
  const completedCount = repData.completedCount;
  const pendingCount = partnerProjects.filter(p => p.status === 'Pending').length;
  
  const totalEarnings = partnerProjects
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.budget, 0);

  return (
    <Box>
      <Flex justify="space-between" align="start" mb="8">
        <Box>
          <Heading size="lg">Welcome back, {user.name}!</Heading>
          <HStack mt="2" spacing="2">
            <Badge colorScheme="blue" variant="subtle">Partner ID: #{user.id}</Badge>
            {repData.badges.map(badge => (
              <BadgeIcon key={badge} type={badge} />
            ))}
          </HStack>
        </Box>
        <VStack align="end">
          <HStack color="yellow.400" spacing="1">
            <Icon as={FiStar} fill="currentColor" />
            <Text fontWeight="bold" fontSize="xl">{repData.avgRating}</Text>
            <Text color="gray.400" fontSize="sm">({repData.reviewCount} reviews)</Text>
          </HStack>
          <Text fontSize="xs" color="gray.500" fontWeight="bold">REPUTATION SCORE: {repData.score}/100</Text>
          <Progress value={repData.score} size="xs" colorScheme="blue" w="150px" borderRadius="full" />
        </VStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6" mb="8">
        <StatsCard title="Active Projects" value={activeProjectsCount} icon={FiActivity} color="blue" />
        <StatsCard title="Completed" value={completedCount} icon={FiCheckCircle} color="green" />
        <StatsCard title="Success Rate" value={`${repData.successRate}%`} icon={FiLayout} color="purple" />
        <StatsCard title="Total Earnings" value={`$${partnerProjects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}`} icon={FiDollarSign} color="orange" />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="8">
        <GridItem>
          <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm">
            <HStack justify="space-between" mb="6">
               <HStack>
                  <Heading size="md">My Tasks</Heading>
                  <Badge colorScheme="purple" borderRadius="full" px="2">{assignedProjects.length}</Badge>
               </HStack>
            </HStack>

            {assignedProjects.length === 0 ? (
              <VStack py="12" bg="gray.50" borderRadius="lg" border="2px" borderStyle="dashed" borderColor="gray.200">
                <Icon as={FiBriefcase} w="10" h="10" color="gray.300" />
                <Text fontWeight="bold">No assignments yet</Text>
                <Text fontSize="sm" color="gray.500">Waiting for project assignment.</Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing="4">
                {assignedProjects.map(p => (
                  <Box 
                    key={p.id} 
                    p="4" 
                    bg="white" 
                    border="1px" 
                    borderColor="gray.200" 
                    borderRadius="lg" 
                    _hover={{ borderColor: 'purple.400', shadow: 'md' }} 
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <HStack justify="space-between" mb="2">
                      <Heading size="sm" noOfLines={1}>{p.title}</Heading>
                      <Badge colorScheme={p.priority === 'High' ? 'red' : 'green'} variant="subtle">{p.priority}</Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" mb="4" noOfLines={2}>{p.description}</Text>
                    <HStack justify="space-between" fontSize="xs" color="gray.600">
                      <HStack><Icon as={FiActivity} /><Text>{p.status}</Text></HStack>
                      <Text fontWeight="bold">${p.budget.toLocaleString()}</Text>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </GridItem>

        <GridItem>
           <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm">
              <Heading size="md" mb="6">Platform Pulse</Heading>
              <VStack align="stretch" spacing="4">
                 {activities.slice(0, 6).map(a => (
                    <HStack key={a.id} align="start" spacing="3">
                       <Box p="2" bg="blue.50" borderRadius="md">
                          <Icon as={FiActivity} color="blue.500" />
                       </Box>
                       <VStack align="start" spacing="0">
                          <Text fontSize="sm" fontWeight="medium">{a.message}</Text>
                          <Text fontSize="xs" color="gray.400">{new Date(a.timestamp).toLocaleTimeString()}</Text>
                       </VStack>
                    </HStack>
                 ))}
                 <Divider />
                 <Button size="sm" variant="outline" colorScheme="purple">View Earnings Breakdown</Button>
              </VStack>
           </Box>
           {/* Latest Project Files */}
           <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm" mt="8">
             <HStack justify="space-between" mb="4">
               <Heading size="md">Latest Files</Heading>
             </HStack>
             <VStack spacing="3" align="stretch">
               {partnerProjects.flatMap(p => (p.files || []).map(f => ({ ...f, projectTitle: p.title, projectId: p.id }))).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 4).length > 0 ? (
                 partnerProjects.flatMap(p => (p.files || []).map(f => ({ ...f, projectTitle: p.title, projectId: p.id }))).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 4).map(file => (
                   <HStack key={file.id} p="3" bg="gray.50" borderRadius="lg" justify="space-between">
                     <HStack spacing="3" overflow="hidden">
                       <Icon as={FiFolder} color="purple.500" />
                       <VStack align="start" spacing="0" overflow="hidden">
                         <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{file.name}</Text>
                         <Text fontSize="2xs" color="gray.400">{file.projectTitle} · {file.uploaderName}</Text>
                       </VStack>
                     </HStack>
                     <Button size="xs" variant="ghost" as="a" href={file.data} download={file.name} leftIcon={<FiDownload />}>Save</Button>
                   </HStack>
                 ))
               ) : (
                 <Text color="gray.400" fontSize="sm" fontStyle="italic">No files uploaded yet.</Text>
               )}
             </VStack>
           </Box>

           {/* Recent Reviews */}
           <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm" mt="8">
            <HStack justify="space-between" mb="4">
              <Heading size="md">Recent Reviews</Heading>
              <Button size="xs" variant="ghost" colorScheme="blue" onClick={() => navigate('/profile')}>View All</Button>
            </HStack>
            <VStack spacing="4" align="stretch">
              {repData.recentReviews.length > 0 ? (
                repData.recentReviews.map(review => (
                   <Box key={review.id} p="4" bg="gray.50" borderRadius="lg">
                      <Flex justify="space-between" mb="2">
                         <HStack>
                            <Avatar size="xs" name={review.authorName} />
                            <Text fontSize="sm" fontWeight="bold">{review.authorName}</Text>
                         </HStack>
                         <HStack spacing="1">
                            {[1, 2, 3, 4, 5].map(s => (
                               <Icon key={s} as={FiStar} boxSize="3" color={s <= review.rating ? "yellow.400" : "gray.200"} fill={s <= review.rating ? "currentColor" : "none"} />
                            ))}
                         </HStack>
                      </Flex>
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>"{review.comment}"</Text>
                   </Box>
                ))
              ) : (
                <Text color="gray.400" fontSize="sm" fontStyle="italic">No reviews yet.</Text>
              )}
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <Box bg="white" p="5" borderRadius="xl" border="1px" borderColor={`${color}.100`} shadow="sm">
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">
            {title}
          </Text>
          <Heading size="lg" mt="1">{value}</Heading>
        </Box>
        <Box p="3" bg={`${color}.50`} borderRadius="lg">
          <Icon as={icon} w="6" h="6" color={`${color}.500`} />
        </Box>
      </Flex>
    </Box>
  );
};

export default PartnerDashboard;
