/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';
import { ZERO_ADDRESS } from '../constants/tokens';

/**
 * Address Utilities
 *
 * Helper functions for validating and formatting Ethereum/Berachain addresses.
 */

/**
 * Validate an Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Get checksummed address
 */
export function getChecksumAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid address: ${address}`);
  }
  return ethers.getAddress(address);
}

/**
 * Compare two addresses (case-insensitive)
 */
export function compareAddresses(a: string, b: string): boolean {
  if (!isValidAddress(a) || !isValidAddress(b)) {
    return false;
  }
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Check if address is zero address
 */
export function isZeroAddress(address: string): boolean {
  return compareAddresses(address, ZERO_ADDRESS);
}

/**
 * Check if address is a contract (has code)
 */
export async function isContract(
  provider: ethers.Provider,
  address: string,
): Promise<boolean> {
  const code = await provider.getCode(address);
  return code !== '0x';
}

/**
 * Shorten address for display (0x1234...5678)
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!isValidAddress(address)) {
    return address;
  }
  const checksummed = getChecksumAddress(address);
  return `${checksummed.slice(0, chars + 2)}...${checksummed.slice(-chars)}`;
}

/**
 * Validate multiple addresses
 */
export function validateAddresses(addresses: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const address of addresses) {
    if (isValidAddress(address)) {
      valid.push(getChecksumAddress(address));
    } else {
      invalid.push(address);
    }
  }

  return { valid, invalid };
}

/**
 * Parse address from various formats
 */
export function parseAddress(input: string): string {
  // Remove whitespace
  const trimmed = input.trim();

  // Handle ENS names (would need provider to resolve)
  if (trimmed.endsWith('.eth')) {
    throw new Error('ENS names require provider resolution');
  }

  // Validate and return checksummed
  if (!isValidAddress(trimmed)) {
    throw new Error(`Invalid address format: ${trimmed}`);
  }

  return getChecksumAddress(trimmed);
}

/**
 * Create an address from a private key
 */
export function addressFromPrivateKey(privateKey: string): string {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  } catch (error) {
    throw new Error('Invalid private key');
  }
}

/**
 * Validate private key format
 */
export function isValidPrivateKey(privateKey: string): boolean {
  try {
    const key = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    // Private key should be 32 bytes (64 hex chars + 0x prefix)
    if (!/^0x[a-fA-F0-9]{64}$/.test(key)) {
      return false;
    }
    // Try to create a wallet to validate
    new ethers.Wallet(key);
    return true;
  } catch {
    return false;
  }
}
