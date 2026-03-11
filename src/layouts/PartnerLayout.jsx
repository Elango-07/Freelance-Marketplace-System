import React from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import {
  FiHome,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiMessageSquare,
  FiBriefcase,
  FiX,
  FiAward,
  FiBarChart2
} from 'react-icons/fi';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/NotificationPanel';
import SessionWarning from '../components/SessionWarning';

const PartnerLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
  
    const handleLogout = () => {
      logout();
      navigate('/login');
    };
  
    return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
        <Drawer
          autoFocus={false}
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="full">
          <DrawerContent>
            <SidebarContent onClose={onClose} />
          </DrawerContent>
        </Drawer>
        {/* mobilenav */}
        <MobileNav user={user} onOpen={onOpen} handleLogout={handleLogout} />
        <Box ml={{ base: 0, md: 60 }} p="4">
          <Outlet />
        </Box>
        <SessionWarning />
      </Box>
    );
  };

  const SidebarContent = ({ onClose, ...rest }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const LinkItems = [
      { name: 'Dashboard', icon: FiHome, path: '/dashboard/partner' },
      { name: 'My Projects', icon: FiBriefcase, path: '/projects' },
      { name: 'Messages', icon: FiMessageSquare, path: '/chat' },
      { name: 'Leaderboard', icon: FiAward, path: '/leaderboard' },
      { name: 'Analytics', icon: FiBarChart2, path: '/analytics/partner' },
      { name: 'Settings', icon: FiSettings, path: '/settings' },
    ];
  
    return (
      <Box
        transition="3s ease"
        bg={useColorModeValue('white', 'gray.900')}
        borderRight="1px"
        borderRightColor={useColorModeValue('gray.200', 'gray.700')}
        w={{ base: 'full', md: 60 }}
        pos="fixed"
        h="full"
        {...rest}>
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <Text fontSize="xl" fontWeight="bold" color="purple.600">
            FB Partner
          </Text>
          <IconButton display={{ base: 'flex', md: 'none' }} onClick={onClose} icon={<CloseIcon />} variant="ghost" aria-label="Close" />
        </Flex>
        {LinkItems.map((link) => (
          <NavItem key={link.name} icon={link.icon} onClick={() => navigate(link.path)} isActive={location.pathname === link.path}>
            {link.name}
          </NavItem>
        ))}
      </Box>
    );
  };

  const NavItem = ({ icon, children, isActive, ...rest }) => {
    return (
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'purple.500' : 'transparent'}
        color={isActive ? 'white' : 'inherit'}
        _hover={{
          bg: 'purple.400',
          color: 'white',
        }}
        _focus={{ boxShadow: 'none' }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    );
  };

  const MobileNav = ({ user, onOpen, handleLogout, ...rest }) => {
    return (
      <Flex
        ml={{ base: 0, md: 60 }}
        px={{ base: 4, md: 4 }}
        height="20"
        alignItems="center"
        bg={useColorModeValue('white', 'gray.900')}
        borderBottomWidth="1px"
        borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
        justifyContent={{ base: 'space-between', md: 'flex-end' }}
        {...rest}>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<FiMenu />}
        />
  
        <Text
          display={{ base: 'flex', md: 'none' }}
          fontSize="xl"
          fontWeight="bold"
          color="purple.600">
          Partner Portal
        </Text>
  
        <HStack spacing={{ base: '0', md: '6' }}>
          <NotificationPanel />
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton
                py={2}
                transition="all 0.3s"
                _focus={{ boxShadow: 'none' }}>
                <HStack>
                  <Avatar
                    size={'sm'}
                    name={user?.name}
                  />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2">
                    <Text fontSize="sm">{user?.name}</Text>
                    <Text fontSize="xs" color="gray.600">
                      Partner
                    </Text>
                  </VStack>
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList
                bg={useColorModeValue('white', 'gray.900')}
                borderColor={useColorModeValue('gray.200', 'gray.700')}>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Sign out</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </HStack>
      </Flex>
    );
  };

export default PartnerLayout;
