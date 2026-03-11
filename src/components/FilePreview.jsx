import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Image,
  Box,
  Text,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FiFile, FiDownload } from 'react-icons/fi';

const FilePreview = ({ isOpen, onClose, file }) => {
  if (!file) return null;

  const isImage = file.type?.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl" bg="white">
        <ModalHeader borderBottom="1px" borderColor="gray.100">
          <Text noOfLines={1}>{file.name}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          <Box 
            minH="400px" 
            maxH="70vh" 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            bg="gray.50"
            overflow="auto"
          >
            {isImage ? (
              <Image 
                src={file.data} 
                alt={file.name} 
                maxH="100%" 
                objectFit="contain"
              />
            ) : isPDF ? (
              <iframe
                src={file.data}
                title={file.name}
                width="100%"
                height="600px"
                style={{ border: 'none' }}
              />
            ) : (
              <VStack spacing={4}>
                <Icon as={FiFile} boxSize={20} color="gray.300" />
                <Text color="gray.500">Preview not available for this file type.</Text>
                <Button 
                  leftIcon={<FiDownload />} 
                  colorScheme="blue" 
                  as="a" 
                  href={file.data} 
                  download={file.name}
                >
                  Download to View
                </Button>
              </VStack>
            )}
          </Box>
        </ModalBody>
        <ModalFooter borderTop="1px" borderColor="gray.100">
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button 
            colorScheme="blue" 
            leftIcon={<FiDownload />}
            as="a" 
            href={file.data} 
            download={file.name}
          >
            Download
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilePreview;
