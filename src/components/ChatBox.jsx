import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, VStack, HStack, IconButton, Input, InputGroup,
  InputLeftElement, InputRightElement, Text, Avatar, Spinner, Icon,
  Button, Portal, Popover, PopoverTrigger, PopoverContent, PopoverBody,
  Alert, AlertIcon, AlertDescription, Badge, Tooltip, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, useToast,
} from '@chakra-ui/react';
import {
  FiSend, FiPaperclip, FiSmile, FiSearch, FiX, FiMessageSquare,
  FiAlertTriangle, FiShield, FiLink, FiFile,
} from 'react-icons/fi';
import MessageBubble from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

// Extended emoji set
const EMOJI_ROWS = [
  ['👍','✅','🔥','🚀','⭐','🙌','💡','💬'],
  ['😊','😄','🎉','👏','💪','🤝','✨','📌'],
  ['❓','❗','⏰','📎','🔗','📂','📋','💼'],
];

const ChatBox = ({ messages, currentUserId, projectId }) => {
  const { sendMessage, editMessage, deleteMessage, markConversationRead, getChatStatus, projects } = useAppContext();
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen: isFileModalOpen, onOpen: openFileModal, onClose: closeFileModal } = useDisclosure();

  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isTypingSimulated, setIsTypingSimulated] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  // Project workspace files for attachment
  const project = projects.find(p => p.id === projectId);
  const projectFiles = project?.files || [];

  // Chat moderation status for current user
  const chatStatus = getChatStatus ? getChatStatus(currentUserId) : { restricted: false, flagged: false, violationCount: 0 };
  const isRestricted = chatStatus.restricted;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages, isTypingSimulated]);

  // Search filter
  const filteredMessages = searchTerm
    ? messages.filter(m => m.text?.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    clearTimeout(typingTimer.current);

    const receiverId = messages.find(m => m.senderId !== currentUserId)?.senderId || 'admin';
    const result = sendMessage(projectId, currentUserId, receiverId, inputText);

    if (result.error) {
      toast({
        title: '🚫 Message Blocked',
        description: result.error,
        status: 'error',
        duration: 6000,
        isClosable: true,
        position: 'top',
      });
    } else {
      setInputText('');
      setIsTypingSimulated(true);
      setTimeout(() => setIsTypingSimulated(false), 2500 + Math.random() * 1500);
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
  };

  const handleAttachProjectFile = (file) => {
    const receiverId = messages.find(m => m.senderId !== currentUserId)?.senderId || 'admin';
    sendMessage(projectId, currentUserId, receiverId, `📎 Shared a project file: **${file.fileName || file.name}**`, {
      name: file.fileName || file.name,
      type: file.fileType || file.type,
      size: file.size,
      fromWorkspace: true,
      milestoneLinked: true,
    });
    closeFileModal();
    toast({ title: 'File shared', description: `"${file.fileName || file.name}" linked from project workspace.`, status: 'success', duration: 3000 });
  };

  return (
    <Flex direction="column" h="full" bg="white" position="relative">

      {/* Restriction banner */}
      {isRestricted && (
        <Alert status="error" borderRadius="none" py="2">
          <AlertIcon as={FiShield} />
          <AlertDescription fontSize="xs">
            Your chat is currently restricted due to policy violations. {chatStatus.restrictedUntil && `Lifts at ${new Date(chatStatus.restrictedUntil).toLocaleTimeString()}.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Flagged banner */}
      {chatStatus.flagged && !isRestricted && (
        <Alert status="warning" borderRadius="none" py="2">
          <AlertIcon as={FiAlertTriangle} />
          <AlertDescription fontSize="xs">
            Your account has been flagged for admin review due to repeated violations.
          </AlertDescription>
        </Alert>
      )}

      {/* Header Tools */}
      <Flex px="4" py="2" borderBottom="1px" borderColor="gray.100" bg="gray.50" align="center" justify="space-between">
        <Box flex="1">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <Box as={motion.div} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <InputGroup size="sm" maxW="260px">
                  <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color="gray.400" /></InputLeftElement>
                  <Input
                    placeholder="Search messages…"
                    bg="white"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <InputRightElement>
                    <IconButton icon={<FiX />} size="xs" variant="ghost" onClick={() => { setIsSearching(false); setSearchTerm(''); }} aria-label="Close search" />
                  </InputRightElement>
                </InputGroup>
              </Box>
            ) : (
              <HStack spacing="2">
                <IconButton as={motion.button} icon={<FiSearch />} size="sm" variant="ghost" color="gray.400" onClick={() => setIsSearching(true)} aria-label="Search messages" />
                <HStack spacing="1">
                  <Icon as={FiShield} color="green.400" boxSize="3" />
                  <Text fontSize="2xs" color="gray.400" fontWeight="bold">SECURED CHANNEL</Text>
                </HStack>
              </HStack>
            )}
          </AnimatePresence>
        </Box>

        <HStack spacing="2">
          {chatStatus.violationCount > 0 && (
            <Tooltip label={`${chatStatus.violationCount} policy violation(s)`}>
              <Badge colorScheme="red" variant="subtle" fontSize="2xs" borderRadius="full">
                ⚠ {chatStatus.violationCount}
              </Badge>
            </Tooltip>
          )}
          <Avatar size="xs" name={user?.name || 'User'} bg="blue.500" />
        </HStack>
      </Flex>

      {/* Search result count */}
      {isSearching && searchTerm && (
        <Box px="4" py="1" bg="yellow.50" borderBottom="1px" borderColor="yellow.100">
          <Text fontSize="xs" color="yellow.700">{filteredMessages.length} result(s) for "{searchTerm}"</Text>
        </Box>
      )}

      {/* Messages Area */}
      <Box
        flex="1"
        overflowY="auto"
        p="5"
        bg="gray.50"
        onScroll={() => markConversationRead(projectId, currentUserId)}
      >
        <VStack spacing="4" align="stretch">
          <AnimatePresence initial={false}>
            {filteredMessages.length === 0 ? (
              <VStack py="20" opacity="0.4" spacing="2">
                <Icon as={FiMessageSquare} w="12" h="12" />
                <Text fontSize="xs" fontWeight="bold">{searchTerm ? 'NO MESSAGES FOUND' : 'NO MESSAGES YET'}</Text>
                <Text fontSize="xs">Start the conversation below.</Text>
              </VStack>
            ) : (
              filteredMessages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id || idx}
                  message={msg}
                  isSentByMe={msg.senderId === currentUserId}
                  onEdit={(txt) => editMessage(msg.id, txt)}
                  onDelete={() => deleteMessage(msg.id)}
                  searchTerm={searchTerm}
                />
              ))
            )}

            {/* Simulated typing indicator */}
            {isTypingSimulated && (
              <Box as={motion.div} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} display="flex" justifyContent="flex-start">
                <HStack bg="white" px="4" py="3" borderRadius="2xl" borderBottomLeftRadius="0" shadow="sm" spacing="1">
                  {[0,1,2].map(i => (
                    <Box
                      key={i}
                      w="2" h="2" bg="gray.400" borderRadius="full"
                      animation={`bounce 1.2s ${i * 0.2}s infinite`}
                      sx={{ '@keyframes bounce': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } } }}
                    />
                  ))}
                  <Text fontSize="2xs" color="gray.400" ml="1">typing</Text>
                </HStack>
              </Box>
            )}
          </AnimatePresence>
        </VStack>
        <div ref={messagesEndRef} />
      </Box>

      {/* Security notice */}
      <Box px="4" py="1.5" bg="gray.50" borderTop="1px" borderColor="gray.100">
        <HStack spacing="1" justify="center">
          <Icon as={FiShield} color="gray.300" boxSize="3" />
          <Text fontSize="2xs" color="gray.400">Phone numbers, emails, and external links are not allowed. Use the workspace to share files.</Text>
        </HStack>
      </Box>

      {/* Input Area */}
      <Box p="4" bg="white" borderTop="1px" borderColor="gray.100">
        <form onSubmit={handleSend}>
          <HStack bg={isRestricted ? 'red.50' : 'gray.50'} p="1.5" borderRadius="2xl" border="1px" borderColor={isRestricted ? 'red.200' : 'gray.200'} transition="all 0.2s">

            {/* Attach from project workspace */}
            <Tooltip label="Share file from project workspace">
              <IconButton
                icon={<FiPaperclip />}
                variant="ghost"
                color="gray.400"
                aria-label="Attach file from workspace"
                isDisabled={isRestricted}
                onClick={openFileModal}
              />
            </Tooltip>

            <Input
              variant="unstyled"
              placeholder={isRestricted ? 'Chat restricted due to policy violations…' : 'Type your message…'}
              fontSize="sm"
              value={inputText}
              onChange={handleTyping}
              isDisabled={isRestricted}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
            />

            {/* Emoji Picker */}
            <Popover placement="top-end">
              <PopoverTrigger>
                <IconButton icon={<FiSmile />} variant="ghost" color="gray.400" aria-label="Emojis" isDisabled={isRestricted} />
              </PopoverTrigger>
              <Portal>
                <PopoverContent w="auto" borderRadius="2xl" shadow="xl" border="1px" borderColor="gray.100">
                  <PopoverBody p="3">
                    <VStack spacing="2" align="start">
                      {EMOJI_ROWS.map((row, ri) => (
                        <HStack key={ri} spacing="1">
                          {row.map(em => (
                            <Button key={em} variant="ghost" size="sm" p="0" fontSize="lg" onClick={() => setInputText(prev => prev + em)}>
                              {em}
                            </Button>
                          ))}
                        </HStack>
                      ))}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>

            <IconButton
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              icon={<FiSend />}
              colorScheme="blue"
              borderRadius="xl"
              isDisabled={!inputText.trim() || isRestricted}
              aria-label="Send"
            />
          </HStack>
        </form>
      </Box>

      {/* Project File Attach Modal (req 323-324) */}
      <Modal isOpen={isFileModalOpen} onClose={closeFileModal} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontSize="md">
            <HStack>
              <Icon as={FiLink} color="blue.500" />
              <Text>Share from Project Workspace</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {projectFiles.length === 0 ? (
              <VStack py="6" opacity="0.5" spacing="2">
                <Icon as={FiFile} w="8" h="8" />
                <Text fontSize="sm">No files in this project workspace yet.</Text>
                <Text fontSize="xs" color="gray.400">Upload files from the project detail page first.</Text>
              </VStack>
            ) : (
              <VStack align="stretch" spacing="2">
                <Text fontSize="xs" color="gray.500" mb="1">
                  Files are linked to project milestones — no hidden exchanges.
                </Text>
                {projectFiles.map(file => (
                  <HStack
                    key={file.id}
                    p="3"
                    borderRadius="lg"
                    border="1px"
                    borderColor="gray.100"
                    _hover={{ bg: 'blue.50', borderColor: 'blue.200' }}
                    cursor="pointer"
                    transition="all 0.15s"
                    onClick={() => handleAttachProjectFile(file)}
                  >
                    <Icon as={FiFile} color="blue.400" />
                    <VStack align="start" spacing="0" flex="1">
                      <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{file.fileName || file.name}</Text>
                      <Text fontSize="2xs" color="gray.400">
                        Uploaded by {file.uploaderName} · {new Date(file.uploadDate).toLocaleDateString()}
                      </Text>
                    </VStack>
                    <Badge colorScheme="blue" variant="subtle" fontSize="2xs">Share</Badge>
                  </HStack>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeFileModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ChatBox;
