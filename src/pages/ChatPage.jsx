import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox';
import { 
  Box, 
  Flex, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Icon, 
  Badge
} from '@chakra-ui/react';
import { FiMessageSquare } from 'react-icons/fi';

const ChatPage = () => {
  const { messages, projects, markConversationRead } = useAppContext();
  const { user } = useAuth();
  const { projectId: urlProjectId } = useParams();
  const [selectedConversationId, setSelectedConversationId] = useState(
    urlProjectId ? Number(urlProjectId) : null
  );

  // Group messages by project to form "conversations"
  const conversations = projects.filter(p => p.clientId === user.id || p.partnerId === user.id || user.role === 'Admin');

  useEffect(() => {
    if (urlProjectId) {
      // Opened from a project — select that project's conversation
      const numId = Number(urlProjectId);
      setSelectedConversationId(numId);
      markConversationRead(numId, user.id);
    } else if (conversations.length > 0 && !selectedConversationId) {
      const firstId = conversations[0].id;
      setSelectedConversationId(firstId);
      markConversationRead(firstId, user.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlProjectId]);

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    markConversationRead(id, user.id);
  };

  const activeProject = conversations.find(p => p.id === selectedConversationId);
  const activeMessages = messages.filter(m => m.projectId === selectedConversationId)
                                 .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <Flex h="full" gap="6" bg="gray.50" p="4" borderRadius="2xl" border="1px" borderColor="gray.100" overflow="hidden" maxH="calc(100vh - 120px)">
      {/* Sidebar - Conversation List */}
      <Box w={{ base: 'full', md: '320px' }} bg="white" borderRadius="xl" border="1px" borderColor="gray.200" display="flex" flexDirection="column" shadow="sm" overflow="hidden">
        <Flex p="4" bg="gray.50" borderBottom="1px" borderColor="gray.100" align="center" justify="space-between">
           <HStack spacing="2">
              <Icon as={FiMessageSquare} color="blue.500" />
              <Heading size="xs" textTransform="uppercase" letterSpacing="wider">Messages</Heading>
           </HStack>
        </Flex>
        
        <Box flex="1" overflowY="auto">
          {conversations.length === 0 ? (
            <VStack py="20" opacity="0.4" spacing="2">
              <Icon as={FiMessageSquare} w="8" h="8" />
              <Text fontSize="xs" fontWeight="bold">NO CHATS</Text>
            </VStack>
          ) : (
            conversations.map(project => {
              const projectMsgs = messages.filter(m => m.projectId === project.id);
              const unreadCount = projectMsgs.filter(m => m.receiverId === user.id && !m.read).length;
              const lastMsg = projectMsgs.length > 0 ? projectMsgs[projectMsgs.length - 1] : null;
              const isSelected = selectedConversationId === project.id;
              
              return (
                <Box 
                  key={project.id}
                  p="4"
                  cursor="pointer"
                  transition="all 0.2s"
                  bg={isSelected ? 'blue.50' : 'transparent'}
                  borderLeft="4px solid"
                  borderLeftColor={isSelected ? 'blue.500' : 'transparent'}
                  _hover={{ bg: isSelected ? 'blue.50' : 'gray.50' }}
                  onClick={() => handleSelectConversation(project.id)}
                  borderBottom="1px"
                  borderColor="gray.50"
                >
                  <Flex justify="space-between" mb="1">
                    <Text fontSize="sm" fontWeight={isSelected ? 'bold' : 'semibold'} noOfLines={1} flex="1">
                      {project.title}
                    </Text>
                    {lastMsg && (
                      <Text fontSize="2xs" color="gray.400" whiteSpace="nowrap" ml="2">
                        {new Date(lastMsg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </Text>
                    )}
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color={unreadCount > 0 ? 'gray.900' : 'gray.500'} fontWeight={unreadCount > 0 ? 'bold' : 'normal'} noOfLines={1} flex="1">
                      {lastMsg ? lastMsg.text : "Start chatting..."}
                    </Text>
                    {unreadCount > 0 && (
                      <Badge colorScheme="blue" borderRadius="full" variant="solid" fontSize="2xs" minW="18px" textAlign="center">
                        {unreadCount}
                      </Badge>
                    )}
                  </Flex>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Main Chat Area */}
      <Box flex="1" bg="white" borderRadius="xl" border="1px" borderColor="gray.200" shadow="sm" overflow="hidden">
        {selectedConversationId && activeProject ? (
          <ChatBox 
            messages={activeMessages}
            projectId={selectedConversationId}
            currentUserId={user.id}
          />
        ) : (
          <VStack h="full" justify="center" spacing="4" opacity="0.4">
            <Icon as={FiMessageSquare} w="16" h="16" />
            <Text>Select a conversation to start chatting.</Text>
          </VStack>
        )}
      </Box>
    </Flex>
  );
};

export default ChatPage;
