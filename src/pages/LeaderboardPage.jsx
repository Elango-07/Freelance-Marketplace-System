import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  Button,
  useColorModeValue,
  Flex,
  Tooltip,
  Progress
} from '@chakra-ui/react';
import { FiStar, FiAward, FiChevronRight, FiTrendingUp } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BadgeIcon from '../components/BadgeIcon';

const LeaderboardPage = () => {
  const { getReputationData } = useAppContext();
  const { users } = useAuth();
  const navigate = useNavigate();

  const partners = users.filter(u => u.role === 'Partner');
  
  const leaderboardData = partners.map(partner => {
    const repData = getReputationData(partner.id);
    return {
      ...partner,
      ...repData
    };
  }).sort((a, b) => b.score - a.score);

  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <VStack align="start" spacing="1" mb="8">
        <HStack>
          <Icon as={FiAward} boxSize="6" color="yellow.400" />
          <Heading size="lg">Partner Leaderboard</Heading>
        </HStack>
        <Text color="gray.500">Recognizing our top performing talent based on reputation and success.</Text>
      </VStack>

      <Box bg={bg} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100" overflow="hidden">
        <Table variant="simple" size="lg">
          <Thead bg="gray.50">
            <Tr>
              <Th fontSize="xs">RANK</Th>
              <Th fontSize="xs">PARTNER</Th>
              <Th fontSize="xs">BADGES</Th>
              <Th fontSize="xs" isNumeric>RATING</Th>
              <Th fontSize="xs" isNumeric>COMPLETED</Th>
              <Th fontSize="xs" isNumeric>REP SCORE</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {leaderboardData.map((partner, index) => (
              <Tr key={partner.id} _hover={{ bg: 'gray.25' }} transition="all 0.2s">
                <Td>
                  <Flex align="center" justify="center" w="8" h="8" borderRadius="full" 
                        bg={index === 0 ? 'yellow.100' : index === 1 ? 'gray.100' : index === 2 ? 'orange.100' : 'transparent'}
                        color={index === 0 ? 'yellow.700' : index === 1 ? 'gray.700' : index === 2 ? 'orange.700' : 'gray.400'}
                        fontWeight="bold">
                    {index + 1}
                  </Flex>
                </Td>
                <Td>
                  <HStack spacing="3">
                    <Avatar size="sm" name={partner.name} src={partner.avatar} />
                    <VStack align="start" spacing="0">
                      <Text fontWeight="bold" fontSize="sm">{partner.name}</Text>
                      <Text fontSize="2xs" color="gray.400" fontWeight="bold">ID: #{partner.id}</Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td>
                  <HStack spacing="2">
                    {partner.badges.slice(0, 2).map(badge => (
                      <BadgeIcon key={badge} type={badge} size="xs" />
                    ))}
                    {partner.badges.length > 2 && (
                      <Tooltip label={partner.badges.slice(2).join(', ')}>
                        <Badge variant="ghost" fontSize="xs" color="gray.400">+{partner.badges.length - 2}</Badge>
                      </Tooltip>
                    )}
                  </HStack>
                </Td>
                <Td isNumeric>
                  <HStack justify="flex-end" spacing="1">
                    <Icon as={FiStar} color="yellow.400" fill="currentColor" boxSize="3" />
                    <Text fontWeight="bold" fontSize="sm">{partner.avgRating}</Text>
                  </HStack>
                </Td>
                <Td isNumeric>
                  <Text fontWeight="bold" fontSize="sm">{partner.completedCount}</Text>
                </Td>
                <Td isNumeric>
                  <VStack align="end" spacing="1">
                    <Text fontWeight="extrabold" fontSize="md" color="blue.600">{partner.score}</Text>
                    <Progress value={partner.score} size="2xs" colorScheme="blue" w="60px" borderRadius="full" />
                  </VStack>
                </Td>
                <Td>
                   <Button size="sm" variant="ghost" rightIcon={<FiChevronRight />} onClick={() => navigate(`/profile/${partner.id}`)}>
                      Profile
                   </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Hero Section for Top 3 */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6" mt="10">
         {leaderboardData.slice(0, 3).map((partner, index) => (
           <Box 
            key={partner.id} 
            bg="white" 
            p="6" 
            borderRadius="2xl" 
            shadow="md" 
            border="1px" 
            borderColor={index === 0 ? 'yellow.200' : 'gray.100'}
            position="relative"
            overflow="hidden"
           >
              {index === 0 && (
                <Box position="absolute" top="-2" right="-2" p="4" bg="yellow.400" transform="rotate(15deg)">
                   <Icon as={FiAward} color="white" boxSize="6" />
                </Box>
              )}
              <VStack spacing="4">
                 <Avatar size="xl" name={partner.name} src={partner.avatar} border="4px solid" borderColor={index === 0 ? 'yellow.400' : 'gray.100'} />
                 <VStack spacing="0">
                    <Heading size="sm">{partner.name}</Heading>
                    <Text fontSize="xs" color="gray.500">#{index + 1} Globally Ranked</Text>
                 </VStack>
                 <HStack>
                    <Icon as={FiTrendingUp} color="green.500" />
                    <Text fontWeight="bold" fontSize="lg">{partner.score}</Text>
                    <Text fontSize="xs" color="gray.400">Points</Text>
                 </HStack>
                 <HStack wrap="wrap" justify="center">
                    {partner.badges.map(b => <BadgeIcon key={b} type={b} />)}
                 </HStack>
              </VStack>
           </Box>
         ))}
      </SimpleGrid>
    </Box>
  );
};

import { SimpleGrid } from '@chakra-ui/react';
export default LeaderboardPage;
