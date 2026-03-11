import React from 'react';
import {
  IconButton,
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  Button,
  useColorModeValue,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { FiBell, FiCheckCircle, FiInfo, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const { notifications, markNotificationRead, markAllNotificationsAsRead } = useAppContext();
  const { user } = useAuth();

  const userNotifications = notifications.filter(n => n.userId === user?.id || (user?.role === 'Admin' && n.userId === 'admin'));
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'Project Update': return FiInfo;
      case 'Message Alert': return FiMessageSquare;
      case 'System Alert': return FiAlertCircle;
      case 'Payment Update': return FiCheckCircle;
      default: return FiBell;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'Project Update': return 'blue.500';
      case 'Message Alert': return 'purple.500';
      case 'System Alert': return 'orange.500';
      case 'Payment Update': return 'green.500';
      default: return 'gray.500';
    }
  };

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" cursor="pointer">
          <IconButton
            icon={<FiBell />}
            variant="ghost"
            aria-label="Notifications"
            fontSize="20px"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              px="1"
              fontSize="10px"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent width="320px" bg={bg} borderColor={borderColor} shadow="2xl" borderRadius="xl">
        <PopoverArrow />
        <PopoverHeader border="0" pt="4">
          <HStack justify="space-between">
            <Text fontWeight="bold">Notifications</Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="ghost" colorScheme="purple" onClick={() => markAllNotificationsAsRead(user.id)}>
                Mark all as read
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody p="0" maxH="400px" overflowY="auto">
          {userNotifications.length === 0 ? (
            <VStack py="8" spacing="2">
              <Icon as={FiBell} boxSize="8" color="gray.300" />
              <Text color="gray.500" fontSize="sm">No notifications yet</Text>
            </VStack>
          ) : (
            userNotifications.slice(0, 5).map((n) => (
              <Box
                key={n.id}
                p="4"
                borderBottom="1px"
                borderColor={borderColor}
                bg={n.isRead ? 'transparent' : 'blue.50'}
                cursor="pointer"
                onClick={() => markNotificationRead(n.id)}
                _hover={{ bg: n.isRead ? 'gray.50' : 'blue.100' }}
                transition="all 0.2s"
              >
                <HStack align="start" spacing="3">
                  <Box p="2" borderRadius="lg" bg={`${getColor(n.type).split('.')[0]}.100`}>
                    <Icon as={getIcon(n.type)} color={getColor(n.type)} boxSize="4" />
                  </Box>
                  <VStack align="start" spacing="0" flex="1">
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{n.title}</Text>
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>{n.message}</Text>
                    <Text fontSize="10px" color="gray.400" mt="1">
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))
          )}
        </PopoverBody>
        <PopoverFooter border="0" textAlign="center" pb="4">
          <Button size="sm" variant="link" colorScheme="purple" onClick={() => window.location.href = '/notifications'}>
            View All Notifications
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
