import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Button,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useToast,
  Progress,
  Tooltip,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Heading,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Avatar,
} from '@chakra-ui/react';
import {
  FiUploadCloud,
  FiFile,
  FiSearch,
  FiMoreVertical,
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiEye,
  FiFileText,
  FiImage,
  FiArchive,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import FilePreview from './FilePreview';

const FileManager = ({ project }) => {
  const { addFileToProject, renameFile, deleteFile } = useAppContext();
  const { user } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef();

  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState(null);

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  const [fileToDelete, setFileToDelete] = useState(null);

  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
  const [fileToRename, setFileToRename] = useState(null);
  const [newName, setNewName] = useState('');

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return FiImage;
    if (type === 'application/pdf') return FiFileText;
    if (type?.includes('zip') || type?.includes('rar')) return FiArchive;
    return FiFile;
  };

  const getIconColor = (type) => {
    if (type?.startsWith('image/')) return 'purple.500';
    if (type === 'application/pdf') return 'red.500';
    if (type?.includes('zip') || type?.includes('rar')) return 'orange.500';
    return 'blue.500';
  };

  const allowedTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain'
  ];

  const handleFileUpload = (files) => {
    const fileList = Array.from(files);
    let totalSize = 0;
    const maxSize = 5 * 1024 * 1024; // 5MB limit for testing LocalStorage

    const validFiles = fileList.filter(f => {
      if (!allowedTypes.includes(f.type) && !f.name.endsWith('.rar')) {
        toast({
          title: 'Unsupported file type',
          description: `${f.name} is not allowed.`,
          status: 'warning',
          duration: 3000,
        });
        return false;
      }
      if (f.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${f.name} exceeds the 5MB limit.`,
          status: 'error',
          duration: 3000,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        addFileToProject(project.id, {
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result
        }, user);

        if (index === validFiles.length - 1) {
          setTimeout(() => {
            setProgress(100);
            setUploading(false);
            toast({
              title: 'Upload complete',
              status: 'success',
              duration: 2000,
            });
          }, 500);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const filteredFiles = (project.files || []).filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const isPartner = user.role === 'Partner';
  const isClient = user.role === 'Client';

  const allFiles = (project.files || []).slice().sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  return (
    <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
      <Tabs variant="soft-rounded" colorScheme="blue">
        <HStack justify="space-between" mb="4">
          <Heading size="sm">File Manager</Heading>
          <TabList bg="gray.50" p="1" borderRadius="xl">
            <Tab fontSize="xs" fontWeight="bold" borderRadius="lg">Files</Tab>
            <Tab fontSize="xs" fontWeight="bold" borderRadius="lg">History</Tab>
          </TabList>
        </HStack>

        <TabPanels>
          {/* ── FILES TAB ── */}
          <TabPanel p={0}>
            <VStack align="stretch" spacing="6">
              <HStack justify="space-between">
                <InputGroup maxW="250px">
                  <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                  <Input 
                    placeholder="Search files..." 
                    size="sm" 
                    borderRadius="lg" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <Badge colorScheme="blue" borderRadius="full" px="2">{(project.files || []).length} file(s)</Badge>
              </HStack>

              {/* Upload Area — Partners only */}
              {isPartner ? (
                <Box
                  border="2px"
                  borderStyle="dashed"
                  borderColor={uploading ? 'blue.400' : 'gray.200'}
                  borderRadius="2xl"
                  p="8"
                  bg={uploading ? 'blue.50' : 'gray.50'}
                  transition="all 0.2s"
                  textAlign="center"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#3182ce'; }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#E2E8F0'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    handleFileUpload(e.dataTransfer.files);
                  }}
                >
                  <VStack spacing="3">
                    <Icon as={FiUploadCloud} boxSize="10" color="blue.500" />
                    <Box>
                      <Text fontWeight="bold">Drag & drop files here</Text>
                      <Text fontSize="xs" color="gray.500">ZIP, RAR, PDF, DOCX, PNG, JPG, TXT · Max 5MB per file</Text>
                    </Box>
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      onClick={() => fileInputRef.current.click()}
                      isLoading={uploading}
                    >
                      Browse Files
                    </Button>
                    <input 
                      type="file" 
                      multiple 
                      hidden 
                      ref={fileInputRef} 
                      onChange={(e) => handleFileUpload(e.target.files)} 
                    />
                  </VStack>
                </Box>
              ) : (
                <Box p="3" bg="blue.50" borderRadius="xl" border="1px" borderColor="blue.100">
                  <HStack spacing="2">
                    <Icon as={FiCheckCircle} color="blue.500" />
                    <Text fontSize="sm" color="blue.700">Files uploaded by your partner will appear here. You can preview and download them below.</Text>
                  </HStack>
                </Box>
              )}

              {uploading && (
                <VStack align="stretch" spacing="2">
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="bold">Uploading Assets...</Text>
                    <Text fontSize="xs" fontWeight="bold">{progress}%</Text>
                  </HStack>
                  <Progress value={progress} size="xs" colorScheme="blue" borderRadius="full" hasStripe isAnimated />
                </VStack>
              )}

              {/* File Grid */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <Box 
                      key={file.id} 
                      p="4" 
                      border="1px" 
                      borderColor="gray.100" 
                      borderRadius="xl"
                      _hover={{ bg: 'gray.50', shadow: 'sm' }}
                      transition="all 0.2s"
                    >
                      <HStack justify="space-between">
                        <HStack spacing="3" overflow="hidden">
                          <Box p="3" borderRadius="lg" bg={`${getIconColor(file.type).split('.')[0]}.50`}>
                            <Icon as={getFileIcon(file.type)} color={getIconColor(file.type)} boxSize="5" />
                          </Box>
                          <VStack align="start" spacing="0" overflow="hidden">
                            <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{file.name}</Text>
                            <HStack spacing="2">
                              <Text fontSize="2xs" color="gray.400">{(file.size / 1024).toFixed(1)} KB</Text>
                              <Text fontSize="2xs" color="gray.200">•</Text>
                              <Text fontSize="2xs" color="gray.400">{file.uploaderName}</Text>
                              <Text fontSize="2xs" color="gray.200">•</Text>
                              <Text fontSize="2xs" color="gray.400">{format(new Date(file.uploadDate), 'MMM dd')}</Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <Menu>
                          <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                          <MenuList borderRadius="xl" shadow="xl">
                            <MenuItem icon={<FiEye />} onClick={() => { setSelectedFile(file); onPreviewOpen(); }}>Preview</MenuItem>
                            <MenuItem icon={<FiDownload />} as="a" href={file.data} download={file.name}>Download</MenuItem>
                            {user.id === file.uploaderId && (
                              <>
                                <MenuItem icon={<FiEdit2 />} onClick={() => { setFileToRename(file); setNewName(file.name); onRenameOpen(); }}>Rename</MenuItem>
                                <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => { setFileToDelete(file); onDeleteOpen(); }}>Delete</MenuItem>
                              </>
                            )}
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Box>
                  ))
                ) : (
                  <VStack py="10" bg="gray.50" borderRadius="xl" border="1px" borderColor="gray.100" w="full" gridColumn="span 2">
                    <Icon as={FiFile} boxSize="10" color="gray.300" />
                    <Text fontSize="sm" color="gray.500">{search ? 'No files match your search.' : 'No files shared yet.'}</Text>
                  </VStack>
                )}
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* ── HISTORY TAB ── */}
          <TabPanel p={0}>
            <VStack align="stretch" spacing="3" pt="2">
              {allFiles.length === 0 ? (
                <VStack py="10" bg="gray.50" borderRadius="xl" border="1px" borderColor="gray.100">
                  <Icon as={FiFile} boxSize="10" color="gray.300" />
                  <Text fontSize="sm" color="gray.500">No upload history yet.</Text>
                </VStack>
              ) : (
                allFiles.map((file, idx) => (
                  <HStack
                    key={file.id}
                    p="3"
                    bg={idx % 2 === 0 ? 'gray.50' : 'white'}
                    borderRadius="lg"
                    border="1px"
                    borderColor="gray.100"
                    justify="space-between"
                  >
                    <HStack spacing="3" overflow="hidden">
                      <Avatar size="xs" name={file.uploaderName} />
                      <VStack align="start" spacing="0" overflow="hidden">
                        <HStack spacing="1">
                          <Icon as={getFileIcon(file.type)} color={getIconColor(file.type)} boxSize="3" />
                          <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{file.name}</Text>
                        </HStack>
                        <Text fontSize="2xs" color="gray.400">
                          Uploaded by <b>{file.uploaderName}</b> · {(file.size / 1024).toFixed(1)} KB
                        </Text>
                      </VStack>
                    </HStack>
                    <Text fontSize="2xs" color="gray.400" whiteSpace="nowrap">
                      {format(new Date(file.uploadDate), 'MMM dd, HH:mm')}
                    </Text>
                  </HStack>
                ))
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete File</AlertDialogHeader>
            <AlertDialogBody>Are you sure? You can't undo this action later.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={() => { deleteFile(project.id, fileToDelete.id, user.name); onDeleteClose(); }} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Rename Dialog */}
      <AlertDialog isOpen={isRenameOpen} leastDestructiveRef={cancelRef} onClose={onRenameClose}>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Rename File</AlertDialogHeader>
            <AlertDialogBody>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} borderRadius="lg" />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRenameClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={() => { renameFile(project.id, fileToRename.id, newName); onRenameClose(); }} ml={3}>Rename</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <FilePreview isOpen={isPreviewOpen} onClose={onPreviewClose} file={selectedFile} />
    </Box>
  );
};

export default FileManager;
