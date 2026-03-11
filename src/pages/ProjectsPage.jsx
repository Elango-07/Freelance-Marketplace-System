import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  HStack, 
  Button, 
  VStack, 
  Icon, 
  Flex
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiFolder, FiPlus } from 'react-icons/fi';
import ProjectCard from '../components/ProjectCard';
import { useNavigate } from 'react-router-dom';

const ProjectsPage = () => {
  const { projects } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesRole = user.role === 'Admin' || (user.role === 'Client' && p.clientId === user.id) || (user.role === 'Partner' && p.partnerId === user.id);
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <Box>
      <VStack align="start" spacing="1" mb="8">
        <Heading size="lg">Projects</Heading>
        <Text color="gray.500">Manage and track your active collaborations.</Text>
      </VStack>

      <Flex direction={{ base: 'column', md: 'row' }} gap="4" justify="space-between" mb="8">
        <InputGroup maxW={{ md: 'md' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
          />
        </InputGroup>

        <HStack spacing="2" overflowX="auto" pb="1">
          {['All', 'Active', 'Completed', 'Paused'].map(status => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'solid' : 'outline'}
              colorScheme={statusFilter === status ? 'blue' : 'gray'}
              onClick={() => setStatusFilter(status)}
              borderRadius="lg"
            >
              {status}
            </Button>
          ))}
        </HStack>
      </Flex>

      {filteredProjects.length === 0 ? (
        <VStack py="20" bg="gray.50" borderRadius="2xl" border="2px" borderStyle="dashed" borderColor="gray.200">
           <Box p="4" bg="white" borderRadius="full" shadow="sm" mb="4">
              <Icon as={FiFolder} w="8" h="8" color="gray.300" />
           </Box>
           <Text fontWeight="bold">No projects found</Text>
           <Text color="gray.500" fontSize="sm">Try adjusting your filters or search term.</Text>
        </VStack>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="6">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => navigate(`/projects/${project.id}`)} 
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default ProjectsPage;
