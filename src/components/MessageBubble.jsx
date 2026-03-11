import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Flex, Text, VStack, HStack, IconButton, Icon, Textarea,
  Image, Button, Tooltip, Badge,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiCheck, FiFile, FiAlertTriangle } from 'react-icons/fi';

// Relative time formatter (req 305)
const relativeTime = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (secs < 30) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Highlight search term in text
const HighlightText = ({ text = '', term = '' }) => {
  if (!term) return <Text as="span" fontSize="sm" whiteSpace="pre-wrap">{text}</Text>;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <Text as="span" fontSize="sm" whiteSpace="pre-wrap">
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase()
          ? <Box as="mark" key={i} bg="yellow.200" borderRadius="sm" px="0.5">{p}</Box>
          : p
      )}
    </Text>
  );
};

// Status tick indicator (req 306)
const StatusTick = ({ delivered, read }) => {
  if (read) return (
    <HStack spacing="0">
      <Icon as={FiCheck} color="blue.400" w="2.5" h="2.5" />
      <Icon as={FiCheck} color="blue.400" w="2.5" h="2.5" ml="-1" />
    </HStack>
  );
  if (delivered) return (
    <HStack spacing="0">
      <Icon as={FiCheck} color="gray.300" w="2.5" h="2.5" />
      <Icon as={FiCheck} color="gray.300" w="2.5" h="2.5" ml="-1" />
    </HStack>
  );
  return <Icon as={FiCheck} color="gray.300" w="2.5" h="2.5" />;
};

const MessageBubble = ({ message, isSentByMe, onEdit, onDelete, searchTerm = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const handleEdit = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  const bubbleBg    = isSentByMe ? 'blue.500' : 'white';
  const textColor   = isSentByMe ? 'white' : 'gray.800';
  const borderColor = isSentByMe ? 'blue.600' : 'gray.100';

  // Workspace file attachment display (req 323-324)
  const att = message.attachment;
  const isWorkspaceFile = att?.fromWorkspace;

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      display="flex"
      w="full"
      justifyContent={isSentByMe ? 'flex-end' : 'flex-start'}
      position="relative"
      role="group"
    >
      <VStack maxW="75%" align={isSentByMe ? 'flex-end' : 'flex-start'} spacing="1">
        <Box
          position="relative"
          bg={bubbleBg}
          color={textColor}
          px="4"
          py="2.5"
          borderRadius="2xl"
          borderBottomRightRadius={isSentByMe ? '0' : '2xl'}
          borderBottomLeftRadius={isSentByMe ? '2xl' : '0'}
          shadow="sm"
          border="1px"
          borderColor={borderColor}
          transition="all 0.15s"
          _hover={{ shadow: 'md' }}
        >
          {/* Workspace file card */}
          {isWorkspaceFile && att && (
            <HStack
              p="3" mb="2"
              bg={isSentByMe ? 'blue.600' : 'gray.50'}
              borderRadius="lg"
              border="1px"
              borderColor={isSentByMe ? 'blue.700' : 'gray.200'}
              spacing="3"
            >
              <Icon as={FiFile} color={isSentByMe ? 'blue.200' : 'blue.400'} boxSize="5" />
              <VStack align="start" spacing="0">
                <Text fontSize="xs" fontWeight="bold" noOfLines={1}>{att.name}</Text>
                <Badge colorScheme="green" fontSize="2xs" variant="subtle">📎 From Project Workspace</Badge>
              </VStack>
            </HStack>
          )}

          {/* Image attachment */}
          {att && !isWorkspaceFile && att.type?.startsWith('image/') && (
            <Box mb="2" borderRadius="lg" overflow="hidden" border="1px" borderColor="whiteAlpha.300">
              <Image src={att.data} maxH="240px" objectFit="contain" />
            </Box>
          )}

          {/* Regular file attachment */}
          {att && !isWorkspaceFile && !att.type?.startsWith('image/') && (
            <HStack p="2" bg="blackAlpha.100" borderRadius="md" mb="2" spacing="2">
              <Icon as={FiFile} />
              <Text fontSize="xs" fontWeight="bold" noOfLines={1}>{att.name}</Text>
            </HStack>
          )}

          {/* Message text with optional search highlight */}
          {isEditing ? (
            <VStack spacing="2" minW="200px" align="stretch">
              <Textarea
                size="sm"
                variant="filled"
                bg={isSentByMe ? 'blue.600' : 'gray.50'}
                color={isSentByMe ? 'white' : 'gray.800'}
                _focus={{ bg: isSentByMe ? 'blue.700' : 'gray.100' }}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                rows={3}
              />
              <HStack justify="flex-end">
                <Button size="xs" variant="ghost" colorScheme={isSentByMe ? 'whiteAlpha' : 'gray'} onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="xs" colorScheme={isSentByMe ? 'whiteAlpha' : 'blue'} bg={isSentByMe ? 'white' : 'blue.500'} color={isSentByMe ? 'blue.500' : 'white'} onClick={handleEdit}>Save</Button>
              </HStack>
            </VStack>
          ) : (
            <HighlightText text={message.text} term={searchTerm} />
          )}

          {/* Hover action buttons (only for sent messages) */}
          {isSentByMe && !isEditing && (
            <HStack
              position="absolute"
              left="-14"
              top="0"
              opacity="0"
              _groupHover={{ opacity: 1 }}
              transition="all 0.2s"
              spacing="1"
              p="1"
            >
              <Tooltip label="Edit (5 min window)">
                <IconButton icon={<FiEdit2 />} size="xs" variant="ghost" onClick={() => setIsEditing(true)} aria-label="Edit" />
              </Tooltip>
              <Tooltip label="Delete">
                <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={onDelete} aria-label="Delete" />
              </Tooltip>
            </HStack>
          )}
        </Box>

        {/* Timestamp + edited + status ticks */}
        <HStack spacing="2" px="1">
          <Tooltip label={new Date(message.timestamp).toLocaleString()}>
            <Text fontSize="2xs" color="gray.400" cursor="default">
              {relativeTime(message.timestamp)}
            </Text>
          </Tooltip>
          {message.edited && (
            <Text fontSize="2xs" color="gray.300" fontStyle="italic">edited</Text>
          )}
          {isSentByMe && <StatusTick delivered={message.delivered} read={message.read} />}
        </HStack>
      </VStack>
    </Box>
  );
};

export default MessageBubble;
