import React from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Avatar, 
  Icon, 
  Divider 
} from '@chakra-ui/react';
import { FiBriefcase, FiMapPin, FiStar } from 'react-icons/fi';

const ProfileCard = ({ user, extended = false }) => {
  if (!user) return null;

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" border="1px" borderColor="gray.200" overflow="hidden">
      <Box h="20" bg="gray.900" />
      <Box px="6" pb="6" position="relative">
        <Box 
          position="absolute" 
          top="-10" 
          border="4px solid" 
          borderColor="white" 
          borderRadius="full" 
          bg="white" 
          shadow="sm"
        >
          <Avatar 
            size="xl" 
            name={user.name} 
            src={user.avatar} 
            bg="blue.500" 
            color="white" 
          />
        </Box>
        
        <VStack mt="12" align="start" spacing="1">
          <Heading size="md" tracking="tight">{user.name}</Heading>
          <Text fontSize="sm" fontWeight="semibold" color="gray.500">{user.role}</Text>
          
          {extended && (
            <VStack mt="5" spacing="3" align="stretch" w="full">
              <HStack fontSize="xs" fontWeight="medium" color="gray.600" spacing="2">
                <Icon as={FiMapPin} color="gray.400" />
                <Text>San Francisco, CA</Text>
              </HStack>
              <HStack fontSize="xs" fontWeight="medium" color="gray.600" spacing="2">
                <Icon as={FiBriefcase} color="gray.400" />
                <Text>{user.role === 'Partner' ? '12 Jobs Completed' : (user.role === 'Client' ? '5 Projects Posted' : 'Admin Staff')}</Text>
              </HStack>
              
              {user.role === 'Partner' && (
                <Box pt="4">
                  <Divider mb="4" />
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" fontWeight="medium" color="gray.500">Rating</Text>
                    <HStack spacing="1" color="yellow.400">
                       <Icon as={FiStar} fill="currentColor" />
                       <Text fontSize="xs" fontWeight="bold" color="gray.900">4.8</Text>
                    </HStack>
                  </Flex>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default ProfileCard;
