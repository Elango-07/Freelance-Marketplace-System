import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Checkbox, 
  Link, 
  Alert, 
  AlertIcon,
  Container,
  Divider
} from '@chakra-ui/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.success) {
      if (result.suspicious) {
        alert('Security Alert: Login detected from a new browser session. If this wasn\'t you, please change your password.');
      }
      const { role: userRole } = result.user;
      if (userRole === 'Admin') navigate('/dashboard/admin');
      else if (userRole === 'Client') navigate('/dashboard/client');
      else if (userRole === 'Partner') navigate('/dashboard/partner');
      else navigate('/');
    } else {
      setError(result.message);
    }
  };
  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
  };

  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-br, blue.50, purple.50)" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p="4"
    >
      <Container maxW="md">
        <Box 
          bg="white" 
          p="8" 
          borderRadius="3xl" 
          shadow="xl" 
          border="1px" 
          borderColor="whiteAlpha.500"
        >
          <VStack spacing="6" mb="8" textAlign="center">
            <Heading size="lg" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">Welcome Back</Heading>
            <Text fontSize="sm" color="gray.600">Sign in to your Freelance Bridge account</Text>
          </VStack>

          <form onSubmit={handleLogin}>
            <VStack spacing="4">
              {error && (
                <Alert status="error" borderRadius="lg" size="sm">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">EMAIL ADDRESS</FormLabel>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">PASSWORD</FormLabel>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                />
              </FormControl>
              
              <Flex w="full" justify="space-between">
                <Checkbox colorScheme="blue" size="sm">Remember me</Checkbox>
              </Flex>

              <Button 
                type="submit" 
                colorScheme="blue" 
                w="full" 
                h="12" 
                borderRadius="xl"
                shadow="md"
              >
                Sign In
              </Button>
            </VStack>
          </form>

          <Text mt="6" textAlign="center" fontSize="sm" color="gray.600">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="blue.600" fontWeight="medium">Register here</Link>
          </Text>

          <Divider my="6" />

          <VStack spacing="2" fontSize="xs" color="gray.500">
            <Text fontWeight="bold">Demo Accounts:</Text>
             <HStack spacing="2">
                <Link onClick={() => fillDemo('admin@test.com')} color="blue.500" _hover={{ textDecoration: 'underline' }}>admin@test.com</Link> 
                <Text>|</Text>
                <Link onClick={() => fillDemo('client@test.com')} color="blue.500" _hover={{ textDecoration: 'underline' }}>client@test.com</Link>
                <Text>|</Text>
                <Link onClick={() => fillDemo('partner@test.com')} color="blue.500" _hover={{ textDecoration: 'underline' }}>partner@test.com</Link>
             </HStack>
            <Text fontFamily="mono">Password: password</Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
