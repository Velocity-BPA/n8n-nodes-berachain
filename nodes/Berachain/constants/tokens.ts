/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Berachain Token Definitions
 *
 * Token metadata and configuration for common tokens on Berachain.
 */

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean;
  coingeckoId?: string;
}

/**
 * Native BERA token (gas token)
 */
export const NATIVE_BERA: TokenInfo = {
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'BERA',
  name: 'BERA',
  decimals: 18,
  isNative: true,
};

/**
 * Core protocol tokens on bArtio
 */
export const BARTIO_TOKENS: Record<string, TokenInfo> = {
  BERA: NATIVE_BERA,
  WBERA: {
    address: '0x7507c1dc16935B82698e4C63f2746A2fCf994dF8',
    symbol: 'WBERA',
    name: 'Wrapped BERA',
    decimals: 18,
  },
  BGT: {
    address: '0xbDa130737BDd9618301681329bF2e46A016ff9Ad',
    symbol: 'BGT',
    name: 'Bera Governance Token',
    decimals: 18,
  },
  HONEY: {
    address: '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03',
    symbol: 'HONEY',
    name: 'Honey',
    decimals: 18,
  },
  iBGT: {
    address: '0x46eFC86F0D7455F135CC9df501673739d513E0E4',
    symbol: 'iBGT',
    name: 'Infrared BGT',
    decimals: 18,
  },
  USDC: {
    address: '0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    coingeckoId: 'usd-coin',
  },
  USDT: {
    address: '0x05D0dD5135E3eF3aDE32a9eF9Cb06e8D37A6795D',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    coingeckoId: 'tether',
  },
  DAI: {
    address: '0x806Ef538b228844c73E8E692ADCFa8Eb2fCF729c',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    coingeckoId: 'dai',
  },
  WETH: {
    address: '0xE28AfD8c634946833e89ee3F122C06d7C537E8A8',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    coingeckoId: 'weth',
  },
  WBTC: {
    address: '0x286F1C3f0323dB9c91D1E8f45c8DF2d065AB5fae',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    coingeckoId: 'wrapped-bitcoin',
  },
};

/**
 * Get tokens for a network
 */
export function getNetworkTokens(network: string): Record<string, TokenInfo> {
  switch (network) {
    case 'mainnet':
      // Return mainnet tokens when available
      return BARTIO_TOKENS; // Placeholder
    case 'bartio':
    default:
      return BARTIO_TOKENS;
  }
}

/**
 * Get token info by symbol
 */
export function getTokenBySymbol(network: string, symbol: string): TokenInfo | undefined {
  const tokens = getNetworkTokens(network);
  return tokens[symbol.toUpperCase()];
}

/**
 * Get token info by address
 */
export function getTokenByAddress(network: string, address: string): TokenInfo | undefined {
  const tokens = getNetworkTokens(network);
  const normalizedAddress = address.toLowerCase();
  return Object.values(tokens).find(
    (token) => token.address.toLowerCase() === normalizedAddress,
  );
}

/**
 * Common decimal values
 */
export const TOKEN_DECIMALS = {
  BERA: 18,
  BGT: 18,
  HONEY: 18,
  USDC: 6,
  USDT: 6,
  DAI: 18,
  WETH: 18,
  WBTC: 8,
};

/**
 * Zero address constant
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Max uint256 for approvals
 */
export const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
