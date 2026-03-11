import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Progress,
  Divider,
  IconButton,
  Tooltip,
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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Image,
  Link,
  Grid,
  GridItem,
  Avatar
} from '@chakra-ui/react';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiDollarSign, 
  FiClock, 
  FiMessageSquare, 
  FiFileText, 
  FiPaperclip, 
  FiTrash2, 
  FiEdit,
  FiActivity,
  FiDownload,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiStar
} from 'react-icons/fi';
import MilestoneGate from '../components/MilestoneGate';
import RatingModal from '../components/RatingModal';
import FileManager from '../components/FileManager';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    projects, 
    deleteProject, 
    updateProject, 
    updateProjectProgress, 
    logRecentlyViewed, 
    addFileToProject,
    assignPartner,
    reviews
  } = useAppContext();
  const { users } = useAuth();
  
  const project = projects.find(p => p.id === Number(id));
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isProgressOpen, onOpen: onProgressOpen, onClose: onProgressClose } = useDisclosure();
  const { isOpen: isRatingOpen, onOpen: onRatingOpen, onClose: onRatingClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  
  const [selectedPartner, setSelectedPartner] = useState('');
  
  const [tempProgress, setTempProgress] = useState(project?.progress || 0);
  const [editForm, setEditForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    budget: project?.budget || '',
    priority: project?.priority || 'Medium'
  });

  // Check if current user has already reviewed this project
  const userReview = reviews.find(r => r.projectId === project?.id && r.authorId === user.id);

  useEffect(() => {
    if (project) {
      logRecentlyViewed(project.id);
      setTempProgress(project.progress);
      setEditForm({
        title: project.title,
        description: project.description,
        budget: project.budget,
        priority: project.priority
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // only re-run when the URL id changes

  if (!project) {
    return (
      <VStack h="60vh" justify="center" spacing="4">
        <Icon as={FiAlertCircle} w="12" h="12" color="gray.300" />
        <Text fontSize="lg" fontWeight="medium">Project not found</Text>
        <Button variant="link" colorScheme="blue" onClick={() => navigate('/projects')}>Back to Projects</Button>
      </VStack>
    );
  }

  const handleDelete = () => {
    deleteProject(project.id);
    navigate('/projects');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProject(project.id, {
      ...editForm,
      budget: parseFloat(editForm.budget)
    });
    onEditClose();
  };

  const handleUpdateProgress = () => {
    updateProjectProgress(project.id, parseInt(tempProgress));
    onProgressClose();
  };

  return (
    <Box>
      {/* Header */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb="8" 
        p="4" 
        bg="white" 
        borderRadius="xl" 
        shadow="sm" 
        border="1px" 
        borderColor="gray.100"
        position="sticky"
        top="0"
        zIndex="10"
      >
        <HStack spacing="4">
          <IconButton 
            icon={<FiArrowLeft />} 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            aria-label="Back"
          />
          <VStack align="start" spacing="0">
            <HStack>
              <Heading size="md">{project.title}</Heading>
              <Badge colorScheme={project.priority === 'High' ? 'red' : 'orange'}>{project.priority}</Badge>
            </HStack>
            <Text fontSize="xs" color="gray.400" fontWeight="bold">ID: #{project.id}</Text>
          </VStack>
        </HStack>

        <HStack spacing="2">
          {user.role === 'Admin' && (
            <>
              {!project.partnerId && <Button leftIcon={<FiPlus />} size="sm" colorScheme="purple" onClick={onAssignOpen}>Assign Partner</Button>}
              <Button leftIcon={<FiActivity />} size="sm" onClick={onProgressOpen}>Update Progress</Button>
            </>
          )}
          {user.role === 'Client' && project.status !== 'Completed' && (
            <>
              <Button colorScheme="green" size="sm" leftIcon={<FiCheckCircle />} onClick={() => {
                updateProject(project.id, { status: 'Completed', progress: 100 });
                onRatingOpen();
              }}>Complete Project</Button>
              <Button leftIcon={<FiEdit />} size="sm" onClick={onEditOpen}>Edit</Button>
              <Button leftIcon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" onClick={onDeleteOpen}>Delete</Button>
            </>
          )}
          {project.status === 'Completed' && !userReview && (
            <Button colorScheme="yellow" size="sm" leftIcon={<FiStar />} onClick={onRatingOpen}>
              {user.role === 'Client' ? 'Rate Partner' : 'Rate Client'}
            </Button>
          )}
          <Button leftIcon={<FiMessageSquare />} colorScheme="blue" size="sm" onClick={() => navigate(`/chat/${project.id}`)}>Open Chat</Button>
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap="8">
        <GridItem>
          <VStack spacing="6" align="stretch">
            <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm">
              <Heading size="sm" mb="4">Project Overview</Heading>
              <Text color="gray.600" lineHeight="tall" bg="gray.50" p="4" borderRadius="lg">
                {project.description}
              </Text>
              
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing="4" mt="8">
                <Box p="3" border="1px" borderColor="gray.100" borderRadius="lg">
                   <HStack color="gray.400" mb="1"><Icon as={FiDollarSign} size="12" /><Text fontSize="xs" fontWeight="bold">BUDGET</Text></HStack>
                   <Text fontSize="lg" fontWeight="bold">${(project.budget || 0).toLocaleString()}</Text>
                </Box>
                <Box p="3" border="1px" borderColor="gray.100" borderRadius="lg">
                   <HStack color="gray.400" mb="1"><Icon as={FiCalendar} size="12" /><Text fontSize="xs" fontWeight="bold">DEADLINE</Text></HStack>
                   <Text fontSize="sm" fontWeight="bold">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</Text>
                </Box>
                <Box p="3" border="1px" borderColor="gray.100" borderRadius="lg">
                   <HStack color="gray.400" mb="1"><Icon as={FiClock} size="12" /><Text fontSize="xs" fontWeight="bold">STATUS</Text></HStack>
                   <HStack><Box w="2" h="2" borderRadius="full" bg="blue.500" /><Text fontSize="sm" fontWeight="bold">{project.status}</Text></HStack>
                </Box>
              </SimpleGrid>
            </Box>

            {/* File Management System */}
            {(user.role === 'Admin' || user.id === project.clientId || user.id === project.partnerId) ? (
              <FileManager project={project} />
            ) : (
              <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm" textAlign="center">
                <Icon as={FiAlertCircle} w="8" h="8" color="orange.400" mb="2" />
                <Heading size="sm" mb="2">Access Restricted</Heading>
                <Text fontSize="xs" color="gray.500">Only the client and assigned partner can access project files.</Text>
              </Box>
            )}
          </VStack>
        </GridItem>

        <GridItem>
          <VStack spacing="6" align="stretch">
            <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm">
              <MilestoneGate project={project} />
            </Box>

            <Box bg="white" p="6" borderRadius="xl" border="1px" borderColor="gray.100" shadow="sm">
               <Heading size="sm" mb="4">Project Team</Heading>
               <VStack align="stretch" spacing="4">
                  <HStack spacing="3">
                     <Avatar size="sm" name={project.clientName} bg="blue.500" />
                     <Box>
                        <Text fontSize="2xs" color="gray.400" fontWeight="bold">CLIENT</Text>
                        <Text fontSize="sm" fontWeight="bold">{project.clientName}</Text>
                     </Box>
                  </HStack>
                  <HStack spacing="3">
                      <Avatar size="sm" name={project.partnerName || (project.partnerId ? 'Assigned Partner' : '?')} bg="purple.500" />
                      <Box>
                         <Text fontSize="2xs" color="gray.400" fontWeight="bold">PARTNER</Text>
                         <Text fontSize="sm" fontWeight="bold">{project.partnerName || (project.partnerId ? 'Assigned Partner' : 'Not assigned')}</Text>
                      </Box>
                  </HStack>
               </VStack>
            </Box>
          </VStack>
        </GridItem>
      </Grid>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>Edit Project</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleEditSubmit}>
            <ModalBody>
               <VStack spacing="4">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold">TITLE</FormLabel>
                    <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} borderRadius="lg" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold">DESCRIPTION</FormLabel>
                    <Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={4} borderRadius="lg" />
                  </FormControl>
                  <HStack w="full">
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">BUDGET ($)</FormLabel>
                        <Input type="number" value={editForm.budget} onChange={e => setEditForm({...editForm, budget: e.target.value})} borderRadius="lg" />
                     </FormControl>
                     <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold">PRIORITY</FormLabel>
                        <Select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})} borderRadius="lg">
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </Select>
                     </FormControl>
                  </HStack>
               </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>Cancel</Button>
              <Button colorScheme="blue" type="submit">Save Changes</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>Delete Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text bg="red.50" color="red.700" p="4" borderRadius="lg" border="1px" borderColor="red.100">
               Are you sure you want to delete <b>{project.title}</b>? This action is permanent.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete}>Confirm Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Progress Modal */}
      <Modal isOpen={isProgressOpen} onClose={onProgressClose}>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>Update Progress</ModalHeader>
          <ModalCloseButton />
          <ModalBody py="6">
            <VStack spacing="8" align="stretch">
               <Box>
                  <Flex justify="space-between" mb="2">
                     <Text fontWeight="bold">Current Progress</Text>
                     <Text color="blue.500" fontWeight="bold">{tempProgress}%</Text>
                  </Flex>
                  <Slider value={tempProgress} min={0} max={100} step={5} onChange={(v) => setTempProgress(v)}>
                    <SliderTrack bg="gray.100">
                      <SliderFilledTrack bg="blue.500" />
                    </SliderTrack>
                    <SliderThumb boxSize={6} />
                  </Slider>
               </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onProgressClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleUpdateProgress}>Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rating Modal */}
      <RatingModal 
        isOpen={isRatingOpen} 
        onClose={onRatingClose} 
        project={project} 
        type={user.role === 'Client' ? 'partner' : 'client'} 
      />

      {/* Assign Partner Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose}>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>Assign Partner</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="6">
            <FormControl>
              <FormLabel fontSize="xs" fontWeight="bold">SELECT PARTNER</FormLabel>
              <Select 
                placeholder="Choose a partner" 
                value={selectedPartner} 
                onChange={(e) => setSelectedPartner(e.target.value)}
                borderRadius="lg"
              >
                {users.filter(u => u.role === 'Partner' && !u.isBanned).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAssignClose}>Cancel</Button>
            <Button 
              colorScheme="purple" 
              isDisabled={!selectedPartner}
              onClick={() => {
                const partner = users.find(u => u.id === parseInt(selectedPartner));
                assignPartner(project.id, partner.id, partner.name);
                onAssignClose();
              }}
            >
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProjectDetailPage;
