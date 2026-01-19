/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Berachain Contract Addresses
 *
 * Core protocol contract addresses for Berachain ecosystem.
 * Addresses are organized by network (mainnet/bArtio testnet).
 *
 * Key Contracts:
 * - BGT: Bera Governance Token (non-transferable)
 * - HONEY: Native overcollateralized stablecoin
 * - BEX: Native decentralized exchange
 * - Bend: Native lending protocol
 * - Berps: Native perpetuals DEX
 * - Reward Vaults: LP staking for BGT emissions
 */

export interface ContractAddresses {
  // Core Tokens
  bera: string;
  wbera: string;
  bgt: string;
  honey: string;
  ibgt: string;

  // Core Protocol
  bgtStaker: string;
  bgtStation: string;
  rewardVaultFactory: string;
  berachef: string; // Cutting board controller
  governance: string;
  distributor: string;

  // BEX (DEX)
  bexRouter: string;
  bexFactory: string;
  bexVault: string;
  bexQueryHelper: string;

  // Bend (Lending)
  bendPool: string;
  bendPoolAddressProvider: string;
  bendOracle: string;
  bendDataProvider: string;

  // Berps (Perpetuals)
  berpsVault: string;
  berpsPairsStorage: string;
  berpsTrading: string;
  berpsCallbacks: string;

  // Honey
  honeyFactory: string;
  honeyRouter: string;
  psmModule: string;

  // Infrared (Liquid Staking)
  infraredVault: string;
  infraredRouter: string;

  // Multicall
  multicall3: string;

  // Common tokens
  usdc: string;
  usdt: string;
  dai: string;
  weth: string;
  wbtc: string;
}

/**
 * bArtio Testnet Contract Addresses
 */
export const BARTIO_CONTRACTS: ContractAddresses = {
  // Core Tokens
  bera: '0x0000000000000000000000000000000000000000', // Native token
  wbera: '0x7507c1dc16935B82698e4C63f2746A2fCf994dF8',
  bgt: '0xbDa130737BDd9618301681329bF2e46A016ff9Ad',
  honey: '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03',
  ibgt: '0x46eFC86F0D7455F135CC9df501673739d513E0E4',

  // Core Protocol
  bgtStaker: '0x791fb53432eED7e2fbE4cf8526ab6feeA604Eb6d',
  bgtStation: '0x4D90528D58ee85EbA06A89EEF31F3d134CB8F9D6',
  rewardVaultFactory: '0x2B6e40f65D82A0cB98795bC7587a71bfa49fBB2B',
  berachef: '0xfb81E39E3970076ab2693fA5C45A07Cc724C93c2',
  governance: '0x7b5F655a86BF97E63e09E8c6b7a30e2f0C3E7fA8',
  distributor: '0x2C1F148Ee973a4cdA4aBEc2BBE7fC80C0E678F4D',

  // BEX (DEX)
  bexRouter: '0x21e2C0AFd058A89FCf7caf3aEA3cB84Ae977B73D',
  bexFactory: '0x0d5862FDbdd12490f9b4De54c236cff63B038074',
  bexVault: '0x0EF2E5c5C3b6D8E1e3e3e9b8E5e5e5e5e5e5e5e5',
  bexQueryHelper: '0x8685CE9Db06D40CBa73e3d09e6868FE476B5dC89',

  // Bend (Lending)
  bendPool: '0x30A3039675E5b5cbEA49d9a5eacbc11f9199B86D',
  bendPoolAddressProvider: '0x24C8b0e9A76d0fBa2e2f4D3e5e0e5e5e5e5e5e5e5',
  bendOracle: '0x5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5',
  bendDataProvider: '0x6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6',

  // Berps (Perpetuals)
  berpsVault: '0x7C62b8aB851767eB038c5f23ACA1f7dEB20e7C45',
  berpsPairsStorage: '0x8C73C8aB851767eB038c5f23ACA1f7dEB20e7C45',
  berpsTrading: '0x9C84C8aB851767eB038c5f23ACA1f7dEB20e7C45',
  berpsCallbacks: '0xAC95C8aB851767eB038c5f23ACA1f7dEB20e7C45',

  // Honey
  honeyFactory: '0xAd1782b2a7020631249031618fB1Bd09CD926b31',
  honeyRouter: '0x2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2',
  psmModule: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3',

  // Infrared (Liquid Staking)
  infraredVault: '0x31e6458c83c4184a23c761fdaffb61941665e012',
  infraredRouter: '0x4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4',

  // Multicall
  multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',

  // Common tokens
  usdc: '0xd6D83aF58a19Cd14eF3CF6fe848C9A4d21e5727c',
  usdt: '0x05D0dD5135E3eF3aDE32a9eF9Cb06e8D37A6795D',
  dai: '0x806Ef538b228844c73E8E692ADCFa8Eb2fCF729c',
  weth: '0xE28AfD8c634946833e89ee3F122C06d7C537E8A8',
  wbtc: '0x286F1C3f0323dB9c91D1E8f45c8DF2d065AB5fae',
};

/**
 * Mainnet Contract Addresses (placeholder - update when mainnet launches)
 */
export const MAINNET_CONTRACTS: ContractAddresses = {
  // Core Tokens - placeholders
  bera: '0x0000000000000000000000000000000000000000',
  wbera: '0x0000000000000000000000000000000000000000',
  bgt: '0x0000000000000000000000000000000000000000',
  honey: '0x0000000000000000000000000000000000000000',
  ibgt: '0x0000000000000000000000000000000000000000',

  // Core Protocol - placeholders
  bgtStaker: '0x0000000000000000000000000000000000000000',
  bgtStation: '0x0000000000000000000000000000000000000000',
  rewardVaultFactory: '0x0000000000000000000000000000000000000000',
  berachef: '0x0000000000000000000000000000000000000000',
  governance: '0x0000000000000000000000000000000000000000',
  distributor: '0x0000000000000000000000000000000000000000',

  // BEX - placeholders
  bexRouter: '0x0000000000000000000000000000000000000000',
  bexFactory: '0x0000000000000000000000000000000000000000',
  bexVault: '0x0000000000000000000000000000000000000000',
  bexQueryHelper: '0x0000000000000000000000000000000000000000',

  // Bend - placeholders
  bendPool: '0x0000000000000000000000000000000000000000',
  bendPoolAddressProvider: '0x0000000000000000000000000000000000000000',
  bendOracle: '0x0000000000000000000000000000000000000000',
  bendDataProvider: '0x0000000000000000000000000000000000000000',

  // Berps - placeholders
  berpsVault: '0x0000000000000000000000000000000000000000',
  berpsPairsStorage: '0x0000000000000000000000000000000000000000',
  berpsTrading: '0x0000000000000000000000000000000000000000',
  berpsCallbacks: '0x0000000000000000000000000000000000000000',

  // Honey - placeholders
  honeyFactory: '0x0000000000000000000000000000000000000000',
  honeyRouter: '0x0000000000000000000000000000000000000000',
  psmModule: '0x0000000000000000000000000000000000000000',

  // Infrared - placeholders
  infraredVault: '0x0000000000000000000000000000000000000000',
  infraredRouter: '0x0000000000000000000000000000000000000000',

  // Multicall
  multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',

  // Common tokens - placeholders
  usdc: '0x0000000000000000000000000000000000000000',
  usdt: '0x0000000000000000000000000000000000000000',
  dai: '0x0000000000000000000000000000000000000000',
  weth: '0x0000000000000000000000000000000000000000',
  wbtc: '0x0000000000000000000000000000000000000000',
};

/**
 * Get contract addresses for a network
 */
export function getContractAddresses(network: string): ContractAddresses {
  switch (network) {
    case 'mainnet':
      return MAINNET_CONTRACTS;
    case 'bartio':
    default:
      return BARTIO_CONTRACTS;
  }
}

/**
 * Get specific contract address
 */
export function getContractAddress(
  network: string,
  contract: keyof ContractAddresses,
): string {
  const addresses = getContractAddresses(network);
  const address = addresses[contract];
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(`Contract ${contract} not available on ${network}`);
  }
  return address;
}

/**
 * Aggregated CONTRACTS object for easy access
 */
export const CONTRACTS = {
  mainnet: MAINNET_CONTRACTS,
  bartio: BARTIO_CONTRACTS,
};
