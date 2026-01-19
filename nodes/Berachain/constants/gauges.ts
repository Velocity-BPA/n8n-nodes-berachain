/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Berachain Gauge Configuration
 *
 * Gauges direct BGT emissions to different reward vaults.
 * Users vote with their BGT to influence reward distribution.
 */

export interface GaugeInfo {
  address: string;
  name: string;
  rewardVault: string;
  protocol: string;
  weight: number; // Current weight (basis points)
  isActive: boolean;
}

/**
 * Known gauges on bArtio testnet
 */
export const BARTIO_GAUGES: GaugeInfo[] = [
  {
    address: '0xGAUGE1234567890123456789012345678901234',
    name: 'BEX HONEY-WBERA Gauge',
    rewardVault: '0x7a17A3BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F0',
    protocol: 'BEX',
    weight: 2500, // 25%
    isActive: true,
  },
  {
    address: '0xGAUGE2345678901234567890123456789012345',
    name: 'BEX HONEY-USDC Gauge',
    rewardVault: '0x8B28b3BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F1',
    protocol: 'BEX',
    weight: 2000, // 20%
    isActive: true,
  },
  {
    address: '0xGAUGE3456789012345678901234567890123456',
    name: 'Bend aHONEY Gauge',
    rewardVault: '0xAD4AD5BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F3',
    protocol: 'Bend',
    weight: 1500, // 15%
    isActive: true,
  },
  {
    address: '0xGAUGE4567890123456789012345678901234567',
    name: 'Berps bHONEY Gauge',
    rewardVault: '0xBE5BE6BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F4',
    protocol: 'Berps',
    weight: 1500, // 15%
    isActive: true,
  },
];

/**
 * Gauge voting configuration
 */
export const GAUGE_CONFIG = {
  votingPeriod: 7 * 24 * 60 * 60, // 7 days in seconds
  minVoteAmount: '1', // 1 BGT minimum vote
  maxGaugesPerVote: 10, // Maximum gauges to vote for at once
  voteDecay: true, // Votes decay over time
  decayPeriod: 30 * 24 * 60 * 60, // 30 days decay period
};

/**
 * Get gauges for a network
 */
export function getGauges(network: string): GaugeInfo[] {
  switch (network) {
    case 'mainnet':
      return []; // Will be populated when mainnet launches
    case 'bartio':
    default:
      return BARTIO_GAUGES;
  }
}

/**
 * Get active gauges only
 */
export function getActiveGauges(network: string): GaugeInfo[] {
  return getGauges(network).filter((gauge) => gauge.isActive);
}

/**
 * Get gauges by protocol
 */
export function getGaugesByProtocol(network: string, protocol: string): GaugeInfo[] {
  return getGauges(network).filter(
    (gauge) => gauge.protocol.toLowerCase() === protocol.toLowerCase(),
  );
}

/**
 * Sample gauges for testing and examples
 */
export const SAMPLE_GAUGES = BARTIO_GAUGES;

/**
 * Voting configuration alias
 */
export const VOTING_CONFIG = GAUGE_CONFIG;
