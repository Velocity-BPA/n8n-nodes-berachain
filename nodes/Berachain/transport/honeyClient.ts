/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Contract, formatUnits, parseUnits, TransactionResponse } from 'ethers';
import { BerachainClient } from './berachainClient';
import { HONEY_ABI, ERC20_ABI } from '../constants/abis';
import { isValidAddress } from '../utils/addressUtils';
import { formatHoney, parseHoney, calculateMintOutput, calculateRedeemOutput } from '../utils/honeyUtils';

/**
 * HONEY Client
 *
 * Client for interacting with Berachain's native stablecoin HONEY.
 * HONEY is an overcollateralized stablecoin backed by approved collateral types.
 *
 * Key operations:
 * - Mint HONEY by depositing collateral
 * - Redeem collateral by burning HONEY
 * - Check mint/redeem rates
 * - Query collateral basket
 */

export interface HoneyStats {
  totalSupply: bigint;
  formattedSupply: string;
  collaterals: {
    token: string;
    amount: bigint;
    formattedAmount: string;
  }[];
}

export interface MintPreview {
  collateralAmount: string;
  honeyOutput: bigint;
  formattedOutput: string;
  rate: bigint;
  formattedRate: string;
}

export interface RedeemPreview {
  honeyAmount: string;
  collateralOutput: bigint;
  formattedOutput: string;
  rate: bigint;
  formattedRate: string;
}

export class HoneyClient {
  private client: BerachainClient;
  private honeyContract: Contract;
  private honeyAddress: string;

  constructor(client: BerachainClient) {
    this.client = client;
    const contracts = client.getContracts();
    const provider = client.getProvider();

    this.honeyAddress = contracts.honey;
    this.honeyContract = new Contract(contracts.honey, HONEY_ABI, provider);
  }

  /**
   * Get HONEY balance for an address
   */
  async getBalance(address: string): Promise<bigint> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return this.honeyContract.balanceOf(address);
  }

  /**
   * Get formatted HONEY balance
   */
  async getFormattedBalance(address: string): Promise<string> {
    const balance = await this.getBalance(address);
    return formatHoney(balance);
  }

  /**
   * Get total HONEY supply
   */
  async getTotalSupply(): Promise<bigint> {
    return this.honeyContract.totalSupply();
  }

  /**
   * Get HONEY stats
   */
  async getStats(): Promise<HoneyStats> {
    const [totalSupply, basket] = await Promise.all([
      this.getTotalSupply(),
      this.getCollateralBasket(),
    ]);

    return {
      totalSupply,
      formattedSupply: formatHoney(totalSupply),
      collaterals: basket,
    };
  }

  /**
   * Get collateral basket
   */
  async getCollateralBasket(): Promise<
    { token: string; amount: bigint; formattedAmount: string }[]
  > {
    const result = await this.honeyContract.basket();
    const collaterals = result[0] as string[];
    const amounts = result[1] as bigint[];

    // Get decimals for each collateral to format correctly
    const provider = this.client.getProvider();
    const formatted = await Promise.all(
      collaterals.map(async (token, i) => {
        let decimals = 18;
        try {
          const tokenContract = new Contract(token, ERC20_ABI, provider);
          decimals = Number(await tokenContract.decimals());
        } catch {
          // Use default 18 decimals
        }
        return {
          token,
          amount: amounts[i],
          formattedAmount: formatUnits(amounts[i], decimals),
        };
      }),
    );

    return formatted;
  }

  /**
   * Get mint rate for a collateral token
   */
  async getMintRate(collateralToken: string): Promise<bigint> {
    if (!isValidAddress(collateralToken)) {
      throw new Error(`Invalid collateral token address: ${collateralToken}`);
    }
    return this.honeyContract.getMintRate(collateralToken);
  }

  /**
   * Get redeem rate for a collateral token
   */
  async getRedeemRate(collateralToken: string): Promise<bigint> {
    if (!isValidAddress(collateralToken)) {
      throw new Error(`Invalid collateral token address: ${collateralToken}`);
    }
    return this.honeyContract.getRedeemRate(collateralToken);
  }

  /**
   * Preview mint output
   */
  async previewMint(
    collateralToken: string,
    collateralAmount: string,
    collateralDecimals = 18,
  ): Promise<MintPreview> {
    if (!isValidAddress(collateralToken)) {
      throw new Error(`Invalid collateral token address: ${collateralToken}`);
    }

    const amountWei = parseUnits(collateralAmount, collateralDecimals);
    const [honeyOutput, rate] = await Promise.all([
      this.honeyContract.previewMint(collateralToken, amountWei),
      this.getMintRate(collateralToken),
    ]);

    return {
      collateralAmount,
      honeyOutput,
      formattedOutput: formatHoney(honeyOutput),
      rate,
      formattedRate: `${Number(formatUnits(rate, 18)).toFixed(4)}`,
    };
  }

  /**
   * Preview redeem output
   */
  async previewRedeem(
    collateralToken: string,
    honeyAmount: string,
    collateralDecimals = 18,
  ): Promise<RedeemPreview> {
    if (!isValidAddress(collateralToken)) {
      throw new Error(`Invalid collateral token address: ${collateralToken}`);
    }

    const amountWei = parseHoney(honeyAmount);
    const [collateralOutput, rate] = await Promise.all([
      this.honeyContract.previewRedeem(collateralToken, amountWei),
      this.getRedeemRate(collateralToken),
    ]);

    return {
      honeyAmount,
      collateralOutput,
      formattedOutput: formatUnits(collateralOutput, collateralDecimals),
      rate,
      formattedRate: `${Number(formatUnits(rate, 18)).toFixed(4)}`,
    };
  }

  /**
   * Mint HONEY by depositing collateral
   */
  async mint(
    collateralToken: string,
    collateralAmount: string,
    collateralDecimals = 18,
    receiver?: string,
  ): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(collateralToken)) {
      throw new Error(`Invalid collateral token address: ${collateralToken}`);
    }

    const receiverAddress = receiver || wallet.address;
    if (!isValidAddress(receiverAddress)) {
      throw new Error(`Invalid receiver address: ${receiverAddress}`);
    }

    // First, check and approve collateral if needed
    const collateralContract = new Contract(collateralToken, ERC20_ABI, wallet);
    const amountWei = parseUnits(collateralAmount, collateralDecimals);
    const allowance = await collateralContract.allowance(wallet.address, this.honeyAddress);

    if (allowance < amountWei) {
      // Approve the honey factory to spend collateral
      const approveTx = await collateralContract.approve(this.honeyAddress, amountWei);
      await approveTx.wait();
    }

    // Mint HONEY
    const honeyWithSigner = this.honeyContract.connect(wallet) as Contract;
    return honeyWithSigner.mint(collateralToken, amountWei, receiverAddress);
  }

  /**
   * Redeem collateral by burning HONEY
   */
  async redeem(
    collateralToken: string,
    honeyAmount: string,
    receiver?: string,
  ): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(collateralToken)) {
      throw new Error(`Invalid collateral token address: ${collateralToken}`);
    }

    const receiverAddress = receiver || wallet.address;
    if (!isValidAddress(receiverAddress)) {
      throw new Error(`Invalid receiver address: ${receiverAddress}`);
    }

    const amountWei = parseHoney(honeyAmount);

    const honeyWithSigner = this.honeyContract.connect(wallet) as Contract;
    return honeyWithSigner.redeem(collateralToken, amountWei, receiverAddress);
  }

  /**
   * Transfer HONEY to another address
   */
  async transfer(to: string, amount: string): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(to)) {
      throw new Error(`Invalid recipient address: ${to}`);
    }

    const honeyWithSigner = this.honeyContract.connect(wallet) as Contract;
    return honeyWithSigner.transfer(to, parseHoney(amount));
  }

  /**
   * Approve HONEY spending
   */
  async approve(spender: string, amount: string): Promise<TransactionResponse> {
    const wallet = this.client.getWallet();
    if (!wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(spender)) {
      throw new Error(`Invalid spender address: ${spender}`);
    }

    const honeyWithSigner = this.honeyContract.connect(wallet) as Contract;
    return honeyWithSigner.approve(spender, parseHoney(amount));
  }

  /**
   * Get HONEY allowance
   */
  async getAllowance(owner: string, spender: string): Promise<bigint> {
    if (!isValidAddress(owner) || !isValidAddress(spender)) {
      throw new Error('Invalid address');
    }
    return this.honeyContract.allowance(owner, spender);
  }
}

/**
 * Create a HoneyClient instance
 */
export function createHoneyClient(berachainClient: BerachainClient): HoneyClient {
  return new HoneyClient(berachainClient);
}
