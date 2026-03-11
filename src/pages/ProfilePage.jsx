import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import { 
  Box, 
  Flex, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Alert, 
  AlertIcon,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Badge
} from '@chakra-ui/react';
import { FiSave, FiUploadCloud, FiTrash2, FiStar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import BadgeIcon from '../components/BadgeIcon';
import ReviewCard from '../components/ReviewCard';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { getReputationData } = useAppContext();
  
  const repData = getReputationData(user.id);
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [avatar, setAvatar] = useState(user.avatar);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSave = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // Simulate API call
    setTimeout(() => {
      updateProfile({
        name: formData.name,
        email: formData.email,
        avatar: avatar
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box maxW="4xl" mx="auto" p="4">
      <VStack align="stretch" spacing="6">
        <Flex justify="space-between" align="center" bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.200" shadow="sm">
          <HStack spacing="6">
            <VStack align="start">
              <HStack>
                <Heading size="lg" fontWeight="semibold">{user.name}</Heading>
                <Badge colorScheme="blue" variant="subtle">{user.role}</Badge>
              </HStack>
              <HStack spacing="2">
                {repData.badges.map(badge => (
                  <BadgeIcon key={badge} type={badge} />
                ))}
              </HStack>
            </VStack>
          </HStack>
          <HStack spacing="8">
             <VStack align="center" spacing="0">
                <HStack color="yellow.400" spacing="1">
                   <Icon as={FiStar} fill="currentColor" boxSize="5" />
                   <Text fontWeight="extrabold" fontSize="2xl">{repData.avgRating}</Text>
                </HStack>
                <Text color="gray.400" fontSize="xs" fontWeight="bold">{repData.reviewCount} REVIEWS</Text>
             </VStack>
             <Divider orientation="vertical" h="40px" />
             <VStack align="center" spacing="0">
                <Text fontWeight="extrabold" fontSize="2xl" color="green.500">{repData.completedCount}</Text>
                <Text color="gray.400" fontSize="xs" fontWeight="bold">FINISHED</Text>
             </VStack>
             <Divider orientation="vertical" h="40px" />
             <VStack align="center" spacing="0">
                <Text fontWeight="extrabold" fontSize="2xl" color="blue.500">{repData.score}</Text>
                <Text color="gray.400" fontSize="xs" fontWeight="bold">REP SCORE</Text>
             </VStack>
          </HStack>
        </Flex>

        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList bg="white" p="2" borderRadius="full" border="1px" borderColor="gray.100" w="fit-content">
            <Tab fontWeight="bold" fontSize="sm">Settings</Tab>
            <Tab fontWeight="bold" fontSize="sm">Review History</Tab>
            <Tab fontWeight="bold" fontSize="sm">Statistics</Tab>
          </TabList>

          <TabPanels mt="6">
            <TabPanel p="0">
              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="6" alignSelf="stretch">
                <Box gridColumn={{ lg: 'span 1' }}>
                  <ProfileCard user={{...user, ...formData, avatar}} extended={true} />
                </Box>

                <Box gridColumn={{ lg: 'span 2' }}>
                  <Box bg="white" p="8" borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.200">
                    <Heading size="sm" mb="6" textTransform="uppercase" letterSpacing="wider">Edit Details</Heading>
                    
                    {message.text && (
                      <Alert status={message.type === 'success' ? 'success' : 'error'} borderRadius="lg" mb="6" size="sm">
                        <AlertIcon />
                        {message.text}
                      </Alert>
                    )}

                    <form onSubmit={handleSave}>
                      <VStack spacing="5">
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">FULL NAME</FormLabel>
                          <Input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            borderRadius="lg"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="bold">EMAIL ADDRESS</FormLabel>
                          <Input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            borderRadius="lg"
                          />
                        </FormControl>
                        
                        <Box w="full" pt="2">
                          <FormLabel fontSize="xs" fontWeight="bold">PROFILE AVATAR</FormLabel>
                          <Box position="relative">
                            <VStack 
                              bg="gray.50" 
                              border="1px dashed" 
                              borderColor="gray.300" 
                              p="6" 
                              borderRadius="xl" 
                              spacing="3" 
                              align="center"
                            >
                              <Icon as={FiUploadCloud} boxSize="8" color="gray.400" />
                              <VStack spacing="1">
                                <Text fontSize="xs" fontWeight="bold">Click to upload or drag and drop</Text>
                                <Text fontSize="2xs" color="gray.500">PNG, JPG up to 2MB</Text>
                              </VStack>
                              <Input 
                                type="file" 
                                accept="image/*" 
                                position="absolute" 
                                opacity="0" 
                                cursor="pointer" 
                                onChange={handleFileChange} 
                                w="full" 
                                h="full"
                                top="0"
                                left="0"
                              />
                            </VStack>
                            {avatar && (
                              <Button 
                                size="xs" 
                                variant="ghost" 
                                colorScheme="red" 
                                leftIcon={<FiTrash2 />} 
                                onClick={(e) => { e.stopPropagation(); setAvatar(null); }}
                                mt="2"
                                zIndex="2"
                              >
                                Remove Avatar
                              </Button>
                            )}
                          </Box>
                        </Box>

                        <Flex w="full" pt="5" justify="flex-end" borderTop="1px" borderColor="gray.100">
                          <Button 
                            type="submit" 
                            colorScheme="blue" 
                            size="sm" 
                            px="8" 
                            leftIcon={<FiSave />}
                            borderRadius="xl"
                          >
                            Save Changes
                          </Button>
                        </Flex>
                      </VStack>
                    </form>
                  </Box>
                </Box>
              </SimpleGrid>
            </TabPanel>

            <TabPanel p="0">
              <VStack align="stretch" spacing="4">
                <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.200" shadow="sm">
                   <Heading size="md" mb="6">Review History</Heading>
                   {repData.recentReviews.length > 0 ? (
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                        {repData.recentReviews.map(review => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                     </SimpleGrid>
                   ) : (
                     <VStack py="20" bg="gray.50" borderRadius="xl" border="2px" borderStyle="dashed" borderColor="gray.200">
                        <Icon as={FiStar} w="12" h="12" color="gray.200" />
                        <Text color="gray.400" fontWeight="medium">No reviews received yet.</Text>
                     </VStack>
                   )}
                </Box>
              </VStack>
            </TabPanel>

            <TabPanel p="0">
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing="6">
                  <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.200" shadow="sm">
                     <Heading size="sm" mb="4">Performance Metrics</Heading>
                     <VStack spacing="4" align="stretch">
                        <Box>
                           <Flex justify="space-between" mb="1">
                              <Text fontSize="sm" fontWeight="bold">Project Success Rate</Text>
                              <Text fontSize="sm" fontWeight="bold">{repData.successRate || 0}%</Text>
                           </Flex>
                           <Progress value={repData.successRate} size="sm" colorScheme="green" borderRadius="full" />
                        </Box>
                        <Box>
                           <Flex justify="space-between" mb="1">
                              <Text fontSize="sm" fontWeight="bold">Reputation Score</Text>
                              <Text fontSize="sm" fontWeight="bold">{repData.score}/100</Text>
                           </Flex>
                           <Progress value={repData.score} size="sm" colorScheme="blue" borderRadius="full" />
                        </Box>
                     </VStack>
                  </Box>

                  <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.200" shadow="sm">
                     <Heading size="sm" mb="4">Rating Distribution</Heading>
                     <VStack spacing="3" align="stretch">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = repData.recentReviews.filter(r => r.rating === stars).length;
                          const total = repData.reviewCount || 1;
                          const percentage = Math.round((count / total) * 100);
                          return (
                            <HStack key={stars} spacing="4">
                              <Text fontSize="xs" fontWeight="bold" w="40px">{stars} Stars</Text>
                              <Progress value={percentage} size="xs" colorScheme="yellow" flex="1" borderRadius="full" />
                              <Text fontSize="2xs" color="gray.400" w="30px" textAlign="right">{count}</Text>
                            </HStack>
                          );
                        })}
                     </VStack>
                  </Box>
               </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default ProfilePage;
