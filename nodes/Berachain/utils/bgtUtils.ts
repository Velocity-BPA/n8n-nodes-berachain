/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers, formatUnits, parseUnits } from 'ethers';
import { VALIDATOR_REQUIREMENTS, CUTTING_BOARD_CONFIG } from '../constants/validators';

/**
 * BGT Utilities
 *
 * Helper functions for Bera Governance Token operations.
 * BGT is the non-transferable governance token used for:
 * - Boosting validators
 * - Directing rewards via cutting board
 * - Governance voting
 */

/**
 * BGT token decimals
 */
export const BGT_DECIMALS = 18;

/**
 * Format BGT amount for display
 */
export function formatBgt(amount: bigint | string, decimals = 4): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  return Number(formatUnits(value, BGT_DECIMALS)).toFixed(decimals);
}

/**
 * Parse BGT amount from human-readable string
 */
export function parseBgt(amount: string): bigint {
  return parseUnits(amount, BGT_DECIMALS);
}

/**
 * Calculate boost APY estimate
 * Based on validator's share of total boosts and BGT emissions
 */
export function estimateBoostApy(
  validatorBoosts: bigint,
  totalBoosts: bigint,
  bgtPerBlock: bigint,
  blocksPerYear: number = 31536000 / 2, // ~2 second blocks
): number {
  if (totalBoosts === 0n || validatorBoosts === 0n) {
    return 0;
  }

  const validatorShare = Number(validatorBoosts) / Number(totalBoosts);
  const yearlyEmissions = Number(formatUnits(bgtPerBlock, BGT_DECIMALS)) * blocksPerYear;
  const validatorYearlyRewards = yearlyEmissions * validatorShare;

  // APY = (yearly rewards / boost amount) * 100
  return (validatorYearlyRewards / Number(formatUnits(validatorBoosts, BGT_DECIMALS))) * 100;
}

/**
 * Validate boost amount
 */
export function validateBoostAmount(amount: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const parsed = parseBgt(amount);
    const minBoost = parseUnits(VALIDATOR_REQUIREMENTS.minBoostAmount, BGT_DECIMALS);

    if (parsed < minBoost) {
      return {
        valid: false,
        error: `Boost amount must be at least ${VALIDATOR_REQUIREMENTS.minBoostAmount} BGT`,
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid boost amount format',
    };
  }
}

/**
 * Calculate unboosted balance from total and boosted
 */
export function calculateUnboostedBalance(
  totalBalance: bigint,
  boostedBalance: bigint,
): bigint {
  return totalBalance - boostedBalance;
}

/**
 * Format boost queue entry with time remaining
 */
export function formatBoostQueueEntry(
  validator: string,
  amount: bigint,
  timestamp: number,
  currentTime: number = Math.floor(Date.now() / 1000),
): {
  validator: string;
  amount: string;
  activationTime: Date;
  timeRemaining: number;
  isReady: boolean;
} {
  const activationTime = new Date(timestamp * 1000);
  const timeRemaining = Math.max(0, timestamp - currentTime);
  const isReady = timeRemaining === 0;

  return {
    validator,
    amount: formatBgt(amount),
    activationTime,
    timeRemaining,
    isReady,
  };
}

/**
 * Validate cutting board weights
 * Weights must sum to 10000 (100% in basis points)
 */
export function validateCuttingBoardWeights(weights: number[]): {
  valid: boolean;
  error?: string;
} {
  if (weights.length > CUTTING_BOARD_CONFIG.maxWeights) {
    return {
      valid: false,
      error: `Maximum ${CUTTING_BOARD_CONFIG.maxWeights} vaults allowed`,
    };
  }

  for (const weight of weights) {
    if (weight < CUTTING_BOARD_CONFIG.minWeight) {
      return {
        valid: false,
        error: `Weight must be at least ${CUTTING_BOARD_CONFIG.minWeight}`,
      };
    }
    if (weight > CUTTING_BOARD_CONFIG.maxWeight) {
      return {
        valid: false,
        error: `Weight cannot exceed ${CUTTING_BOARD_CONFIG.maxWeight}`,
      };
    }
  }

  const total = weights.reduce((a, b) => a + b, 0);
  if (total !== CUTTING_BOARD_CONFIG.maxWeight) {
    return {
      valid: false,
      error: `Weights must sum to ${CUTTING_BOARD_CONFIG.maxWeight} (got ${total})`,
    };
  }

  return { valid: true };
}

/**
 * Calculate expected BGT rewards for a validator
 */
export function calculateExpectedRewards(
  validatorBoosts: bigint,
  totalBoosts: bigint,
  bgtPerBlock: bigint,
  blocks: number,
): bigint {
  if (totalBoosts === 0n) {
    return 0n;
  }

  // validator_share = validator_boosts / total_boosts
  // rewards = bgt_per_block * blocks * validator_share
  return (bgtPerBlock * BigInt(blocks) * validatorBoosts) / totalBoosts;
}

/**
 * Format validator commission (basis points to percentage)
 */
export function formatCommission(commissionBps: number): string {
  return `${(commissionBps / 100).toFixed(2)}%`;
}

/**
 * Parse commission from percentage to basis points
 */
export function parseCommission(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Check if boost activation time has passed
 */
export function isBoostReady(activationTimestamp: number): boolean {
  return Math.floor(Date.now() / 1000) >= activationTimestamp;
}

/**
 * Get time until boost can be activated
 */
export function getTimeUntilBoostReady(activationTimestamp: number): number {
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, activationTimestamp - currentTime);
}
