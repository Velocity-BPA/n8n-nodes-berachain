/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Berachain Reward Vaults Configuration
 *
 * Reward Vaults are where users stake LP tokens to earn BGT emissions.
 * Only whitelisted vaults can receive BGT rewards from validators.
 */

export interface RewardVaultInfo {
  address: string;
  name: string;
  stakingToken: string;
  stakingTokenSymbol: string;
  protocol: string;
  isWhitelisted: boolean;
}

/**
 * Known reward vaults on bArtio testnet
 */
export const BARTIO_REWARD_VAULTS: RewardVaultInfo[] = [
  {
    address: '0x7a17A3BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F0',
    name: 'BEX HONEY-WBERA',
    stakingToken: '0x1234567890123456789012345678901234567890',
    stakingTokenSymbol: 'BEX-LP-HONEY-WBERA',
    protocol: 'BEX',
    isWhitelisted: true,
  },
  {
    address: '0x8B28b3BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F1',
    name: 'BEX HONEY-USDC',
    stakingToken: '0x2345678901234567890123456789012345678901',
    stakingTokenSymbol: 'BEX-LP-HONEY-USDC',
    protocol: 'BEX',
    isWhitelisted: true,
  },
  {
    address: '0x9C39c4BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F2',
    name: 'BEX WBERA-WETH',
    stakingToken: '0x3456789012345678901234567890123456789012',
    stakingTokenSymbol: 'BEX-LP-WBERA-WETH',
    protocol: 'BEX',
    isWhitelisted: true,
  },
  {
    address: '0xAD4AD5BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F3',
    name: 'Bend aHONEY',
    stakingToken: '0x4567890123456789012345678901234567890123',
    stakingTokenSymbol: 'aHONEY',
    protocol: 'Bend',
    isWhitelisted: true,
  },
  {
    address: '0xBE5BE6BD4c8f10B1C8b7F4C8a9fC5cF88d37d6F4',
    name: 'Berps bHONEY',
    stakingToken: '0x5678901234567890123456789012345678901234',
    stakingTokenSymbol: 'bHONEY',
    protocol: 'Berps',
    isWhitelisted: true,
  },
];

/**
 * Reward vault status
 */
export enum VaultStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DEPRECATED = 'deprecated',
}

/**
 * Vault configuration limits
 */
export const VAULT_CONFIG = {
  minStakeAmount: '0.001', // Minimum stake in tokens
  maxStakePerTx: '1000000', // Maximum stake per transaction
  withdrawalDelay: 0, // Instant withdrawals (no delay)
  claimCooldown: 0, // No cooldown for claims
};

/**
 * Get reward vaults for a network
 */
export function getRewardVaults(network: string): RewardVaultInfo[] {
  switch (network) {
    case 'mainnet':
      return []; // Will be populated when mainnet launches
    case 'bartio':
    default:
      return BARTIO_REWARD_VAULTS;
  }
}

/**
 * Get whitelisted vaults only
 */
export function getWhitelistedVaults(network: string): RewardVaultInfo[] {
  return getRewardVaults(network).filter((vault) => vault.isWhitelisted);
}

/**
 * Get vaults by protocol
 */
export function getVaultsByProtocol(network: string, protocol: string): RewardVaultInfo[] {
  return getRewardVaults(network).filter(
    (vault) => vault.protocol.toLowerCase() === protocol.toLowerCase(),
  );
}

/**
 * Sample vaults for testing and examples
 */
export const SAMPLE_VAULTS = BARTIO_REWARD_VAULTS;
