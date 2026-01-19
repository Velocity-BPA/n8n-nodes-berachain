/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Berachain Network Configuration
 *
 * Defines network settings for Berachain mainnet and testnet (bArtio).
 * bArtio is the primary testnet using Chain ID 80084.
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  wsUrl: string;
  explorerUrl: string;
  explorerApiUrl: string;
  isTestnet: boolean;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'Berachain Mainnet',
    chainId: 80085, // Placeholder - actual mainnet chain ID TBD
    rpcUrl: 'https://rpc.berachain.com',
    wsUrl: 'wss://rpc.berachain.com/ws',
    explorerUrl: 'https://beratrail.io',
    explorerApiUrl: 'https://api.beratrail.io',
    isTestnet: false,
    nativeCurrency: {
      name: 'BERA',
      symbol: 'BERA',
      decimals: 18,
    },
  },
  bartio: {
    name: 'Berachain bArtio Testnet',
    chainId: 80084,
    rpcUrl: 'https://bartio.rpc.berachain.com',
    wsUrl: 'wss://bartio.rpc.berachain.com/ws',
    explorerUrl: 'https://bartio.beratrail.io',
    explorerApiUrl: 'https://api.routescan.io/v2/network/testnet/evm/80084/etherscan',
    isTestnet: true,
    nativeCurrency: {
      name: 'BERA',
      symbol: 'BERA',
      decimals: 18,
    },
  },
};

/**
 * Get network configuration by network key
 */
export function getNetworkConfig(network: string): NetworkConfig {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  return config;
}

/**
 * Get RPC URL for a network
 */
export function getRpcUrl(network: string, customRpcUrl?: string): string {
  if (network === 'custom' && customRpcUrl) {
    return customRpcUrl;
  }
  return getNetworkConfig(network).rpcUrl;
}

/**
 * Get WebSocket URL for a network
 */
export function getWsUrl(network: string, customWsUrl?: string): string {
  if (customWsUrl) {
    return customWsUrl;
  }
  if (network === 'custom') {
    throw new Error('WebSocket URL required for custom network');
  }
  return getNetworkConfig(network).wsUrl;
}

/**
 * Get Chain ID for a network
 */
export function getChainId(network: string, customChainId?: number): number {
  if (network === 'custom' && customChainId) {
    return customChainId;
  }
  return getNetworkConfig(network).chainId;
}

/**
 * Default block confirmations for different transaction types
 */
export const BLOCK_CONFIRMATIONS = {
  low: 1,
  medium: 3,
  high: 6,
  final: 12,
};

/**
 * Default gas settings
 */
export const GAS_SETTINGS = {
  defaultGasLimit: 21000,
  defaultGasLimitContract: 300000,
  maxGasLimit: 10000000,
  gasPriceMultiplier: 1.1,
};

/**
 * Polling intervals in milliseconds
 */
export const POLLING_INTERVALS = {
  block: 2000,
  transaction: 3000,
  event: 5000,
  balance: 10000,
};
