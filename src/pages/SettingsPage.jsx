import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Flex, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Button, 
  Alert, 
  Icon
} from '@chakra-ui/react';
import { FiAlertTriangle, FiDatabase } from 'react-icons/fi';

const SettingsPage = () => {
  const { logout } = useAuth(); // 'user' was unused, so it's removed
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  // toast was assigned but never used, so it's removed

  const handleResetData = () => {
    if (window.confirm("Are you sure? This will delete ALL local dummy data including projects, chats, and customized users.")) {
      setResetting(true);
      // Simulate slight delay for UX
      setTimeout(() => {
        localStorage.clear();
        logout();
        navigate('/');
        window.location.reload(); // Hard reload to clear all states
      }, 1000);
    }
  };

  return (
    <Box maxW="3xl" mx="auto" p="4">
      <VStack align="stretch" spacing="6">
        <Box pb="4">
          <Heading size="lg" fontWeight="semibold">Settings</Heading>
          <Text fontSize="sm" color="gray.500" mt="1">Manage your application preferences and data.</Text>
        </Box>

        <VStack spacing="6" align="stretch">
          <Box bg="white" p="6" borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="sm" mb="5" textTransform="uppercase" letterSpacing="wider">Data Management</Heading>
            
            <Alert 
              status="error" 
              variant="subtle" 
              flexDirection={{ base: 'column', sm: 'row' }}
              alignItems="start"
              p="5"
              borderRadius="xl"
              bg="red.50"
              color="red.900"
              border="1px"
              borderColor="red.100"
            >
              <HStack align="start" spacing="4" w="full">
                <Box bg="white" p="2.5" borderRadius="lg" color="red.600" shadow="sm">
                  <Icon as={FiAlertTriangle} boxSize="5" />
                </Box>
                <VStack align="start" spacing="1" flex="1">
                  <Text fontWeight="bold" fontSize="sm">Danger Zone</Text>
                  <Text fontSize="xs" color="red.700" lineHeight="relaxed">
                    This action will permanently delete all applications data stored in your browser's LocalStorage. This includes projects, messages, and profile updates.
                  </Text>
                </VStack>
                <Button 
                  colorScheme="red" 
                  variant="outline" 
                  bg="white" 
                  size="sm" 
                  onClick={handleResetData}
                  isLoading={resetting}
                  loadingText="Resetting..."
                  ml={{ sm: '4' }}
                  mt={{ base: '4', sm: '0' }}
                  alignSelf={{ base: 'flex-end', sm: 'center' }}
                >
                  Reset Data
                </Button>
              </HStack>
            </Alert>
          </Box>

          <Box bg="white" p="6" borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="sm" mb="5" textTransform="uppercase" letterSpacing="wider">Storage Usage</Heading>
            <HStack bg="gray.50" p="4" borderRadius="xl" border="1px" borderColor="gray.200" spacing="4">
              <Box bg="white" p="2" borderRadius="lg" color="gray.600" shadow="sm">
                 <Icon as={FiDatabase} boxSize="4" />
              </Box>
              <Text fontSize="xs" fontWeight="medium" color="gray.700">
                Currently using lightweight LocalStorage. Data is completely isolated to this browser instance.
              </Text>
            </HStack>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};

export default SettingsPage;
