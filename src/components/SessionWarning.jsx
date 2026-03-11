import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Text,
  VStack,
  Icon,
  useDisclosure
} from '@chakra-ui/react';
import { FiClock, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const SessionWarning = () => {
  const { user, lastActivity, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    if (!user) {
      onClose();
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMinutes = (now - lastActivity) / 1000 / 60;

      if (diffMinutes >= 28 && diffMinutes < 30) {
        if (!isOpen) onOpen();
        const remainingSeconds = Math.max(0, Math.floor((30 - diffMinutes) * 60));
        setTimeLeft(remainingSeconds);
      } else if (diffMinutes >= 30) {
        onClose();
      } else {
        if (isOpen) onClose();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, lastActivity, isOpen, onOpen, onClose]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>
          <VStack spacing="2" align="center">
            <Icon as={FiAlertTriangle} color="orange.400" boxSize="10" />
            <Text>Session Expiring</Text>
          </VStack>
        </ModalHeader>
        <ModalBody textAlign="center">
          <Text color="gray.600">
            For your security, you will be automatically logged out in 
            <Text as="span" fontWeight="bold" color="blue.600" mx="1">
              {formatTime(timeLeft)}
            </Text> 
            due to inactivity.
          </Text>
        </ModalBody>
        <ModalFooter justifyContent="center" gap="3">
          <Button variant="ghost" onClick={() => logout()}>Log Out Now</Button>
          <Button colorScheme="blue" onClick={onClose} borderRadius="xl">
            Stay Logged In
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SessionWarning;
