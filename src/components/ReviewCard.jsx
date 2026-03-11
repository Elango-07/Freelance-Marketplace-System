import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Avatar, 
  HStack, 
  VStack, 
  Icon 
} from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';

const ReviewCard = ({ review }) => {
  return (
    <Box 
      bg="white" 
      p="5" 
      borderRadius="xl" 
      border="1px" 
      borderColor="gray.100" 
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md', borderColor: 'blue.100' }}
    >
      <Flex justify="space-between" align="start" mb="4">
        <HStack spacing="3">
          <Avatar size="sm" name={review.authorName} src={review.authorAvatar} />
          <VStack align="start" spacing="0">
            <Text fontSize="sm" fontWeight="bold">{review.authorName}</Text>
            <Text fontSize="xs" color="gray.400">{new Date(review.date).toLocaleDateString()}</Text>
          </VStack>
        </HStack>
        <HStack spacing="1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon 
              key={star} 
              as={FiStar} 
              color={star <= review.rating ? 'yellow.400' : 'gray.200'}
              fill={star <= review.rating ? 'currentColor' : 'none'}
              boxSize="3"
            />
          ))}
        </HStack>
      </Flex>
      
      <Text fontSize="sm" color="gray.600" fontStyle="italic" lineHeight="tall">
        "{review.comment}"
      </Text>
      
      {review.projectName && (
        <Text fontSize="2xs" color="gray.400" mt="4" fontWeight="bold" textTransform="uppercase">
          Project: {review.projectName}
        </Text>
      )}
    </Box>
  );
};

export default ReviewCard;
