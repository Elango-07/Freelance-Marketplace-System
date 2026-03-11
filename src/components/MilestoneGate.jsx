import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Heading, Icon, Button, Badge,
  Progress, Textarea, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, Tooltip, Divider, Avatar,
  Alert, AlertIcon, AlertDescription, Collapse,
} from '@chakra-ui/react';
import {
  FiLock, FiUnlock, FiCheckCircle, FiClock, FiAlertTriangle,
  FiRefreshCw, FiSend, FiAlertCircle, FiChevronDown, FiChevronUp,
  FiMessageSquare, FiEdit3,
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

const AUTO_APPROVE_DAYS = 5;

const STATUS_CONFIG = {
  Pending:             { color: 'gray',   label: 'Pending',            icon: FiClock },
  Submitted:           { color: 'blue',   label: 'Under Review',       icon: FiSend },
  'Revision Requested':{ color: 'orange', label: 'Revision Requested', icon: FiRefreshCw },
  Approved:            { color: 'green',  label: 'Approved',           icon: FiCheckCircle },
  Disputed:            { color: 'red',    label: 'Disputed',           icon: FiAlertTriangle },
  Completed:           { color: 'teal',   label: 'Completed',          icon: FiCheckCircle },
};

const MilestoneGate = ({ project }) => {
  const {
    getProjectGates, initMilestoneGates,
    submitMilestone, approveMilestone, requestRevision, openDispute,
  } = useAppContext();
  const { user } = useAuth();
  const toast = useToast();

  const [expandedStage, setExpandedStage] = useState(null);
  const [revisionComment, setRevisionComment] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [submitNote, setSubmitNote] = useState('');

  const { isOpen: isRevOpen, onOpen: onRevOpen, onClose: onRevClose } = useDisclosure();
  const { isOpen: isDisputeOpen, onOpen: onDisputeOpen, onClose: onDisputeClose } = useDisclosure();
  const { isOpen: isSubmitOpen, onOpen: onSubmitOpen, onClose: onSubmitClose } = useDisclosure();
  const [activeGate, setActiveGate] = useState(null);

  // Init gates when component mounts if project has a partner
  useEffect(() => {
    if (project?.id && project?.partnerId) {
      initMilestoneGates(project.id);
    }
  }, [project?.id, project?.partnerId]);

  const gates = getProjectGates(project.id);
  const approvedCount = gates.filter(g => g.status === 'Approved').length;
  const overallProgress = (approvedCount / 4) * 100;

  const isClient  = user.id === project.clientId;
  const isPartner = user.id === project.partnerId;
  const isAdmin   = user.role === 'Admin';

  const getAutoApproveCountdown = (gate) => {
    if (gate.status !== 'Submitted' || !gate.submittedDate) return null;
    const deadline = new Date(gate.submittedDate).getTime() + AUTO_APPROVE_DAYS * 24 * 60 * 60 * 1000;
    const remaining = deadline - Date.now();
    if (remaining <= 0) return 'Pending auto-approval…';
    return `Auto-approves in ${formatDistanceToNow(new Date(deadline))}`;
  };

  const handleSubmit = (gate) => {
    submitMilestone(project.id, gate.milestoneStage, user);
    toast({ title: `Milestone ${gate.milestoneStage}% submitted`, status: 'success', duration: 3000 });
    onSubmitClose();
  };

  const handleApprove = (gate) => {
    approveMilestone(project.id, gate.milestoneStage, user);
    toast({ title: `Milestone ${gate.milestoneStage}% approved!`, status: 'success', duration: 3000 });
  };

  const handleRequestRevision = () => {
    if (!revisionComment.trim()) return;
    requestRevision(project.id, activeGate.milestoneStage, revisionComment, user);
    toast({ title: 'Revision requested', description: 'The partner has been notified.', status: 'info', duration: 3000 });
    setRevisionComment('');
    onRevClose();
  };

  const handleOpenDispute = () => {
    if (!disputeReason.trim()) return;
    openDispute(project.id, activeGate.milestoneStage, disputeReason, user);
    toast({ title: 'Dispute opened', description: 'Admin has been notified.', status: 'warning', duration: 4000 });
    setDisputeReason('');
    onDisputeClose();
  };

  // If no partner yet, show a waiting state
  if (!project.partnerId) {
    return (
      <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
        <VStack spacing="4" py="8" color="gray.400">
          <Icon as={FiLock} boxSize="10" />
          <Text fontWeight="bold">Milestone Gates Locked</Text>
          <Text fontSize="sm" textAlign="center">A partner must be assigned before milestone gates activate.</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="white" p="6" borderRadius="2xl" border="1px" borderColor="gray.100" shadow="sm">
      <VStack align="stretch" spacing="5">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing="0">
            <Heading size="sm">Milestone Gates</Heading>
            <Text fontSize="xs" color="gray.400">{approvedCount} of 4 milestones approved</Text>
          </VStack>
          <Badge colorScheme="blue" borderRadius="full" px="3" py="1" fontSize="sm">
            {Math.round(overallProgress)}%
          </Badge>
        </HStack>

        {/* Overall progress bar */}
        <Progress
          value={overallProgress}
          size="sm"
          colorScheme="blue"
          borderRadius="full"
          bg="gray.100"
          hasStripe={overallProgress < 100}
          isAnimated={overallProgress < 100}
        />

        {/* Gate Cards */}
        <VStack spacing="3" align="stretch">
          {gates.map((gate, idx) => {
            const cfg = STATUS_CONFIG[gate.status] || STATUS_CONFIG.Pending;
            const isExpanded = expandedStage === gate.milestoneStage;
            const autoMsg = getAutoApproveCountdown(gate);
            const canDispute = gate.revisionCount >= 3 && gate.status === 'Revision Requested';

            return (
              <Box
                key={gate.id}
                border="1px"
                borderColor={gate.locked ? 'gray.100' : `${cfg.color}.200`}
                borderRadius="xl"
                overflow="hidden"
                opacity={gate.locked ? 0.6 : 1}
                transition="all 0.2s"
              >
                {/* Card Header Row */}
                <HStack
                  p="4"
                  justify="space-between"
                  bg={gate.locked ? 'gray.50' : `${cfg.color}.50`}
                  cursor={!gate.locked ? 'pointer' : 'default'}
                  onClick={() => !gate.locked && setExpandedStage(isExpanded ? null : gate.milestoneStage)}
                  _hover={!gate.locked ? { bg: `${cfg.color}.100` } : {}}
                  transition="all 0.15s"
                >
                  <HStack spacing="3">
                    {/* Stage Circle */}
                    <Box
                      w="9" h="9" borderRadius="full" display="flex" alignItems="center" justifyContent="center"
                      bg={gate.locked ? 'gray.200' : gate.status === 'Approved' ? 'green.500' : `${cfg.color}.500`}
                      color="white"
                      fontWeight="bold"
                      fontSize="xs"
                    >
                      {gate.status === 'Approved'
                        ? <Icon as={FiCheckCircle} boxSize="4" />
                        : gate.locked
                        ? <Icon as={FiLock} boxSize="3.5" />
                        : `${gate.milestoneStage}%`
                      }
                    </Box>

                    <VStack align="start" spacing="0">
                      <HStack spacing="2">
                        <Text fontWeight="bold" fontSize="sm">{gate.label}</Text>
                        <Text fontSize="xs" color="gray.400">— {gate.milestoneStage}%</Text>
                      </HStack>
                      <Badge
                        colorScheme={cfg.color}
                        variant="subtle"
                        fontSize="2xs"
                        borderRadius="md"
                        px="2"
                      >
                        <HStack spacing="1">
                          <Icon as={cfg.icon} boxSize="2.5" />
                          <Text>{cfg.label}</Text>
                        </HStack>
                      </Badge>
                    </VStack>
                  </HStack>

                  <HStack>
                    {gate.revisionCount > 0 && (
                      <Tooltip label={`${gate.revisionCount}/3 revisions used`}>
                        <Badge colorScheme="orange" variant="outline" fontSize="2xs" borderRadius="md">
                          Rev {gate.revisionCount}/3
                        </Badge>
                      </Tooltip>
                    )}
                    {!gate.locked && (
                      <Icon as={isExpanded ? FiChevronUp : FiChevronDown} color="gray.400" />
                    )}
                    {gate.locked && <Icon as={FiLock} color="gray.300" boxSize="3.5" />}
                  </HStack>
                </HStack>

                {/* Expanded Panel */}
                <Collapse in={isExpanded} animateOpacity>
                  <VStack align="stretch" spacing="4" p="4" borderTop="1px" borderColor={`${cfg.color}.100`}>

                    {/* Auto-approval countdown */}
                    {autoMsg && (
                      <Alert status="info" borderRadius="lg" py="2">
                        <AlertIcon boxSize="3.5" />
                        <AlertDescription fontSize="xs">{autoMsg}</AlertDescription>
                      </Alert>
                    )}

                    {/* Revision history */}
                    {gate.revisions && gate.revisions.length > 0 && (
                      <Box>
                        <HStack spacing="1" mb="2" color="gray.400">
                          <Icon as={FiMessageSquare} boxSize="3" />
                          <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                            Revision Feedback
                          </Text>
                        </HStack>
                        <VStack align="stretch" spacing="2">
                          {gate.revisions.map((rev, i) => (
                            <Box key={i} p="3" bg="orange.50" borderRadius="lg" border="1px" borderColor="orange.100">
                              <HStack spacing="2" mb="1">
                                <Avatar size="2xs" name={rev.by} />
                                <Text fontSize="2xs" fontWeight="bold" color="orange.700">{rev.by}</Text>
                                <Text fontSize="2xs" color="gray.400">
                                  {format(new Date(rev.date), 'MMM dd, HH:mm')}
                                </Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.700">{rev.comment}</Text>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    <Divider />

                    {/* Partner Actions */}
                    {isPartner && (
                      <VStack align="stretch" spacing="2">
                        {(gate.status === 'Pending' || gate.status === 'Revision Requested') && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<FiSend />}
                            onClick={() => { setActiveGate(gate); onSubmitOpen(); }}
                          >
                            {gate.status === 'Revision Requested' ? 'Resubmit Work' : 'Submit Work'}
                          </Button>
                        )}
                        {gate.status === 'Submitted' && (
                          <Alert status="info" borderRadius="lg" py="2">
                            <AlertIcon boxSize="3.5" />
                            <AlertDescription fontSize="xs">Awaiting client review.</AlertDescription>
                          </Alert>
                        )}
                        {gate.status === 'Approved' && (
                          <Alert status="success" borderRadius="lg" py="2">
                            <AlertIcon boxSize="3.5" />
                            <AlertDescription fontSize="xs">Milestone approved! 🎉</AlertDescription>
                          </Alert>
                        )}
                        {canDispute && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<FiAlertTriangle />}
                            onClick={() => { setActiveGate(gate); onDisputeOpen(); }}
                          >
                            Open Dispute
                          </Button>
                        )}
                      </VStack>
                    )}

                    {/* Client Actions */}
                    {isClient && (
                      <VStack align="stretch" spacing="2">
                        {gate.status === 'Submitted' && (
                          <HStack>
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FiCheckCircle />}
                              flex="1"
                              onClick={() => handleApprove(gate)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="orange"
                              variant="outline"
                              leftIcon={<FiEdit3 />}
                              flex="1"
                              onClick={() => { setActiveGate(gate); onRevOpen(); }}
                              isDisabled={gate.revisionCount >= 3}
                            >
                              Request Revision
                            </Button>
                          </HStack>
                        )}
                        {gate.revisionCount >= 3 && gate.status !== 'Approved' && gate.status !== 'Disputed' && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            leftIcon={<FiAlertTriangle />}
                            onClick={() => { setActiveGate(gate); onDisputeOpen(); }}
                          >
                            Open Dispute (max revisions reached)
                          </Button>
                        )}
                        {gate.status === 'Pending' && (
                          <Text fontSize="xs" color="gray.400" textAlign="center" fontStyle="italic">
                            Waiting for partner submission.
                          </Text>
                        )}
                        {gate.status === 'Approved' && (
                          <Alert status="success" borderRadius="lg" py="2">
                            <AlertIcon boxSize="3.5" />
                            <AlertDescription fontSize="xs">
                              You approved this on {gate.approvedDate ? format(new Date(gate.approvedDate), 'MMM dd') : '—'}
                            </AlertDescription>
                          </Alert>
                        )}
                      </VStack>
                    )}

                    {/* Admin view */}
                    {isAdmin && gate.status === 'Disputed' && (
                      <Alert status="error" borderRadius="lg" py="2">
                        <AlertIcon boxSize="3.5" />
                        <AlertDescription fontSize="xs">Dispute open — resolve from the Admin Panel.</AlertDescription>
                      </Alert>
                    )}

                    {/* Submitted date */}
                    {gate.submittedDate && (
                      <Text fontSize="2xs" color="gray.400">
                        Submitted: {format(new Date(gate.submittedDate), 'MMM dd, yyyy HH:mm')}
                      </Text>
                    )}
                  </VStack>
                </Collapse>
              </Box>
            );
          })}
        </VStack>
      </VStack>

      {/* Submit Work Modal */}
      <Modal isOpen={isSubmitOpen} onClose={onSubmitClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            Submit {activeGate?.label} ({activeGate?.milestoneStage}%) Milestone
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="3" align="stretch">
              <Text fontSize="sm" color="gray.600">
                Confirm that you have completed this milestone stage and are ready for client review.
              </Text>
              <Textarea
                placeholder="Optional: add a note about what was delivered..."
                value={submitNote}
                onChange={e => setSubmitNote(e.target.value)}
                borderRadius="lg"
                rows={3}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSubmitClose}>Cancel</Button>
            <Button colorScheme="blue" leftIcon={<FiSend />} onClick={() => handleSubmit(activeGate)}>
              Submit Milestone
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Request Revision Modal */}
      <Modal isOpen={isRevOpen} onClose={onRevClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Request Revision — {activeGate?.milestoneStage}% Milestone</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="3" align="stretch">
              {activeGate && (
                <Alert status="warning" borderRadius="lg" py="2">
                  <AlertIcon boxSize="3.5" />
                  <AlertDescription fontSize="xs">
                    {3 - (activeGate.revisionCount || 0)} revision(s) remaining before a dispute can be raised.
                  </AlertDescription>
                </Alert>
              )}
              <Text fontSize="sm" fontWeight="bold">What needs to be fixed?</Text>
              <Textarea
                placeholder="Describe the changes needed in detail..."
                value={revisionComment}
                onChange={e => setRevisionComment(e.target.value)}
                borderRadius="lg"
                rows={4}
                isRequired
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRevClose}>Cancel</Button>
            <Button
              colorScheme="orange"
              leftIcon={<FiEdit3 />}
              onClick={handleRequestRevision}
              isDisabled={!revisionComment.trim()}
            >
              Send Revision Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Open Dispute Modal */}
      <Modal isOpen={isDisputeOpen} onClose={onDisputeClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Open Dispute — {activeGate?.milestoneStage}% Milestone</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="3" align="stretch">
              <Alert status="error" borderRadius="lg" py="2">
                <AlertIcon boxSize="3.5" />
                <AlertDescription fontSize="xs">
                  Admin will be notified immediately and will mediate this dispute.
                </AlertDescription>
              </Alert>
              <Text fontSize="sm" fontWeight="bold">Describe the dispute reason:</Text>
              <Textarea
                placeholder="Explain the issue clearly so admin can make a fair decision..."
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                borderRadius="lg"
                rows={4}
                isRequired
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDisputeClose}>Cancel</Button>
            <Button
              colorScheme="red"
              leftIcon={<FiAlertTriangle />}
              onClick={handleOpenDispute}
              isDisabled={!disputeReason.trim()}
            >
              Open Dispute
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MilestoneGate;
