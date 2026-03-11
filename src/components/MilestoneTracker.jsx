import React from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Progress,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Divider,
  Circle as ChakraCircle,
  Badge
} from '@chakra-ui/react';
import { FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi';

const MilestoneTracker = ({ progress, milestones = [], onUpdateProgress, editable = false }) => {
  const stages = [
    { name: 'Planning', value: 25 },
    { name: 'Development', value: 50 },
    { name: 'Testing', value: 75 },
    { name: 'Completed', value: 100 },
  ];

  return (
    <VStack spacing="6" align="stretch">
      <Flex justify="space-between" align="center">
        <Heading size="xs" textTransform="uppercase" letterSpacing="wider">Milestone Progress</Heading>
        <Badge variant="subtle" colorScheme="blue" borderRadius="md" px="2">{progress}%</Badge>
      </Flex>

      {/* Progress Bar */}
      <Progress value={progress} size="xs" colorScheme="blue" borderRadius="full" />

      {/* Stepper Grid */}
      <SimpleGrid columns={4} spacing="2">
        {stages.map((stage) => {
          const isCompleted = progress >= stage.value;
          const isCurrent = progress < stage.value && (progress >= (stages[stages.indexOf(stage)-1]?.value || 0));

          return (
            <VStack
              key={stage.name}
              spacing="2"
              py="2"
              borderRadius="lg"
              transition="all 0.2s"
              cursor={editable ? 'pointer' : 'default'}
              _hover={editable ? { bg: 'gray.50' } : {}}
              _active={editable ? { scale: 0.95 } : {}}
              onClick={() => editable && onUpdateProgress && onUpdateProgress(stage.value)}
            >
              <ChakraCircle
                size="32px"
                border="1px solid"
                borderColor={isCompleted || isCurrent ? 'blue.500' : 'gray.200'}
                bg={isCompleted ? 'blue.500' : isCurrent ? 'blue.50' : 'transparent'}
                color={isCompleted ? 'white' : isCurrent ? 'blue.500' : 'gray.300'}
                boxShadow={isCompleted ? 'sm' : 'none'}
              >
                <Icon as={isCompleted ? FiCheckCircle : FiCircle} />
              </ChakraCircle>
              <Text
                fontSize="2xs"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
                color={isCompleted || isCurrent ? 'gray.900' : 'gray.400'}
                textAlign="center"
              >
                {stage.name}
              </Text>
            </VStack>
          );
        })}
      </SimpleGrid>

      {/* Milestone History Feed */}
      {milestones && milestones.length > 0 && (
        <Box mt="4">
          <HStack spacing="2" mb="4" color="gray.400">
             <Icon as={FiClock} boxSize="3" />
             <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">History</Text>
          </HStack>
          <VStack align="stretch" spacing="4">
            {milestones.slice().reverse().map((m, i) => (
              <HStack key={i} align="start" spacing="3" position="relative">
                {i !== milestones.length - 1 && (
                  <Box position="absolute" left="3px" top="4" bottom="-16px" w="1px" bg="gray.100" />
                )}
                <Box w="1.5" h="1.5" borderRadius="full" bg="blue.500" mt="1.5" shadow="sm" />
                <VStack align="start" spacing="0">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    Reached {m.stage} stage
                  </Text>
                  <Text fontSize="2xs" color="gray.400">
                    {new Date(m.timestamp).toLocaleDateString()} · {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

export default MilestoneTracker;
