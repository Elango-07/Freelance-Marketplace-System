import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Badge, 
  VStack, 
  HStack, 
  Icon, 
  Progress,
  useColorModeValue
} from '@chakra-ui/react';
import { FiCalendar, FiDollarSign, FiChevronRight } from 'react-icons/fi';

const ProjectCard = ({ project, onClick }) => {
  const priorityColors = {
    High: 'red',
    Medium: 'orange',
    Low: 'emerald',
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBorderColor = useColorModeValue('blue.300', 'blue.500');

  return (
    <Box 
      onClick={onClick}
      bg={cardBg}
      p="5"
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: hoverBorderColor,
        shadow: 'lg',
        transform: 'translateY(-2px)'
      }}
      _active={{ transform: 'scale(0.98)' }}
      display="flex"
      flexDirection="column"
      h="full"
    >
      <Flex justify="space-between" align="start" mb="4">
        <Badge 
          colorScheme={priorityColors[project.priority || 'Medium']} 
          variant="subtle"
          px="2"
          py="0.5"
          borderRadius="md"
          fontSize="10px"
          fontWeight="bold"
          textTransform="uppercase"
        >
          {project.priority || 'Medium'}
        </Badge>
        <Badge 
          colorScheme={project.status === 'Completed' ? 'green' : 'blue'}
          variant="outline"
          px="2"
          py="0.5"
          borderRadius="md"
          fontSize="10px"
          fontWeight="bold"
          textTransform="uppercase"
        >
          {project.status}
        </Badge>
      </Flex>

      <Text 
        fontSize="md" 
        fontWeight="bold" 
        color="gray.900" 
        mb="2" 
        noOfLines={1}
        _groupHover={{ color: 'blue.500' }}
      >
        {project.title}
      </Text>
      
      <Text fontSize="xs" color="gray.500" noOfLines={2} mb="6" flex="1">
        {project.description}
      </Text>

      <Box pt="4" borderTop="1px" borderColor="gray.50">
        <Flex justify="space-between" align="center" mb="2">
           <Text fontSize="11px" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">Progress</Text>
           <Text fontSize="11px" fontWeight="bold" color="gray.900">{project.progress}%</Text>
        </Flex>
        <Progress 
          value={project.progress} 
          size="xs" 
          colorScheme="blue" 
          borderRadius="full" 
          bg="gray.100" 
        />

        <Flex justify="space-between" align="center" mt="4">
          <HStack spacing="1">
            <Icon as={FiDollarSign} fontSize="14" color="gray.400" />
            <Text fontSize="13px" fontWeight="semibold" color="gray.800">
              ${(project.budget || 0).toLocaleString()}
            </Text>
          </HStack>
          <HStack spacing="1">
            <Icon as={FiCalendar} fontSize="14" color="gray.400" />
            <Text fontSize="11px" color="gray.500">
              {new Date(project.deadline).toLocaleDateString()}
            </Text>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default ProjectCard;
