import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
  Icon,
  VStack,
  Text,
  useToast
} from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const RatingModal = ({ isOpen, onClose, project, type }) => {
  const { addReview } = useAppContext();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const toast = useToast();

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    addReview({
      projectId: project.id,
      projectName: project.title,
      authorId: type === 'partner' ? project.clientId : project.partnerId,
      authorName: type === 'partner' ? project.clientName : 'Partner', // Should be dynamic
      targetId: type === 'partner' ? project.partnerId : project.clientId,
      rating,
      comment,
      type // 'partner' or 'client'
    });

    toast({
      title: "Review submitted successfully!",
      status: "success",
      duration: 3000,
    });
    
    onClose();
    setRating(0);
    setComment('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl" p="4">
        <ModalHeader textAlign="center">
          Rate your {type === 'partner' ? 'Partner' : 'Client'}
          <Text fontSize="sm" color="gray.500" fontWeight="normal" mt="1">
            {project?.title}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="8">
            <VStack spacing="2">
              <HStack spacing="3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    as={FiStar}
                    boxSize="8"
                    cursor="pointer"
                    color={(hover || rating) >= star ? "yellow.400" : "gray.200"}
                    fill={(hover || rating) >= star ? "currentColor" : "none"}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    transition="all 0.2s"
                    _hover={{ transform: 'scale(1.2)' }}
                  />
                ))}
              </HStack>
              <Text fontWeight="bold" color="blue.500">
                {rating === 5 ? "Excellent!" : 
                 rating === 4 ? "Great job" : 
                 rating === 3 ? "Good" : 
                 rating === 2 ? "Fair" : 
                 rating === 1 ? "Poor" : "Select rating"}
              </Text>
            </VStack>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold">YOUR FEEDBACK</FormLabel>
              <Textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                borderRadius="xl"
                rows={4}
                bg="gray.50"
                border="none"
                _focus={{ bg: 'white', shadow: 'inner' }}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
            Skip for now
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit} 
            borderRadius="xl" 
            px="8"
            isDisabled={rating === 0}
          >
            Submit Review
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RatingModal;
