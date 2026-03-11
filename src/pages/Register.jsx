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
  RadioGroup, 
  Radio, 
  Stack, 
  Link, 
  Alert, 
  AlertIcon,
  Container
} from '@chakra-ui/react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Client');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'None', color: 'gray' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;

    if (pass.length < 6) return { score: 0, label: 'Too Short', color: 'red' };
    if (score <= 1) return { score: 1, label: 'Weak', color: 'orange' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'yellow' };
    return { score: 3, label: 'Strong', color: 'green' };
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordStrength(calculateStrength(val));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (passwordStrength.label === 'Weak' || passwordStrength.label === 'Too Short') {
      setError('Please choose a stronger password.');
      return;
    }

    const result = register(name, email, password, role);
    if (result.success) {
      const { role: userRole } = result.user;
      if (userRole === 'Admin') navigate('/dashboard/admin');
      else if (userRole === 'Client') navigate('/dashboard/client');
      else if (userRole === 'Partner') navigate('/dashboard/partner');
      else navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-br, indigo.50, pink.50)" 
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
          <VStack spacing="4" mb="8" textAlign="center">
            <Heading size="lg" bgGradient="linear(to-r, purple.600, pink.600)" bgClip="text">Create Account</Heading>
            <Text fontSize="sm" color="gray.600">Join Freelance Bridge today</Text>
          </VStack>

          <form onSubmit={handleRegister}>
            <VStack spacing="4">
              {error && (
                <Alert status="error" borderRadius="lg" size="sm">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">FULL NAME</FormLabel>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">EMAIL ADDRESS</FormLabel>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="john@example.com"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold">PASSWORD</FormLabel>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={handlePasswordChange} 
                  placeholder="********"
                />
                {password && (
                  <Box mt="2" w="full">
                    <HStack justify="space-between" mb="1">
                      <Text fontSize="xs" fontWeight="bold">STRENGTH: {passwordStrength.label}</Text>
                    </HStack>
                    <Box h="2px" bg="gray.100" borderRadius="full">
                      <Box 
                        h="2px" 
                        w={`${(passwordStrength.score / 3) * 100}%`} 
                        bg={`${passwordStrength.color}.400`} 
                        transition="all 0.3s"
                        borderRadius="full"
                      />
                    </Box>
                  </Box>
                )}
              </FormControl>
              
              <FormControl as="fieldset">
                <FormLabel as="legend" fontSize="xs" fontWeight="bold">ACCOUNT TYPE</FormLabel>
                <RadioGroup onChange={setRole} value={role}>
                  <Stack direction="row" spacing="4">
                    <Radio value="Client" colorScheme="purple">Client</Radio>
                    <Radio value="Partner" colorScheme="purple">Partner</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Button 
                type="submit" 
                colorScheme="purple" 
                w="full" 
                h="12" 
                borderRadius="xl"
                shadow="md"
                mt="4"
              >
                Register
              </Button>
            </VStack>
          </form>

          <Text mt="6" textAlign="center" fontSize="sm" color="gray.600">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="purple.600" fontWeight="medium">Sign in</Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
