import React from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Tag,
  Divider,
  useColorModeValue,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FiBell, FiTrash2, FiMessageSquare, FiInfo, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const NotificationsPage = () => {
  const { notifications, markNotificationRead, markAllNotificationsAsRead, deleteNotification } = useAppContext();
  const { user } = useAuth();
  
  const userNotifications = notifications.filter(n => n.userId === user?.id || (user?.role === 'Admin' && n.userId === 'admin'));
  
  const getIcon = (type) => {
    switch (type) {
      case 'Project Update': return FiInfo;
      case 'Message Alert': return FiMessageSquare;
      case 'System Alert': return FiAlertCircle;
      case 'Payment Update': return FiCheckSquare;
      default: return FiBell;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'Project Update': return 'blue';
      case 'Message Alert': return 'purple';
      case 'System Alert': return 'orange';
      case 'Payment Update': return 'green';
      default: return 'gray';
    }
  };

  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Container maxW="container.lg" py="8">
      <VStack align="stretch" spacing="6">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Notifications</Heading>
            <Text color="gray.500">Manage your alerts and activity history</Text>
          </Box>
          <HStack>
            <Button 
              leftIcon={<FiCheckSquare />} 
              variant="outline" 
              onClick={() => markAllNotificationsAsRead(user.id)}
            >
              Mark all as read
            </Button>
          </HStack>
        </HStack>

        <Card variant="outline" borderRadius="xl">
          <CardBody p="0">
            {userNotifications.length === 0 ? (
              <VStack py="20" spacing="4">
                <Box p="6" borderRadius="full" bg="gray.50">
                  <Icon as={FiBell} boxSize="10" color="gray.300" />
                </Box>
                <Text color="gray.500" fontWeight="medium">You're all caught up!</Text>
                <Text fontSize="sm" color="gray.400">No recent notifications found.</Text>
              </VStack>
            ) : (
              <VStack align="stretch" spacing="0">
                {userNotifications.map((n) => (
                  <Box
                    key={n.id}
                    p="6"
                    borderBottom="1px"
                    borderColor="gray.100"
                    bg={n.isRead ? 'transparent' : 'blue.50'}
                    transition="all 0.2s"
                    position="relative"
                    _hover={{ bg: n.isRead ? 'gray.50' : 'blue.100' }}
                  >
                    <HStack align="start" spacing="4">
                      <Box p="3" borderRadius="xl" bg={`${getColor(n.type)}.100`}>
                        <Icon as={getIcon(n.type)} color={`${getColor(n.type)}.500`} boxSize="5" />
                      </Box>
                      <VStack align="start" spacing="1" flex="1">
                        <HStack w="full" justify="space-between">
                          <HStack>
                            <Text fontWeight="bold">{n.title}</Text>
                            {!n.isRead && <Tag size="sm" colorScheme="blue" variant="solid">NEW</Tag>}
                          </HStack>
                          <Text fontSize="xs" color="gray.400">
                            {format(new Date(n.timestamp), 'MMM dd, yyyy HH:mm')}
                          </Text>
                        </HStack>
                        <Text color="gray.600" fontSize="sm">{n.message}</Text>
                        <HStack mt="3" spacing="4">
                          {!n.isRead && (
                            <Button size="xs" variant="link" colorScheme="blue" onClick={() => markNotificationRead(n.id)}>
                              Mark as read
                            </Button>
                          )}
                          <Button 
                            size="xs" 
                            variant="link" 
                            colorScheme="red" 
                            leftIcon={<FiTrash2 />} 
                            onClick={() => deleteNotification(n.id)}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default NotificationsPage;
