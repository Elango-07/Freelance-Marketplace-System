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
    if (window.confirm("This will sign you out and clear local cache. Your database data will remain safe. Proceed?")) {
      setResetting(true);
      setTimeout(() => {
        logout();
        navigate('/');
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
            <Heading size="sm" mb="5" textTransform="uppercase" letterSpacing="wider">Account Management</Heading>
            
            <Alert 
              status="info" 
              variant="subtle" 
              flexDirection={{ base: 'column', sm: 'row' }}
              alignItems="start"
              p="5"
              borderRadius="xl"
              bg="blue.50"
              color="blue.900"
              border="1px"
              borderColor="blue.100"
            >
              <HStack align="start" spacing="4" w="full">
                <Box bg="white" p="2.5" borderRadius="lg" color="blue.600" shadow="sm">
                  <Icon as={FiDatabase} boxSize="5" />
                </Box>
                <VStack align="start" spacing="1" flex="1">
                  <Text fontWeight="bold" fontSize="sm">Cloud Persistence Active</Text>
                  <Text fontSize="xs" color="blue.700" lineHeight="relaxed">
                    Your data is now securely stored in the Supabase Cloud. Projects, chats, and profiles are synced across all your devices.
                  </Text>
                </VStack>
                <Button 
                  colorScheme="gray" 
                  variant="outline" 
                  bg="white" 
                  size="sm" 
                  onClick={handleResetData}
                  isLoading={resetting}
                  loadingText="Processing..."
                  ml={{ sm: '4' }}
                  mt={{ base: '4', sm: '0' }}
                  alignSelf={{ base: 'flex-end', sm: 'center' }}
                >
                  Logout all sessions
                </Button>
              </HStack>
            </Alert>
          </Box>

          <Box bg="white" p="6" borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="sm" mb="5" textTransform="uppercase" letterSpacing="wider">Security Status</Heading>
            <HStack bg="green.50" p="4" borderRadius="xl" border="1px" borderColor="green.200" spacing="4">
              <Box bg="white" p="2" borderRadius="lg" color="green.600" shadow="sm">
                 <Icon as={FiCheckCircle} boxSize="4" />
              </Box>
              <VStack align="start" spacing="0">
                <Text fontSize="xs" fontWeight="bold" color="green.700">Encrypted Connection</Text>
                <Text fontSize="xs" color="green.600">
                  Using real-time SSL-secured database connection.
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};

export default SettingsPage;
