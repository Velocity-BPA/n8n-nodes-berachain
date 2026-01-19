/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { formatUnits, parseUnits } from 'ethers';

/**
 * HONEY Utilities
 *
 * Helper functions for Berachain's native stablecoin operations.
 * HONEY is an overcollateralized stablecoin backed by various collateral types.
 */

/**
 * HONEY token decimals
 */
export const HONEY_DECIMALS = 18;

/**
 * Format HONEY amount for display
 */
export function formatHoney(amount: bigint | string, decimals = 2): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  return Number(formatUnits(value, HONEY_DECIMALS)).toFixed(decimals);
}

/**
 * Parse HONEY amount from human-readable string
 */
export function parseHoney(amount: string): bigint {
  return parseUnits(amount, HONEY_DECIMALS);
}

/**
 * Calculate mint output given collateral input
 */
export function calculateMintOutput(
  collateralAmount: bigint,
  collateralDecimals: number,
  mintRate: bigint, // Rate in 18 decimals (1e18 = 1:1)
): bigint {
  // Normalize collateral to 18 decimals
  const normalizedCollateral =
    collateralDecimals < 18
      ? collateralAmount * 10n ** BigInt(18 - collateralDecimals)
      : collateralAmount / 10n ** BigInt(collateralDecimals - 18);

  // Apply mint rate
  return (normalizedCollateral * mintRate) / 10n ** 18n;
}

/**
 * Calculate redeem output given HONEY input
 */
export function calculateRedeemOutput(
  honeyAmount: bigint,
  collateralDecimals: number,
  redeemRate: bigint, // Rate in 18 decimals
): bigint {
  // Calculate collateral output (18 decimals)
  const collateralOutput = (honeyAmount * redeemRate) / 10n ** 18n;

  // Adjust for collateral decimals
  if (collateralDecimals < 18) {
    return collateralOutput / 10n ** BigInt(18 - collateralDecimals);
  } else if (collateralDecimals > 18) {
    return collateralOutput * 10n ** BigInt(collateralDecimals - 18);
  }
  return collateralOutput;
}

/**
 * Calculate backing ratio (collateral value / HONEY supply)
 */
export function calculateBackingRatio(
  collateralValueUsd: number,
  honeySupply: bigint,
): number {
  const supplyFloat = Number(formatUnits(honeySupply, HONEY_DECIMALS));
  if (supplyFloat === 0) {
    return 0;
  }
  return (collateralValueUsd / supplyFloat) * 100;
}

/**
 * Check if HONEY is above peg
 */
export function isAbovePeg(honeyPrice: number, pegPrice = 1.0, threshold = 0.005): boolean {
  return honeyPrice > pegPrice + threshold;
}

/**
 * Check if HONEY is below peg
 */
export function isBelowPeg(honeyPrice: number, pegPrice = 1.0, threshold = 0.005): boolean {
  return honeyPrice < pegPrice - threshold;
}

/**
 * Calculate peg deviation percentage
 */
export function calculatePegDeviation(honeyPrice: number, pegPrice = 1.0): number {
  return ((honeyPrice - pegPrice) / pegPrice) * 100;
}

/**
 * Format mint/redeem rate for display
 */
export function formatRate(rate: bigint): string {
  const rateFloat = Number(formatUnits(rate, 18));
  return `${(rateFloat * 100).toFixed(4)}%`;
}

/**
 * Calculate slippage for mint/redeem
 */
export function calculateSlippage(
  expectedOutput: bigint,
  actualOutput: bigint,
): number {
  if (expectedOutput === 0n) {
    return 0;
  }
  const diff = Number(expectedOutput - actualOutput);
  const expected = Number(expectedOutput);
  return (diff / expected) * 100;
}

/**
 * Validate mint amount against minimum
 */
export function validateMintAmount(
  amount: bigint,
  minMint: bigint = parseHoney('0.01'),
): { valid: boolean; error?: string } {
  if (amount < minMint) {
    return {
      valid: false,
      error: `Minimum mint amount is ${formatHoney(minMint)} HONEY`,
    };
  }
  return { valid: true };
}

/**
 * Validate redeem amount against minimum and balance
 */
export function validateRedeemAmount(
  amount: bigint,
  balance: bigint,
  minRedeem: bigint = parseHoney('0.01'),
): { valid: boolean; error?: string } {
  if (amount < minRedeem) {
    return {
      valid: false,
      error: `Minimum redeem amount is ${formatHoney(minRedeem)} HONEY`,
    };
  }
  if (amount > balance) {
    return {
      valid: false,
      error: `Insufficient HONEY balance. Have ${formatHoney(balance)}, need ${formatHoney(amount)}`,
    };
  }
  return { valid: true };
}

/**
 * Collateral types supported for HONEY minting
 */
export const HONEY_COLLATERAL_TYPES = {
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    minCollateralRatio: 100, // 100% collateralization for stablecoins
  },
  USDT: {
    symbol: 'USDT',
    decimals: 6,
    minCollateralRatio: 100,
  },
  DAI: {
    symbol: 'DAI',
    decimals: 18,
    minCollateralRatio: 100,
  },
};

/**
 * Get collateral info by symbol
 */
export function getCollateralInfo(symbol: string): {
  symbol: string;
  decimals: number;
  minCollateralRatio: number;
} | undefined {
  return HONEY_COLLATERAL_TYPES[symbol.toUpperCase() as keyof typeof HONEY_COLLATERAL_TYPES];
}
