import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Heading,
  Text,
  Button,
  Grid,
  GridItem,
  VStack,
  HStack,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Tag,
  Badge,
  Avatar,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { FiPlus, FiFolder, FiCheckCircle, FiMessageSquare, FiClock, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ClientDashboard = () => {
  const { projects, addProject, messages, activities } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newProject, setNewProject] = useState({
    title: '', description: '', budget: '', deadline: '', technology: '', priority: 'Medium'
  });

  const clientProjects = projects.filter(p => p.clientId === user.id);
  const activeCount = clientProjects.filter(p => p.status === 'Active').length;
  const completedCount = clientProjects.filter(p => p.status === 'Completed').length;
  const pendingCount = clientProjects.filter(p => !p.partnerId && p.status === 'Active').length;
  const activeChats = Array.from(new Set(messages.filter(m => m.senderId === user.id || m.receiverId === user.id).map(m => m.projectId))).length;

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!user.isVerified) {
      alert('Your account is unverified. Please verify your email to post projects.');
      return;
    }
    const result = addProject({
      ...newProject,
      clientId: user.id,
      clientName: user.name,
      budget: parseFloat(newProject.budget),
      partnerId: null
    }, user);
    
    if (result.success) {
      onClose();
      setNewProject({ title: '', description: '', budget: '', deadline: '', technology: '', priority: 'Medium' });
    } else {
      alert(result.message);
    }
  };

  const { verifyEmail, resendVerificationEmail } = useAuth();
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleVerifyNow = async () => {
    setSendingVerification(true);
    await resendVerificationEmail();
    setSendingVerification(false);
  };

  return (
    <Box>
      {!user.isVerified && (
        <Box 
          bg="orange.50" 
          p="4" 
          mb="6" 
          borderRadius="xl" 
          border="1px" 
          borderColor="orange.200"
        >
          <HStack justify="space-between">
            <HStack spacing="3">
               <Icon as={FiAlertTriangle} color="orange.500" />
               <VStack align="start" spacing="0">
                 <Text fontWeight="bold" color="orange.700">Email Verification Required</Text>
                 <Text fontSize="sm" color="orange.600">Please verify your email to unlock all platform features like posting projects.</Text>
               </VStack>
            </HStack>
            <Button size="sm" colorScheme="orange" onClick={handleVerifyNow} isLoading={sendingVerification} loadingText="Sending...">
              Verify Now
            </Button>
          </HStack>
        </Box>
      )}
      <Flex justify="space-between" align="center" mb="8">
        <VStack align="start" spacing="1">
          <Heading size="lg">Welcome back, {user.name} 👋</Heading>
          <Text color="gray.500">Manage your projects and communicate with partners.</Text>
        </VStack>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
          Post Project
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6" mb="8">
        <StatsCard title="Active Projects" value={activeCount} icon={FiFolder} trend="+2 this week" color="blue" />
        <StatsCard title="Pending Partner" value={pendingCount} icon={FiClock} color="orange" />
        <StatsCard title="Completed" value={completedCount} icon={FiCheckCircle} color="green" />
        <StatsCard title="Active Chats" value={activeChats} icon={FiMessageSquare} color="purple" />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="8">
        <GridItem>
          <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm">
            <HStack justify="space-between" mb="6">
              <HStack>
                <Heading size="md">Active Projects</Heading>
                <Badge colorScheme="blue" borderRadius="full" px="2">{clientProjects.length}</Badge>
              </HStack>
              <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => navigate('/projects')}>View All</Button>
            </HStack>

            {clientProjects.length === 0 ? (
              <VStack py="12" bg="gray.50" borderRadius="lg" border="2px" borderStyle="dashed" borderColor="gray.200">
                <Icon as={FiFolder} w="10" h="10" color="gray.300" />
                <Text fontWeight="bold">No projects yet</Text>
                <Text color="gray.500" fontSize="sm">Post a project to find a partner.</Text>
              </VStack>
            ) : (
              <VStack spacing="3" align="stretch">
                {clientProjects.slice(0, 5).map(p => (
                  <Box
                    key={p.id}
                    p="4"
                    border="1px"
                    borderColor="gray.100"
                    borderRadius="xl"
                    _hover={{ borderColor: 'blue.300', shadow: 'sm', bg: 'blue.50' }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing="3">
                        <Box p="2" bg="blue.50" borderRadius="lg">
                          <Icon as={FiFolder} color="blue.500" />
                        </Box>
                        <VStack align="start" spacing="0">
                          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{p.title}</Text>
                          <HStack spacing="2">
                            <Badge colorScheme={p.status === 'Completed' ? 'green' : 'blue'} variant="subtle" fontSize="2xs">{p.status}</Badge>
                            <Badge colorScheme={p.priority === 'High' ? 'red' : p.priority === 'Medium' ? 'orange' : 'gray'} variant="subtle" fontSize="2xs">{p.priority}</Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      <VStack align="end" spacing="0">
                        <Text fontWeight="bold" fontSize="sm" color="blue.600">${p.budget?.toLocaleString()}</Text>
                        <Text fontSize="2xs" color="gray.400">{p.partnerName ? `Partner: ${p.partnerName}` : 'No partner yet'}</Text>
                      </VStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
          <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm" mt="8">
            <Heading size="md" mb="4">Latest Project Files</Heading>
            <VStack spacing="3" align="stretch">
              {clientProjects.flatMap(p => p.files || []).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 4).length > 0 ? (
                clientProjects.flatMap(p => p.files || []).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 4).map(file => (
                  <HStack key={file.id} p="3" bg="gray.50" borderRadius="lg" justify="space-between">
                    <HStack spacing="3" overflow="hidden">
                      <Icon as={FiFolder} color="blue.500" />
                      <VStack align="start" spacing="0" overflow="hidden">
                        <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{file.name}</Text>
                        <Text fontSize="2xs" color="gray.400">{file.uploaderName} • {format(new Date(file.uploadDate), 'MMM dd')}</Text>
                      </VStack>
                    </HStack>
                    <Button size="xs" variant="ghost" as="a" href={file.data} download={file.name}>Download</Button>
                  </HStack>
                ))
              ) : (
                <Text color="gray.400" fontSize="sm" fontStyle="italic">No files shared yet.</Text>
              )}
            </VStack>
          </Box>
        </GridItem>

        <GridItem>
           <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm">
              <Heading size="md" mb="6">Recent Activity</Heading>
              <VStack align="stretch" spacing="4">
                 {activities.length === 0 ? (
                   <Text fontSize="sm" color="gray.400">No recent activity.</Text>
                 ) : (
                   activities.slice(0, 5).map(a => (
                     <HStack key={a.id} align="start" spacing="3">
                        <Avatar size="xs" name={user.name} />
                        <VStack align="start" spacing="0">
                           <Text fontSize="sm" fontWeight="medium">{a.content}</Text>
                           <Text fontSize="xs" color="gray.400">{new Date(a.timestamp).toLocaleTimeString()}</Text>
                        </VStack>
                     </HStack>
                   ))
                 )}
              </VStack>
           </Box>
        </GridItem>
      </Grid>

      {/* Create Project Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateProject}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Project Title</FormLabel>
                  <Input 
                    placeholder="e.g. Modern React Dashboard" 
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea 
                    placeholder="Describe your requirements..." 
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                  />
                </FormControl>

                <HStack w="full">
                  <FormControl isRequired>
                    <FormLabel>Budget ($)</FormLabel>
                    <Input 
                      type="number" 
                      value={newProject.budget}
                      onChange={e => setNewProject({...newProject, budget: e.target.value})}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Deadline</FormLabel>
                    <Input 
                      type="date" 
                      value={newProject.deadline}
                      onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                    />
                  </FormControl>
                </HStack>

                <HStack w="full">
                  <FormControl isRequired>
                    <FormLabel>Technology</FormLabel>
                    <Input 
                      placeholder="e.g. React, Node.js" 
                      value={newProject.technology}
                      onChange={e => setNewProject({...newProject, technology: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      value={newProject.priority}
                      onChange={e => setNewProject({...newProject, priority: e.target.value})}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Select>
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" type="submit">Publish Project</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const StatsCard = ({ title, value, icon, trend, color }) => {
  return (
    <Box bg="white" p="5" borderRadius="xl" border="1px" borderColor={`${color}.100`} shadow="sm">
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
            {title}
          </Text>
          <Heading size="lg" mt="1">{value}</Heading>
          {trend && (
            <Text fontSize="xs" color="green.500" mt="1" fontWeight="medium">
               {trend}
            </Text>
          )}
        </Box>
        <Box p="3" bg={`${color}.50`} borderRadius="lg">
          <Icon as={icon} w="6" h="6" color={`${color}.500`} />
        </Box>
      </Flex>
    </Box>
  );
};

export default ClientDashboard;
