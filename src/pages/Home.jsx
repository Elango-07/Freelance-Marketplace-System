import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Flex, VStack, HStack, SimpleGrid, Container,
  Heading, Text, Button, Icon, Badge, Avatar,
  Input, InputGroup, InputRightElement,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Divider,
} from '@chakra-ui/react';
import {
  FiArrowRight, FiCheckCircle, FiShield, FiTrendingUp, FiUsers,
  FiMessageSquare, FiLock, FiStar, FiBarChart2,
  FiAward, FiZap, FiTarget, FiGlobe, FiTwitter, FiLinkedin,
  FiGithub, FiMail, FiChevronRight, FiPlay, FiGrid,
  FiActivity, FiAlertCircle,
} from 'react-icons/fi';

// ─── Data ──────────────────────────────────────────────────────────────────
const WORKFLOW = [
  { icon: FiGrid,         label: 'Client posts project',           color: '#3b82f6' },
  { icon: FiUsers,        label: 'Admin assigns best partner',      color: '#8b5cf6' },
  { icon: FiActivity,     label: 'Partner delivers milestone work', color: '#f97316' },
  { icon: FiCheckCircle,  label: 'Client approves & pays safely',   color: '#22c55e' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Post Your Project',       desc: 'Describe your project, budget, and timeline. Our admin team reviews and prepares assignment.',         icon: FiGrid },
  { step: '02', title: 'Get a Verified Partner',  desc: 'An expert partner is handpicked by our admin based on skills and past ratings — no guesswork.',        icon: FiAward },
  { step: '03', title: 'Track Progress',          desc: 'Work is broken into 4 locked gates (25→50→75→100%). Each unlocks only after your approval.',           icon: FiTarget },
  { step: '04', title: 'Approve & Complete',      desc: 'Review deliverables at every gate, request revisions, or approve and unlock the next stage.',          icon: FiCheckCircle },
];

const FEATURES = [
  { icon: FiShield,        title: 'Secure Milestone System',    desc: 'Four locked gates ensure work is verified and approved at each stage before progressing.',      color: 'blue.500',   bg: 'blue.50' },
  { icon: FiAward,         title: 'Verified Partners',          desc: 'Every partner is manually vetted by our admin team before they receive any projects.',           color: 'purple.500', bg: 'purple.50' },
  { icon: FiBarChart2,     title: 'Project Tracking Dashboard', desc: 'Visual progress tracking, analytics, and activity logs for every stakeholder.',                  color: 'orange.500', bg: 'orange.50' },
  { icon: FiLock,          title: 'Safe Communication Tools',   desc: 'Built-in chat filters block phone numbers, emails, and external links automatically.',           color: 'red.500',    bg: 'red.50' },
  { icon: FiMessageSquare, title: 'Integrated Chat',            desc: 'Project-scoped messaging with file-sharing from the workspace — no hidden exchanges.',           color: 'teal.500',   bg: 'teal.50' },
  { icon: FiAlertCircle,   title: 'Dispute Resolution',         desc: 'Structured dispute system with admin arbitration ensures fair outcomes for both parties.',       color: 'yellow.600', bg: 'yellow.50' },
];

const CLIENT_BENEFITS = [
  'Post projects and receive work from verified developers',
  'Track progress visually with 4-stage milestone gates',
  'Request revisions up to 3 times per milestone — protected',
  'Secure milestone-based payment releases, not upfront lump sums',
  'Real-time in-platform chat with complete communication history',
  'Rate and review partners to build platform trust',
];

const PARTNER_BENEFITS = [
  'Receive curated project assignments matched to your skills',
  'Clear milestone deliverables — no ambiguous briefs',
  'Build a verified reputation through client reviews and ratings',
  'Structured workflow: submit → get feedback → revise → approve',
  'Leaderboard visibility increases your chance of future assignments',
  'Auto-approval of milestones after 72 hours protects your time',
];

const TRUST_FEATURES = [
  { icon: FiShield,      title: 'Milestone Protection',       desc: 'Funds are linked to each approved milestone gate — clients only pay for verified work.' },
  { icon: FiActivity,    title: 'Admin Monitoring',           desc: 'Every project, message, and action is logged. Admins have full visibility and intervention tools.' },
  { icon: FiAlertCircle, title: 'Dispute Resolution System',  desc: 'If parties disagree, either can raise a dispute. Admins review evidence and arbitrate fairly.' },
  { icon: FiLock,        title: 'Content Moderation',         desc: 'Automated filters prevent contact sharing, bypassing, and external link posting in chats.' },
];

const STATS = [
  { value: '1,200+', label: 'Projects Completed', icon: FiCheckCircle, color: 'blue.300' },
  { value: '340+',   label: 'Active Partners',    icon: FiUsers,       color: 'purple.300' },
  { value: '870+',   label: 'Satisfied Clients',  icon: FiStar,        color: 'yellow.300' },
  { value: '98%',    label: 'Milestone Approval', icon: FiTrendingUp,  color: 'green.300' },
];

const TESTIMONIALS = [
  { name: 'Aisha Rahman',   role: 'Startup Founder (Client)',              rating: 5, text: "Freelance Bridge gave me confidence I hadn't felt with other platforms. The milestone system meant I never paid for work I wasn't happy with." },
  { name: 'Marcus Oliveira', role: 'Full-Stack Developer (Partner)',         rating: 5, text: "The structured assignment process is brilliant. No more chasing clients — everything is clear from day one." },
  { name: 'Priya Nair',     role: 'Product Owner (Client)',                rating: 5, text: "We shipped our MVP in half the expected time. The admin team ensures you always get the right partner for the job." },
  { name: 'David Chen',     role: 'UI/UX Designer (Partner)',              rating: 5, text: "The leaderboard and review system pushed me to deliver my best work. I've grown my reputation significantly." },
];

const TOP_PARTNERS = [
  { name: 'Ravi Kumar',   skill: 'React & Node.js',   rating: 4.9, projects: 42 },
  { name: 'Sofia Martin', skill: 'UI/UX Design',       rating: 4.8, projects: 38 },
  { name: 'James Osei',   skill: 'Python & ML',        rating: 4.9, projects: 31 },
  { name: 'Lin Wei',      skill: 'Mobile Development', rating: 4.7, projects: 27 },
];

const FAQS = [
  { q: 'How does project assignment work?',             a: 'Once a client posts a project, our admin team reviews it and manually assigns the most suitable verified partner based on skills, ratings, and availability — usually within 24 hours.' },
  { q: 'Can I request revisions on delivered work?',    a: 'Yes! Clients can request up to 3 revisions per milestone. If after 3 revisions the work is still unsatisfactory, a formal dispute can be raised for admin arbitration.' },
  { q: 'What happens if I disagree with my client?',   a: 'Either party can open a dispute from the project milestone panel. An admin reviews all submitted files, messages, and revision history, then issues a fair decision.' },
  { q: 'How is payment protected?',                    a: 'Our milestone gate system ensures payments are tied to approved deliverables. Clients approve each stage before work progresses — no lump-sum upfront payments.' },
  { q: 'Is partner communication secure?',              a: 'All chat messages are filtered in real-time. Phone numbers, emails, and external links are blocked automatically to prevent platform bypass.' },
  { q: 'How does the auto-approval work?',              a: "If a client doesn't review a submitted milestone within 72 hours, the system automatically approves it — protecting partner time and keeping projects moving." },
];

const NAV_LINKS = [
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Features',     id: 'features' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ',          id: 'faq' },
];

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

// ─── Sub-components ────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <Badge colorScheme="blue" variant="subtle" px="3" py="1" borderRadius="full" fontSize="xs" letterSpacing="widest" textTransform="uppercase" mb="3">
    {children}
  </Badge>
);

const StarRow = () => (
  <HStack spacing="0.5">
    {[1,2,3,4,5].map(i => <Icon key={i} as={FiStar} color="yellow.400" boxSize="3.5" />)}
  </HStack>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <Box
      as="nav"
      position="fixed" top="0" left="0" right="0" zIndex="1000"
      transition="all 0.25s"
      bg={scrolled ? 'rgba(255,255,255,0.95)' : 'transparent'}
      backdropFilter={scrolled ? 'blur(12px)' : 'none'}
      borderBottom={scrolled ? '1px solid' : 'none'}
      borderColor="gray.100"
      boxShadow={scrolled ? 'sm' : 'none'}
    >
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <Flex h="16" align="center" justify="space-between">
          <HStack spacing="2">
            <Box w="8" h="8" bg="blue.500" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FiZap} color="white" boxSize="4" />
            </Box>
            <Text fontWeight="black" fontSize="lg" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text">
              Freelance Bridge
            </Text>
          </HStack>

          <HStack spacing="6" display={{ base: 'none', md: 'flex' }}>
            {NAV_LINKS.map(l => (
              <Text key={l.id} as="button" fontSize="sm" fontWeight="medium" color="gray.600" _hover={{ color: 'blue.600' }} onClick={() => scrollTo(l.id)} transition="color 0.15s" bg="none" border="none" cursor="pointer">
                {l.label}
              </Text>
            ))}
          </HStack>

          <HStack spacing="3">
            <Button as={RouterLink} to="/login" variant="ghost" size="sm" color="gray.600">Sign In</Button>
            <Button as={RouterLink} to="/register" colorScheme="blue" size="sm" rightIcon={<Icon as={FiArrowRight} />}>
              Get Started
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const Home = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    document.title = 'Freelance Bridge — Trusted Freelance Platform with Milestone Protection';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Connect with verified developers through a secure, milestone-gated freelance platform. Post projects, track progress, and pay only for approved work.';
    return () => { document.title = 'Freelance Bridge'; };
  }, []);

  const handleSubscribe = () => {
    if (email.includes('@')) { setSubscribed(true); setEmail(''); }
  };

  return (
    <Box minH="100vh" bg="white">
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <Box
        as="section"
        pt={{ base: '24', md: '32' }}
        pb={{ base: '16', md: '24' }}
        bgGradient="linear(135deg, blue.50 0%, purple.50 50%, pink.50 100%)"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative circles */}
        <Box position="absolute" top="-20%" left="-10%" w="600px" h="600px" bg="blue.100" opacity="0.35" borderRadius="full" pointerEvents="none" filter="blur(60px)" />
        <Box position="absolute" bottom="-20%" right="-10%" w="500px" h="500px" bg="purple.100" opacity="0.3" borderRadius="full" pointerEvents="none" filter="blur(60px)" />

        <Container maxW="6xl" px={{ base: 4, md: 8 }} position="relative">
          <VStack spacing="6" textAlign="center">
            <Badge colorScheme="blue" variant="subtle" px="4" py="1.5" borderRadius="full" fontSize="xs" letterSpacing="wider">
              🚀 Trusted Freelance Ecosystem — Now Live
            </Badge>

            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
              fontWeight="black"
              lineHeight="1.1"
              letterSpacing="-0.03em"
              color="gray.900"
            >
              The Freelance Platform
              <Box as="span" display="block" bgGradient="linear(to-r, blue.500, purple.600)" bgClip="text">
                Built on Trust.
              </Box>
            </Heading>

            <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.500" maxW="2xl" lineHeight="relaxed">
              Connect with verified developers and designers through a secure, milestone-gated system.
              Post projects, track progress in real-time, and{' '}
              <Text as="span" fontWeight="bold" color="gray.700">pay only for approved work.</Text>
            </Text>

            <Flex gap="4" direction={{ base: 'column', sm: 'row' }} justify="center">
              <Button
                as={RouterLink} to="/register"
                size="lg"
                colorScheme="blue"
                rightIcon={<Icon as={FiArrowRight} />}
                px="8" h="14" borderRadius="xl" fontWeight="bold"
                bgGradient="linear(to-r, blue.500, purple.600)"
                _hover={{ bgGradient: 'linear(to-r, blue.600, purple.700)', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                Get Started Free
              </Button>
              <Button
                as={RouterLink} to="/login"
                size="lg"
                variant="outline"
                borderColor="gray.300"
                bg="white"
                leftIcon={<Icon as={FiPlay} />}
                px="8" h="14" borderRadius="xl"
                _hover={{ bg: 'gray.50', transform: 'translateY(-2px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                Explore Platform
              </Button>
            </Flex>

            <HStack spacing="6" justify="center" flexWrap="wrap">
              {['No upfront fees', 'Verified partners only', 'Milestone protection'].map(t => (
                <HStack key={t} spacing="1.5">
                  <Icon as={FiCheckCircle} color="green.500" boxSize="4" />
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">{t}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>

          {/* Workflow strip */}
          <Box
            mt="14"
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            border="1px solid"
            borderColor="gray.100"
            p="6"
            maxW="3xl"
            mx="auto"
          >
            <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="widest" textAlign="center" mb="5">
              HOW FREELANCE BRIDGE WORKS
            </Text>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
              {WORKFLOW.map((step, i) => (
                <React.Fragment key={i}>
                  <VStack spacing="2" flex="1" minW="80px">
                    <Box
                      w="10" h="10"
                      borderRadius="xl"
                      display="flex" alignItems="center" justifyContent="center"
                      boxShadow="md"
                      style={{ background: step.color }}
                    >
                      <Icon as={step.icon} color="white" boxSize="4" />
                    </Box>
                    <Text fontSize="xs" fontWeight="semibold" textAlign="center" color="gray.600" maxW="90px">{step.label}</Text>
                  </VStack>
                  {i < WORKFLOW.length - 1 && (
                    <Icon as={FiChevronRight} color="gray.300" boxSize="5" display={{ base: 'none', sm: 'block' }} />
                  )}
                </React.Fragment>
              ))}
            </Flex>
          </Box>
        </Container>
      </Box>

      {/* ── STATS ──────────────────────────────────────────────────────── */}
      <Box as="section" py="14" bg="blue.600" id="stats">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing="8">
            {STATS.map((s, i) => (
              <VStack key={i} spacing="1" textAlign="center">
                <Icon as={s.icon} color="blue.200" boxSize="6" mb="1" />
                <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" color="white" lineHeight="1">{s.value}</Text>
                <Text fontSize="sm" color="blue.100" fontWeight="medium">{s.label}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <Box as="section" id="how-it-works" py="24" bg="gray.50">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack spacing="3" textAlign="center" mb="14">
            <SectionLabel>Process</SectionLabel>
            <Heading size="xl" fontWeight="black" color="gray.900">How It Works</Heading>
            <Text color="gray.500" maxW="xl" fontSize="lg">Four simple steps from project idea to successful delivery.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6">
            {HOW_IT_WORKS.map((step, i) => (
              <Box
                key={i}
                bg="white" borderRadius="2xl" p="6" border="1px solid" borderColor="gray.100" boxShadow="sm"
                position="relative" overflow="hidden"
                _hover={{ boxShadow: 'lg', transform: 'translateY(-4px)', borderColor: 'blue.100' }}
                transition="all 0.25s"
              >
                <Box position="absolute" top="3" right="4" fontSize="4xl" fontWeight="black" color="gray.100">{step.step}</Box>
                <Box w="12" h="12" bg="blue.50" borderRadius="xl" display="flex" alignItems="center" justifyContent="center" mb="4">
                  <Icon as={step.icon} color="blue.500" boxSize="5" />
                </Box>
                <Heading size="sm" mb="2" color="gray.800">{step.title}</Heading>
                <Text fontSize="sm" color="gray.500" lineHeight="relaxed">{step.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── FEATURES GRID ──────────────────────────────────────────────── */}
      <Box as="section" id="features" py="24" bg="white">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack spacing="3" textAlign="center" mb="14">
            <SectionLabel>Platform Tools</SectionLabel>
            <Heading size="xl" fontWeight="black" color="gray.900">Everything You Need to Succeed</Heading>
            <Text color="gray.500" maxW="xl" fontSize="lg">Powerful tools built for both clients and developers.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
            {FEATURES.map((f, i) => (
              <Box
                key={i}
                bg="white" borderRadius="2xl" p="6" border="1px solid" borderColor="gray.100" boxShadow="sm"
                _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                transition="all 0.25s"
              >
                <Box w="12" h="12" bg={f.bg} borderRadius="xl" display="flex" alignItems="center" justifyContent="center" mb="4">
                  <Icon as={f.icon} color={f.color} boxSize="5" />
                </Box>
                <Heading size="sm" mb="2" color="gray.800">{f.title}</Heading>
                <Text fontSize="sm" color="gray.500" lineHeight="relaxed">{f.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── CLIENT & PARTNER BENEFITS ──────────────────────────────────── */}
      <Box as="section" py="24" bg="gray.50">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="10">
            {/* Clients */}
            <Box bg="white" borderRadius="2xl" p="8" border="1px solid" borderColor="blue.100" boxShadow="sm">
              <HStack mb="5" spacing="3">
                <Box w="10" h="10" bg="blue.50" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={FiUsers} color="blue.500" boxSize="5" />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="blue.400" letterSpacing="wider">FOR CLIENTS</Text>
                  <Heading size="md" color="gray.900">Post, Track & Pay Safely</Heading>
                </Box>
              </HStack>
              <VStack align="start" spacing="3">
                {CLIENT_BENEFITS.map((b, i) => (
                  <HStack key={i} spacing="3" align="start">
                    <Icon as={FiCheckCircle} color="blue.500" boxSize="4" mt="0.5" flexShrink="0" />
                    <Text fontSize="sm" color="gray.600" lineHeight="relaxed">{b}</Text>
                  </HStack>
                ))}
              </VStack>
              <Button as={RouterLink} to="/register" mt="6" colorScheme="blue" size="sm" rightIcon={<Icon as={FiArrowRight} />} borderRadius="xl">
                Post Your Project
              </Button>
            </Box>

            {/* Partners */}
            <Box bg="white" borderRadius="2xl" p="8" border="1px solid" borderColor="purple.100" boxShadow="sm">
              <HStack mb="5" spacing="3">
                <Box w="10" h="10" bg="purple.50" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={FiAward} color="purple.500" boxSize="5" />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="purple.400" letterSpacing="wider">FOR PARTNERS</Text>
                  <Heading size="md" color="gray.900">Grow Your Reputation</Heading>
                </Box>
              </HStack>
              <VStack align="start" spacing="3">
                {PARTNER_BENEFITS.map((b, i) => (
                  <HStack key={i} spacing="3" align="start">
                    <Icon as={FiCheckCircle} color="purple.500" boxSize="4" mt="0.5" flexShrink="0" />
                    <Text fontSize="sm" color="gray.600" lineHeight="relaxed">{b}</Text>
                  </HStack>
                ))}
              </VStack>
              <Button as={RouterLink} to="/register" mt="6" colorScheme="purple" size="sm" rightIcon={<Icon as={FiArrowRight} />} borderRadius="xl">
                Join as Partner
              </Button>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── MILESTONE GATE EXPLAINER ───────────────────────────────────── */}
      <Box as="section" py="24" bg="white">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack spacing="3" textAlign="center" mb="12">
            <SectionLabel>Unique System</SectionLabel>
            <Heading size="xl" fontWeight="black" color="gray.900">The Milestone Gate System</Heading>
            <Text color="gray.500" maxW="2xl" fontSize="lg">
              Work is never delivered as a black box. Four locked gates ensure you see and approve every stage.
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="6" maxW="5xl" mx="auto">
            {[
              { pct: '25%', name: 'Planning Gate',    colorScheme: 'blue',   desc: 'Project scoped, design reviewed, initial deliverables presented.' },
              { pct: '50%', name: 'Development Gate', colorScheme: 'purple', desc: 'Core functionality built. Client reviews working prototype.' },
              { pct: '75%', name: 'Testing Gate',     colorScheme: 'orange', desc: 'All features implemented, QA complete, refinements applied.' },
              { pct: '100%',name: 'Delivery Gate',    colorScheme: 'green',  desc: 'Final delivery. Client approves, project marked complete.' },
            ].map((gate, i) => (
              <Box
                key={i}
                bg="white" borderRadius="2xl" p="5" border="2px solid"
                borderColor={`${gate.colorScheme}.100`}
                boxShadow="sm"
                _hover={{ boxShadow: 'lg', transform: 'translateY(-4px)' }}
                transition="all 0.25s"
                textAlign="center"
              >
                <Box
                  w="14" h="14"
                  colorScheme={gate.colorScheme}
                  bg={`${gate.colorScheme}.500`}
                  borderRadius="2xl"
                  display="flex" alignItems="center" justifyContent="center"
                  mx="auto" mb="3"
                  boxShadow="md"
                >
                  <Text fontWeight="black" color="white" fontSize="sm">{gate.pct}</Text>
                </Box>
                <Text fontWeight="bold" color="gray.800" mb="2" fontSize="sm">{gate.name}</Text>
                <Text fontSize="xs" color="gray.500" lineHeight="relaxed">{gate.desc}</Text>
                <Badge mt="3" colorScheme={gate.colorScheme} variant="subtle" fontSize="2xs" borderRadius="full">
                  {i === 0 ? 'Always Unlocked' : 'Unlocks on Approval'}
                </Badge>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── TRUST ──────────────────────────────────────────────────────── */}
      <Box as="section" py="24" bg="gray.900">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack spacing="3" textAlign="center" mb="12">
            <SectionLabel>Safety First</SectionLabel>
            <Heading size="xl" fontWeight="black" color="white">Platform Safety & Trust</Heading>
            <Text color="gray.400" maxW="xl" fontSize="lg">Multiple layers of protection for every transaction and conversation.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6">
            {TRUST_FEATURES.map((t, i) => (
              <Box
                key={i}
                bg="gray.800" borderRadius="2xl" p="6" border="1px solid" borderColor="gray.700"
                _hover={{ borderColor: 'blue.500', transform: 'translateY(-4px)', boxShadow: 'xl' }}
                transition="all 0.25s"
              >
                <Box w="10" h="10" bg="blue.900" borderRadius="xl" display="flex" alignItems="center" justifyContent="center" mb="4">
                  <Icon as={t.icon} color="blue.400" boxSize="5" />
                </Box>
                <Heading size="sm" mb="2" color="white">{t.title}</Heading>
                <Text fontSize="sm" color="gray.400" lineHeight="relaxed">{t.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────── */}
      <Box as="section" id="testimonials" py="24" bg="white">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack spacing="3" textAlign="center" mb="12">
            <SectionLabel>Social Proof</SectionLabel>
            <Heading size="xl" fontWeight="black" color="gray.900">What Our Users Say</Heading>
            <Text color="gray.500" maxW="xl" fontSize="lg">Real experiences from clients and partners who use Freelance Bridge.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="6">
            {TESTIMONIALS.map((t, i) => (
              <Box
                key={i}
                bg="gray.50" borderRadius="2xl" p="6" border="1px solid" borderColor="gray.100"
                _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.25s"
              >
                <StarRow />
                <Text fontSize="md" color="gray.700" lineHeight="relaxed" mt="3" mb="5" fontStyle="italic">"{t.text}"</Text>
                <HStack spacing="3">
                  <Avatar name={t.name} bg="blue.500" color="white" size="sm" />
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800">{t.name}</Text>
                    <Text fontSize="xs" color="gray.400">{t.role}</Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── TOP PARTNERS ───────────────────────────────────────────────── */}
      <Box as="section" py="24" bg="gray.50">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack spacing="3" textAlign="center" mb="12">
            <SectionLabel>Top Talent</SectionLabel>
            <Heading size="xl" fontWeight="black" color="gray.900">Meet Our Top Partners</Heading>
            <Text color="gray.500" maxW="xl">Verified experts with proven track records — ready to take on your project.</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="6">
            {TOP_PARTNERS.map((p, i) => (
              <Box
                key={i}
                bg="white" borderRadius="2xl" p="6" border="1px solid" borderColor="gray.100" boxShadow="sm"
                textAlign="center"
                _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                transition="all 0.25s"
              >
                <Avatar name={p.name} bg="blue.500" color="white" size="lg" mb="3" mx="auto" display="block" />
                <Text fontWeight="bold" color="gray.800" fontSize="sm">{p.name}</Text>
                <Text fontSize="xs" color="blue.500" fontWeight="medium" mb="2">{p.skill}</Text>
                <HStack justify="center" spacing="3">
                  <HStack spacing="1">
                    <Icon as={FiStar} color="yellow.400" boxSize="3" />
                    <Text fontSize="xs" fontWeight="bold">{p.rating}</Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.300">·</Text>
                  <Text fontSize="xs" color="gray.500">{p.projects} projects</Text>
                </HStack>
                <Badge mt="3" colorScheme="green" variant="subtle" fontSize="2xs" borderRadius="full">✓ Verified</Badge>
              </Box>
            ))}
          </SimpleGrid>
          <Box textAlign="center" mt="10">
            <Button as={RouterLink} to="/register" colorScheme="blue" variant="outline" size="md" rightIcon={<Icon as={FiArrowRight} />} borderRadius="xl">
              View All Partners
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── MISSION ────────────────────────────────────────────────────── */}
      <Box as="section" py="24" bg="blue.600" position="relative" overflow="hidden">
        <Box position="absolute" inset="0" opacity="0.07"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <Container maxW="4xl" textAlign="center" position="relative">
          <Icon as={FiGlobe} color="blue.200" boxSize="10" mb="4" />
          <Heading size="xl" fontWeight="black" color="white" mb="4">Our Mission</Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color="blue.100" lineHeight="relaxed" mb="8">
            We're building a trusted freelance ecosystem where clients can confidently post projects
            and verified partners can grow sustainable careers — powered by transparency, milestone protection,
            and human-centred admin oversight.
          </Text>
          <Button as={RouterLink} to="/register" bg="white" color="blue.600" size="lg" rightIcon={<Icon as={FiArrowRight} />} borderRadius="xl" fontWeight="bold" _hover={{ bg: 'gray.50', transform: 'translateY(-2px)', boxShadow: 'md' }} transition="all 0.2s">
            Join the Mission
          </Button>
        </Container>
      </Box>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <Box as="section" id="faq" py="24" bg="white">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack spacing="3" textAlign="center" mb="12">
            <SectionLabel>FAQ</SectionLabel>
            <Heading size="xl" fontWeight="black" color="gray.900">Frequently Asked Questions</Heading>
            <Text color="gray.500" maxW="xl">Everything you need to know before getting started.</Text>
          </VStack>
          <Box maxW="3xl" mx="auto">
            <Accordion allowToggle>
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} border="none" mb="3">
                  <Box border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden" _hover={{ borderColor: 'blue.200' }} transition="border-color 0.15s">
                    <AccordionButton p="5" _hover={{ bg: 'gray.50' }}>
                      <Text flex="1" textAlign="left" fontWeight="semibold" fontSize="sm" color="gray.800">{faq.q}</Text>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel bg="gray.50" px="5" pb="5" pt="3">
                      <Text fontSize="sm" color="gray.600" lineHeight="relaxed">{faq.a}</Text>
                    </AccordionPanel>
                  </Box>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        </Container>
      </Box>

      {/* ── NEWSLETTER ─────────────────────────────────────────────────── */}
      <Box as="section" py="24" bg="gray.50">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <Box maxW="2xl" mx="auto" textAlign="center" bg="white" borderRadius="2xl" p={{ base: 8, md: 12 }} border="1px solid" borderColor="gray.100" boxShadow="md">
            <Icon as={FiMail} color="blue.500" boxSize="8" mb="4" />
            <Heading size="lg" fontWeight="black" color="gray.900" mb="2">Stay in the Loop</Heading>
            <Text color="gray.500" mb="6" fontSize="sm">Platform updates and freelancing tips — delivered to your inbox.</Text>
            {subscribed ? (
              <VStack spacing="2">
                <Icon as={FiCheckCircle} color="green.500" boxSize="8" />
                <Text fontWeight="bold" color="green.600">You're subscribed! 🎉</Text>
                <Text fontSize="sm" color="gray.500">We'll send you updates as we launch new features.</Text>
              </VStack>
            ) : (
              <InputGroup size="lg" maxW="400px" mx="auto">
                <Input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  borderRadius="xl"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'blue.400', bg: 'white' }}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                />
                <InputRightElement w="auto" pr="1">
                  <Button
                    onClick={handleSubscribe}
                    colorScheme="blue"
                    borderRadius="lg"
                    size="sm"
                    px="5"
                    h="10"
                    isDisabled={!email.includes('@')}
                  >
                    Subscribe
                  </Button>
                </InputRightElement>
              </InputGroup>
            )}
          </Box>
        </Container>
      </Box>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <Box as="footer" bg="gray.900" color="gray.400" py="16">
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing="10" mb="12">
            {/* Brand */}
            <VStack align="start" spacing="4">
              <HStack>
                <Box w="8" h="8" bg="blue.500" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={FiZap} color="white" boxSize="4" />
                </Box>
                <Text fontWeight="black" color="white" fontSize="lg">Freelance Bridge</Text>
              </HStack>
              <Text fontSize="sm" lineHeight="relaxed">
                A trusted freelance ecosystem built on milestone protection, verified partnerships, and transparent collaboration.
              </Text>
              <HStack spacing="3">
                {[FiTwitter, FiLinkedin, FiGithub].map((SocialIcon, i) => (
                  <Box
                    key={i}
                    as="button"
                    w="8" h="8" bg="gray.800" borderRadius="lg"
                    display="flex" alignItems="center" justifyContent="center"
                    _hover={{ bg: 'blue.900', color: 'blue.400' }}
                    transition="all 0.15s"
                  >
                    <Icon as={SocialIcon} boxSize="3.5" />
                  </Box>
                ))}
              </HStack>
            </VStack>

            {/* Platform */}
            <VStack align="start" spacing="3">
              <Text fontWeight="bold" color="white" fontSize="sm" mb="1">Platform</Text>
              {['How It Works', 'Features', 'Testimonials', 'FAQ'].map(label => (
                <Text
                  key={label}
                  as="button"
                  fontSize="sm"
                  color="gray.400"
                  bg="none"
                  border="none"
                  cursor="pointer"
                  _hover={{ color: 'white' }}
                  transition="color 0.15s"
                  textAlign="left"
                  p="0"
                  onClick={() => scrollTo(label.toLowerCase().replace(/\s+/g, '-'))}
                >
                  {label}
                </Text>
              ))}
            </VStack>

            {/* Company */}
            <VStack align="start" spacing="3">
              <Text fontWeight="bold" color="white" fontSize="sm" mb="1">Company</Text>
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service', 'Security'].map(link => (
                <Text key={link} fontSize="sm" _hover={{ color: 'white' }} transition="color 0.15s" cursor="pointer">{link}</Text>
              ))}
            </VStack>

            {/* CTA */}
            <VStack align="start" spacing="3">
              <Text fontWeight="bold" color="white" fontSize="sm" mb="1">Get Started</Text>
              <Button as={RouterLink} to="/register" size="sm" colorScheme="blue" w="full" borderRadius="lg" rightIcon={<Icon as={FiArrowRight} />}>
                Create Account
              </Button>
              <Button as={RouterLink} to="/login" size="sm" variant="outline" borderColor="gray.600" color="gray.400" _hover={{ borderColor: 'gray.400', color: 'white' }} borderRadius="lg" w="full">
                Sign In
              </Button>
              <Text fontSize="xs" mt="2">No credit card required. Join for free.</Text>
            </VStack>
          </SimpleGrid>

          <Divider borderColor="gray.800" mb="6" />

          <Flex justify="space-between" align="center" flexWrap="wrap" gap="3">
            <Text fontSize="xs">© {new Date().getFullYear()} Freelance Bridge. All rights reserved.</Text>
            <HStack spacing="4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                <Text key={link} fontSize="xs" _hover={{ color: 'white' }} cursor="pointer" transition="color 0.15s">{link}</Text>
              ))}
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
