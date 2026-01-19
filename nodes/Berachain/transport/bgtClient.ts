/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Contract, formatUnits, parseUnits, TransactionResponse } from 'ethers';
import { BerachainClient } from './berachainClient';
import { BGT_ABI, BERACHEF_ABI, REWARD_VAULT_ABI } from '../constants/abis';
import { isValidAddress } from '../utils/addressUtils';
import { formatBgt, parseBgt } from '../utils/bgtUtils';

/**
 * BGT Client
 *
 * Client for interacting with Bera Governance Token (BGT) operations.
 * BGT is non-transferable and can only be earned through:
 * - Staking LP tokens in reward vaults
 * - Receiving emissions as a validator
 *
 * Key operations:
 * - Boosting validators (delegating BGT for block production)
 * - Managing boost queue
 * - Checking BGT balances and boosts
 * - Delegating voting power
 */

export interface BoostInfo {
  validator: string;
  amount: bigint;
  formattedAmount: string;
}

export interface QueuedBoost {
  validator: string;
  amount: bigint;
  formattedAmount: string;
  activationTimestamp: number;
  activationDate: Date;
  isReady: boolean;
}

export interface BgtBalances {
  total: bigint;
  unboosted: bigint;
  boosted: bigint;
  formattedTotal: string;
  formattedUnboosted: string;
  formattedBoosted: string;
}

export class BgtClient {
  private client: BerachainClient;
  private bgtContract: Contract;
  private berachefContract: Contract;

  constructor(client: BerachainClient) {
    this.client = client;
    const contracts = client.getContracts();
    const provider = client.getProvider();

    this.bgtContract = new Contract(contracts.bgt, BGT_ABI, provider);
    this.berachefContract = new Contract(contracts.berachef, BERACHEF_ABI, provider);
  }

  /**
   * Get BGT balance for an address
   */
  async getBalance(address: string): Promise<bigint> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return this.bgtContract.balanceOf(address);
  }

  /**
   * Get detailed BGT balances (total, unboosted, boosted)
   */
  async getBalances(address: string): Promise<BgtBalances> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    const [total, unboosted, boosted] = await Promise.all([
      this.bgtContract.balanceOf(address),
      this.bgtContract.unboostedBalanceOf(address),
      this.bgtContract.boostedBalanceOf(address),
    ]);

    return {
      total,
      unboosted,
      boosted,
      formattedTotal: formatBgt(total),
      formattedUnboosted: formatBgt(unboosted),
      formattedBoosted: formatBgt(boosted),
    };
  }

  /**
   * Get active boosts for an address
   */
  async getBoosts(address: string): Promise<BoostInfo[]> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    const result = await this.bgtContract.boosts(address);
    const validators = result[0] as string[];
    const amounts = result[1] as bigint[];

    return validators.map((validator, i) => ({
      validator,
      amount: amounts[i],
      formattedAmount: formatBgt(amounts[i]),
    }));
  }

  /**
   * Get queued boosts for an address
   */
  async getQueuedBoosts(address: string): Promise<QueuedBoost[]> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    const result = await this.bgtContract.queuedBoosts(address);
    const validators = result[0] as string[];
    const amounts = result[1] as bigint[];
    const timestamps = result[2] as number[];
    const currentTime = Math.floor(Date.now() / 1000);

    return validators.map((validator, i) => ({
      validator,
      amount: amounts[i],
      formattedAmount: formatBgt(amounts[i]),
      activationTimestamp: timestamps[i],
      activationDate: new Date(timestamps[i] * 1000),
      isReady: currentTime >= timestamps[i],
    }));
  }

  /**
   * Queue a boost to a validator
   */
  async queueBoost(
    validatorAddress: string,
    amount: string,
  ): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(validatorAddress)) {
      throw new Error(`Invalid validator address: ${validatorAddress}`);
    }

    const bgtWithSigner = this.bgtContract.connect(wallet) as Contract;
    return bgtWithSigner.queueBoost(validatorAddress, parseBgt(amount));
  }

  /**
   * Activate a queued boost
   */
  async activateBoost(validatorAddress: string): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(validatorAddress)) {
      throw new Error(`Invalid validator address: ${validatorAddress}`);
    }

    const bgtWithSigner = this.bgtContract.connect(wallet) as Contract;
    return bgtWithSigner.activateBoost(validatorAddress);
  }

  /**
   * Cancel a queued boost
   */
  async cancelBoost(
    validatorAddress: string,
    amount: string,
  ): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(validatorAddress)) {
      throw new Error(`Invalid validator address: ${validatorAddress}`);
    }

    const bgtWithSigner = this.bgtContract.connect(wallet) as Contract;
    return bgtWithSigner.cancelBoost(validatorAddress, parseBgt(amount));
  }

  /**
   * Drop (remove) an active boost
   */
  async dropBoost(
    validatorAddress: string,
    amount: string,
  ): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(validatorAddress)) {
      throw new Error(`Invalid validator address: ${validatorAddress}`);
    }

    const bgtWithSigner = this.bgtContract.connect(wallet) as Contract;
    return bgtWithSigner.dropBoost(validatorAddress, parseBgt(amount));
  }

  /**
   * Delegate voting power
   */
  async delegate(delegatee: string): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(delegatee)) {
      throw new Error(`Invalid delegatee address: ${delegatee}`);
    }

    const bgtWithSigner = this.bgtContract.connect(wallet) as Contract;
    return bgtWithSigner.delegate(delegatee);
  }

  /**
   * Get current delegate
   */
  async getDelegate(address: string): Promise<string> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return this.bgtContract.delegates(address);
  }

  /**
   * Get voting power
   */
  async getVotes(address: string): Promise<bigint> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return this.bgtContract.getVotes(address);
  }

  /**
   * Get past voting power at a specific block
   */
  async getPastVotes(address: string, blockNumber: number): Promise<bigint> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return this.bgtContract.getPastVotes(address, blockNumber);
  }

  /**
   * Get total BGT supply
   */
  async getTotalSupply(): Promise<bigint> {
    return this.bgtContract.totalSupply();
  }

  // ============================================
  // Berachef (Cutting Board) Operations
  // ============================================

  /**
   * Get active validators
   */
  async getActiveValidators(): Promise<string[]> {
    return this.berachefContract.getActiveValidators();
  }

  /**
   * Get validator's cutting board configuration
   */
  async getValidatorCuttingBoard(
    validatorAddress: string,
  ): Promise<{ vaults: string[]; weights: bigint[] }> {
    if (!isValidAddress(validatorAddress)) {
      throw new Error(`Invalid validator address: ${validatorAddress}`);
    }

    const result = await this.berachefContract.getValidatorCuttingBoard(validatorAddress);
    return {
      vaults: result[0],
      weights: result[1],
    };
  }

  /**
   * Get BGT per block emission
   */
  async getBgtPerBlock(): Promise<bigint> {
    return this.berachefContract.getBGTPerBlock();
  }

  /**
   * Get validator weight (share of total boosts)
   */
  async getValidatorWeight(validatorAddress: string): Promise<bigint> {
    if (!isValidAddress(validatorAddress)) {
      throw new Error(`Invalid validator address: ${validatorAddress}`);
    }
    return this.berachefContract.getValidatorWeight(validatorAddress);
  }

  // ============================================
  // Reward Vault Operations
  // ============================================

  /**
   * Get earned BGT from a reward vault
   */
  async getEarnedFromVault(
    vaultAddress: string,
    accountAddress: string,
  ): Promise<bigint> {
    if (!isValidAddress(vaultAddress) || !isValidAddress(accountAddress)) {
      throw new Error('Invalid address');
    }

    const vault = new Contract(vaultAddress, REWARD_VAULT_ABI, this.client.getProvider());
    return vault.earned(accountAddress);
  }

  /**
   * Claim BGT rewards from a vault
   */
  async claimVaultRewards(vaultAddress: string): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(vaultAddress)) {
      throw new Error(`Invalid vault address: ${vaultAddress}`);
    }

    const vault = new Contract(vaultAddress, REWARD_VAULT_ABI, wallet);
    return vault.getReward(wallet.address);
  }

  /**
   * Stake in a reward vault
   */
  async stakeInVault(
    vaultAddress: string,
    amount: string,
    tokenDecimals = 18,
  ): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(vaultAddress)) {
      throw new Error(`Invalid vault address: ${vaultAddress}`);
    }

    const vault = new Contract(vaultAddress, REWARD_VAULT_ABI, wallet);
    return vault.stake(parseUnits(amount, tokenDecimals));
  }

  /**
   * Unstake from a reward vault
   */
  async unstakeFromVault(
    vaultAddress: string,
    amount: string,
    tokenDecimals = 18,
  ): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(vaultAddress)) {
      throw new Error(`Invalid vault address: ${vaultAddress}`);
    }

    const vault = new Contract(vaultAddress, REWARD_VAULT_ABI, wallet);
    return vault.withdraw(parseUnits(amount, tokenDecimals));
  }

  /**
   * Get vault stake balance
   */
  async getVaultStake(
    vaultAddress: string,
    accountAddress: string,
  ): Promise<bigint> {
    if (!isValidAddress(vaultAddress) || !isValidAddress(accountAddress)) {
      throw new Error('Invalid address');
    }

    const vault = new Contract(vaultAddress, REWARD_VAULT_ABI, this.client.getProvider());
    return vault.balanceOf(accountAddress);
  }

  /**
   * Get vault total supply (total staked)
   */
  async getVaultTotalSupply(vaultAddress: string): Promise<bigint> {
    if (!isValidAddress(vaultAddress)) {
      throw new Error(`Invalid vault address: ${vaultAddress}`);
    }

    const vault = new Contract(vaultAddress, REWARD_VAULT_ABI, this.client.getProvider());
    return vault.totalSupply();
  }

  /**
   * Get vault reward rate
   */
  async getVaultRewardRate(vaultAddress: string): Promise<bigint> {
    if (!isValidAddress(vaultAddress)) {
      throw new Error(`Invalid vault address: ${vaultAddress}`);
    }

    const vault = new Contract(vaultAddress, REWARD_VAULT_ABI, this.client.getProvider());
    return vault.rewardRate();
  }

  /**
   * Get boost multiplier for account in vault
   */
  async getVaultBoostMultiplier(
    vaultAddress: string,
    accountAddress: string,
  ): Promise<bigint> {
    if (!isValidAddress(vaultAddress) || !isValidAddress(accountAddress)) {
      throw new Error('Invalid address');
    }

    const vault = new Contract(vaultAddress, REWARD_VAULT_ABI, this.client.getProvider());
    return vault.getBoostMultiplier(accountAddress);
  }
}

/**
 * Create a BgtClient instance
 */
export function createBgtClient(berachainClient: BerachainClient): BgtClient {
  return new BgtClient(berachainClient);
}
