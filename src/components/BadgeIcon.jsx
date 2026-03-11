import React from 'react';
import { 
  Tag, 
  TagLeftIcon, 
  TagLabel, 
  Tooltip 
} from '@chakra-ui/react';
import { 
  FiStar, 
  FiAward, 
  FiZap, 
  FiShield 
} from 'react-icons/fi';

const BadgeIcon = ({ type, size = 'sm' }) => {
  const badgeConfig = {
    'Top Rated': {
      color: 'yellow',
      icon: FiStar,
      description: 'Maintains a 4.5+ rating with multiple reviews'
    },
    'Trusted Partner': {
      color: 'green',
      icon: FiShield,
      description: 'Successfully completed 5+ projects'
    },
    'Verified Skills': {
      color: 'blue',
      icon: FiAward,
      description: 'High success rate on specialized tasks'
    },
    'Fast Delivery': {
      color: 'purple',
      icon: FiZap,
      description: 'Consistently meets or beats deadlines'
    }
  };

  const config = badgeConfig[type];

  if (!config) return null;

  return (
    <Tooltip label={config.description} placement="top" hasArrow>
      <Tag size={size} variant="subtle" colorScheme={config.color} borderRadius="full" px="3">
        <TagLeftIcon as={config.icon} />
        <TagLabel fontWeight="bold" fontSize="2xs">{type.toUpperCase()}</TagLabel>
      </Tag>
    </Tooltip>
  );
};

export default BadgeIcon;
