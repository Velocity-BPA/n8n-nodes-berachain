/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { formatUnits, parseUnits } from 'ethers';

/**
 * Proof of Liquidity Utilities
 *
 * Helper functions for Berachain's Proof of Liquidity consensus mechanism.
 *
 * PoL Overview:
 * 1. Users provide liquidity to BEX, Bend, Berps, etc.
 * 2. They stake LP tokens in Reward Vaults to earn BGT
 * 3. Users boost validators with their BGT
 * 4. Validators propose blocks and earn block rewards
 * 5. Validators distribute BGT rewards via their Cutting Board
 * 6. The cycle continues, creating aligned incentives
 */

/**
 * Calculate vault APY based on BGT emissions and TVL
 */
export function calculateVaultApy(
  bgtRewardsPerYear: bigint,
  bgtPrice: number,
  vaultTvl: number, // in USD
): number {
  if (vaultTvl === 0) {
    return 0;
  }

  const rewardsUsd = Number(formatUnits(bgtRewardsPerYear, 18)) * bgtPrice;
  return (rewardsUsd / vaultTvl) * 100;
}

/**
 * Calculate boost multiplier effect
 * Higher boost = higher reward multiplier
 */
export function calculateBoostMultiplier(
  userBoost: bigint,
  totalBoosts: bigint,
  baseMultiplier = 1.0,
  maxMultiplier = 2.5,
): number {
  if (totalBoosts === 0n || userBoost === 0n) {
    return baseMultiplier;
  }

  const boostRatio = Number(userBoost) / Number(totalBoosts);
  const multiplierRange = maxMultiplier - baseMultiplier;

  return Math.min(baseMultiplier + boostRatio * multiplierRange * 10, maxMultiplier);
}

/**
 * Calculate validator's share of BGT emissions
 */
export function calculateValidatorShare(
  validatorBoosts: bigint,
  totalBoosts: bigint,
): number {
  if (totalBoosts === 0n) {
    return 0;
  }
  return Number(validatorBoosts) / Number(totalBoosts);
}

/**
 * Calculate expected BGT earnings from staking
 */
export function calculateExpectedBgtEarnings(
  stakeAmount: bigint,
  vaultTotalStake: bigint,
  bgtPerBlock: bigint,
  vaultWeight: number, // Cutting board weight (basis points)
  blocksPerDay: number = 43200, // ~2 second blocks
): bigint {
  if (vaultTotalStake === 0n) {
    return 0n;
  }

  // User's share of vault
  const userShare = (stakeAmount * 10000n) / vaultTotalStake;

  // Vault's share of BGT emissions (based on cutting board weight)
  const vaultBgtPerBlock = (bgtPerBlock * BigInt(vaultWeight)) / 10000n;

  // User's daily BGT
  return (vaultBgtPerBlock * BigInt(blocksPerDay) * userShare) / 10000n;
}

/**
 * Calculate optimal boost allocation across validators
 */
export function calculateOptimalBoostAllocation(
  validators: Array<{
    address: string;
    totalBoosts: bigint;
    commission: number;
    cuttingBoardValue: number; // Value of vaults in cutting board
  }>,
  userBgt: bigint,
): Array<{ validator: string; amount: bigint; expectedReturn: number }> {
  // Simple greedy allocation - boost validators with best return potential
  const validatorScores = validators.map((v) => ({
    ...v,
    score:
      v.totalBoosts > 0n
        ? (v.cuttingBoardValue * (100 - v.commission)) / Number(formatUnits(v.totalBoosts, 18))
        : v.cuttingBoardValue * (100 - v.commission),
  }));

  // Sort by score (highest first)
  validatorScores.sort((a, b) => b.score - a.score);

  // Allocate proportionally to top validators
  const topValidators = validatorScores.slice(0, 5);
  const totalScore = topValidators.reduce((sum, v) => sum + v.score, 0);

  return topValidators.map((v) => ({
    validator: v.address,
    amount: (userBgt * BigInt(Math.floor((v.score / totalScore) * 10000))) / 10000n,
    expectedReturn: v.score,
  }));
}

/**
 * Calculate health of PoL ecosystem
 */
export function calculatePolHealth(
  totalBgtStaked: bigint,
  totalBgtSupply: bigint,
  activeValidators: number,
  minValidators: number = 10,
  targetStakeRatio: number = 0.5,
): { score: number; status: string; details: string[] } {
  const details: string[] = [];
  let score = 100;

  // Check validator count
  if (activeValidators < minValidators) {
    score -= 20;
    details.push(`Low validator count: ${activeValidators}/${minValidators}`);
  }

  // Check stake ratio
  const stakeRatio = Number(totalBgtStaked) / Number(totalBgtSupply);
  if (stakeRatio < targetStakeRatio * 0.5) {
    score -= 30;
    details.push(`Very low stake ratio: ${(stakeRatio * 100).toFixed(1)}%`);
  } else if (stakeRatio < targetStakeRatio) {
    score -= 10;
    details.push(`Below target stake ratio: ${(stakeRatio * 100).toFixed(1)}%`);
  }

  // Determine status
  let status: string;
  if (score >= 80) {
    status = 'healthy';
  } else if (score >= 50) {
    status = 'moderate';
  } else {
    status = 'concerning';
  }

  return { score, status, details };
}

/**
 * Calculate unbonding time remaining
 */
export function calculateUnbondingTime(
  startTimestamp: number,
  unbondingPeriod: number = 21 * 24 * 60 * 60, // 21 days default
): { remaining: number; completionDate: Date; progress: number } {
  const currentTime = Math.floor(Date.now() / 1000);
  const completionTime = startTimestamp + unbondingPeriod;
  const remaining = Math.max(0, completionTime - currentTime);
  const elapsed = currentTime - startTimestamp;
  const progress = Math.min(100, (elapsed / unbondingPeriod) * 100);

  return {
    remaining,
    completionDate: new Date(completionTime * 1000),
    progress,
  };
}

/**
 * Format stake amount with appropriate precision
 */
export function formatStakeAmount(amount: bigint, decimals = 18): string {
  const value = Number(formatUnits(amount, decimals));

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  if (value >= 1) {
    return value.toFixed(2);
  }
  return value.toFixed(6);
}

/**
 * Parse stake amount from human-readable string
 */
export function parseStakeAmount(amount: string, decimals = 18): bigint {
  // Handle K/M suffixes
  const normalized = amount
    .replace(/[kK]$/, '000')
    .replace(/[mM]$/, '000000');

  return parseUnits(normalized, decimals);
}

/**
 * Validate stake operation
 */
export function validateStakeOperation(
  amount: bigint,
  balance: bigint,
  vaultMinStake: bigint = parseUnits('0.001', 18),
): { valid: boolean; error?: string } {
  if (amount <= 0n) {
    return { valid: false, error: 'Stake amount must be greater than 0' };
  }

  if (amount < vaultMinStake) {
    return {
      valid: false,
      error: `Minimum stake is ${formatUnits(vaultMinStake, 18)}`,
    };
  }

  if (amount > balance) {
    return {
      valid: false,
      error: `Insufficient balance. Have ${formatUnits(balance, 18)}, need ${formatUnits(amount, 18)}`,
    };
  }

  return { valid: true };
}
