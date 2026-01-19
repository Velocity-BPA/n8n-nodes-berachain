/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Berachain Validator Configuration
 *
 * Proof of Liquidity (PoL) validators configuration.
 * Validators receive BGT boosts from users and distribute rewards via the Cutting Board.
 */

export interface ValidatorInfo {
  address: string;
  name: string;
  website?: string;
  description?: string;
  commission: number; // Percentage (0-100)
}

/**
 * Known validators on bArtio testnet
 * Note: This is a sample list - actual validators may differ
 */
export const BARTIO_VALIDATORS: ValidatorInfo[] = [
  {
    address: '0x40495A781095932e2FC8dccA69F5e358711Fdd41',
    name: 'Berachain Genesis',
    website: 'https://berachain.com',
    description: 'Genesis validator operated by Berachain Foundation',
    commission: 5,
  },
  {
    address: '0x2D3e7C0E5B50B1E75Fb48E65F39eB45e7C72D3F5',
    name: 'Infrared',
    website: 'https://infrared.finance',
    description: 'Liquid staking protocol validator',
    commission: 10,
  },
  {
    address: '0x3F4a6C1D2B50B1E75Fb48E65F39eB45e7C72D3F5',
    name: 'Kodiak',
    website: 'https://kodiak.finance',
    description: 'DEX aggregator validator',
    commission: 8,
  },
];

/**
 * Validator status enum
 */
export enum ValidatorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  JAILED = 'jailed',
  TOMBSTONED = 'tombstoned',
}

/**
 * Minimum stake requirements
 */
export const VALIDATOR_REQUIREMENTS = {
  minSelfDelegation: '10000', // 10,000 BERA
  minBoostAmount: '1', // 1 BGT minimum boost
  unbondingPeriod: 21 * 24 * 60 * 60, // 21 days in seconds
  maxValidators: 100, // Maximum active validators
};

/**
 * Cutting Board configuration
 * Determines how validators distribute BGT rewards to reward vaults
 */
export const CUTTING_BOARD_CONFIG = {
  maxWeights: 10, // Maximum number of vaults per validator
  minWeight: 1, // Minimum weight (basis points)
  maxWeight: 10000, // Maximum weight (100% in basis points)
  updateCooldown: 24 * 60 * 60, // 24 hours between updates
};

/**
 * Get validators for a network
 */
export function getValidators(network: string): ValidatorInfo[] {
  switch (network) {
    case 'mainnet':
      return []; // Will be populated when mainnet launches
    case 'bartio':
    default:
      return BARTIO_VALIDATORS;
  }
}

/**
 * Validate validator address format
 */
export function isValidValidatorAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Sample validators for testing and examples
 */
export const SAMPLE_VALIDATORS = BARTIO_VALIDATORS;
