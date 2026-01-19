/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  ethers,
  JsonRpcProvider,
  Wallet,
  Contract,
  formatUnits,
  parseUnits,
  formatEther,
  parseEther,
  TransactionRequest,
  TransactionResponse,
  TransactionReceipt,
  Block,
  Log,
} from 'ethers';
import { getNetworkConfig, getRpcUrl, getChainId } from '../constants/networks';
import { getContractAddresses, ContractAddresses } from '../constants/contracts';
import { ERC20_ABI, ERC721_ABI, WBERA_ABI } from '../constants/abis';
import { isValidAddress, getChecksumAddress } from '../utils/addressUtils';

/**
 * Berachain Client
 *
 * Core client for interacting with Berachain blockchain.
 * Provides methods for:
 * - Account queries (balances, transactions)
 * - Transaction sending and management
 * - BERA/WBERA operations
 * - Contract interactions
 * - Block and event queries
 */

export interface BerachainClientConfig {
  network: string;
  rpcUrl?: string;
  wsUrl?: string;
  privateKey?: string;
  chainId?: number;
}

export interface TransactionOptions {
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  value?: bigint;
}

export class BerachainClient {
  private provider: JsonRpcProvider;
  private wallet: Wallet | null = null;
  private network: string;
  private chainId: number;
  private contracts: ContractAddresses;

  constructor(config: BerachainClientConfig) {
    this.network = config.network;
    const rpcUrl = getRpcUrl(config.network, config.rpcUrl);
    this.chainId = getChainId(config.network, config.chainId);

    this.provider = new JsonRpcProvider(rpcUrl, {
      chainId: this.chainId,
      name: config.network,
    });

    if (config.privateKey) {
      const key = config.privateKey.startsWith('0x')
        ? config.privateKey
        : `0x${config.privateKey}`;
      this.wallet = new Wallet(key, this.provider);
    }

    this.contracts = getContractAddresses(config.network);
  }

  /**
   * Get the provider instance
   */
  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get the wallet instance (if available)
   */
  getWallet(): Wallet | null {
    return this.wallet;
  }

  /**
   * Get the wallet address
   */
  getAddress(): string {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }
    return this.wallet.address;
  }

  /**
   * Check if wallet is configured
   */
  hasWallet(): boolean {
    return this.wallet !== null;
  }

  /**
   * Get contract addresses
   */
  getContracts(): ContractAddresses {
    return this.contracts;
  }

  // ============================================
  // Account Operations
  // ============================================

  /**
   * Get BERA balance
   */
  async getBalance(address: string): Promise<bigint> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return this.provider.getBalance(address);
  }

  /**
   * Get formatted BERA balance
   */
  async getFormattedBalance(address: string, decimals = 4): Promise<string> {
    const balance = await this.getBalance(address);
    return Number(formatEther(balance)).toFixed(decimals);
  }

  /**
   * Get token balance (ERC20)
   */
  async getTokenBalance(tokenAddress: string, accountAddress: string): Promise<bigint> {
    if (!isValidAddress(tokenAddress) || !isValidAddress(accountAddress)) {
      throw new Error('Invalid address');
    }
    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    return contract.balanceOf(accountAddress);
  }

  /**
   * Get transaction count (nonce)
   */
  async getTransactionCount(address: string): Promise<number> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return this.provider.getTransactionCount(address);
  }

  /**
   * Get account info
   */
  async getAccountInfo(address: string): Promise<{
    address: string;
    balance: string;
    balanceWei: string;
    transactionCount: number;
    isContract: boolean;
  }> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }

    const [balance, txCount, code] = await Promise.all([
      this.getBalance(address),
      this.getTransactionCount(address),
      this.provider.getCode(address),
    ]);

    return {
      address: getChecksumAddress(address),
      balance: formatEther(balance),
      balanceWei: balance.toString(),
      transactionCount: txCount,
      isContract: code !== '0x',
    };
  }

  // ============================================
  // Transaction Operations
  // ============================================

  /**
   * Send BERA
   */
  async sendBera(
    to: string,
    amount: string,
    options?: TransactionOptions,
  ): Promise<TransactionResponse> {
    if (!this.wallet) {
      throw new Error('No wallet configured for sending transactions');
    }
    if (!isValidAddress(to)) {
      throw new Error(`Invalid recipient address: ${to}`);
    }

    const tx: TransactionRequest = {
      to,
      value: parseEther(amount),
      ...options,
    };

    return this.wallet.sendTransaction(tx);
  }

  /**
   * Send transaction
   */
  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    if (!this.wallet) {
      throw new Error('No wallet configured for sending transactions');
    }
    return this.wallet.sendTransaction(tx);
  }

  /**
   * Sign transaction (without sending)
   */
  async signTransaction(tx: TransactionRequest): Promise<string> {
    if (!this.wallet) {
      throw new Error('No wallet configured for signing transactions');
    }
    return this.wallet.signTransaction(tx);
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(txHash: string): Promise<TransactionResponse | null> {
    return this.provider.getTransaction(txHash);
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
    return this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    txHash: string,
    confirmations = 1,
    timeout = 60000,
  ): Promise<TransactionReceipt | null> {
    return this.provider.waitForTransaction(txHash, confirmations, timeout);
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(tx: TransactionRequest): Promise<bigint> {
    return this.provider.estimateGas(tx);
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice ?? 0n;
  }

  /**
   * Get fee data (EIP-1559)
   */
  async getFeeData(): Promise<{
    gasPrice: bigint | null;
    maxFeePerGas: bigint | null;
    maxPriorityFeePerGas: bigint | null;
  }> {
    return this.provider.getFeeData();
  }

  // ============================================
  // BERA/WBERA Operations
  // ============================================

  /**
   * Wrap BERA to WBERA
   */
  async wrapBera(amount: string): Promise<TransactionResponse> {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }

    const wbera = new Contract(this.contracts.wbera, WBERA_ABI, this.wallet);
    return wbera.deposit({ value: parseEther(amount) });
  }

  /**
   * Unwrap WBERA to BERA
   */
  async unwrapBera(amount: string): Promise<TransactionResponse> {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }

    const wbera = new Contract(this.contracts.wbera, WBERA_ABI, this.wallet);
    return wbera.withdraw(parseEther(amount));
  }

  /**
   * Get WBERA balance
   */
  async getWberaBalance(address: string): Promise<bigint> {
    return this.getTokenBalance(this.contracts.wbera, address);
  }

  // ============================================
  // Token Operations (ERC20)
  // ============================================

  /**
   * Get token info
   */
  async getTokenInfo(tokenAddress: string): Promise<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    if (!isValidAddress(tokenAddress)) {
      throw new Error(`Invalid token address: ${tokenAddress}`);
    }

    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    return {
      address: getChecksumAddress(tokenAddress),
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: formatUnits(totalSupply, decimals),
    };
  }

  /**
   * Transfer tokens
   */
  async transferToken(
    tokenAddress: string,
    to: string,
    amount: string,
    decimals = 18,
  ): Promise<TransactionResponse> {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(tokenAddress) || !isValidAddress(to)) {
      throw new Error('Invalid address');
    }

    const contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
    return contract.transfer(to, parseUnits(amount, decimals));
  }

  /**
   * Approve token spending
   */
  async approveToken(
    tokenAddress: string,
    spender: string,
    amount: string,
    decimals = 18,
  ): Promise<TransactionResponse> {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(tokenAddress) || !isValidAddress(spender)) {
      throw new Error('Invalid address');
    }

    const contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
    return contract.approve(spender, parseUnits(amount, decimals));
  }

  /**
   * Get token allowance
   */
  async getTokenAllowance(
    tokenAddress: string,
    owner: string,
    spender: string,
  ): Promise<bigint> {
    if (!isValidAddress(tokenAddress) || !isValidAddress(owner) || !isValidAddress(spender)) {
      throw new Error('Invalid address');
    }

    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    return contract.allowance(owner, spender);
  }

  // ============================================
  // Block Operations
  // ============================================

  /**
   * Get latest block number
   */
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * Get block by number
   */
  async getBlock(blockNumber: number | string): Promise<Block | null> {
    return this.provider.getBlock(blockNumber);
  }

  /**
   * Get block with transactions
   */
  async getBlockWithTransactions(
    blockNumber: number | string,
  ): Promise<Block | null> {
    return this.provider.getBlock(blockNumber, true);
  }

  // ============================================
  // Event/Log Operations
  // ============================================

  /**
   * Get logs
   */
  async getLogs(filter: {
    address?: string | string[];
    topics?: (string | string[] | null)[];
    fromBlock?: number | string;
    toBlock?: number | string;
  }): Promise<Log[]> {
    return this.provider.getLogs(filter);
  }

  /**
   * Get logs for contract
   */
  async getContractLogs(
    contractAddress: string,
    fromBlock: number,
    toBlock?: number,
  ): Promise<Log[]> {
    return this.getLogs({
      address: contractAddress,
      fromBlock,
      toBlock: toBlock ?? 'latest',
    });
  }

  // ============================================
  // Contract Operations
  // ============================================

  /**
   * Call contract method (read)
   */
  async callContract(
    contractAddress: string,
    abi: string[],
    method: string,
    params: unknown[] = [],
  ): Promise<unknown> {
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    const contract = new Contract(contractAddress, abi, this.provider);
    return contract[method](...params);
  }

  /**
   * Execute contract method (write)
   */
  async executeContract(
    contractAddress: string,
    abi: string[],
    method: string,
    params: unknown[] = [],
    options?: TransactionOptions,
  ): Promise<TransactionResponse> {
    if (!this.wallet) {
      throw new Error('No wallet configured');
    }
    if (!isValidAddress(contractAddress)) {
      throw new Error(`Invalid contract address: ${contractAddress}`);
    }

    const contract = new Contract(contractAddress, abi, this.wallet);
    return contract[method](...params, options ?? {});
  }

  /**
   * Get contract code
   */
  async getContractCode(address: string): Promise<string> {
    if (!isValidAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    return this.provider.getCode(address);
  }

  /**
   * Check if address is a contract
   */
  async isContract(address: string): Promise<boolean> {
    const code = await this.getContractCode(address);
    return code !== '0x';
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get chain ID
   */
  async getChainId(): Promise<bigint> {
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  /**
   * Get network info
   */
  async getNetworkInfo(): Promise<{
    name: string;
    chainId: number;
    isTestnet: boolean;
    blockNumber: number;
  }> {
    const [network, blockNumber] = await Promise.all([
      this.provider.getNetwork(),
      this.provider.getBlockNumber(),
    ]);

    const config = getNetworkConfig(this.network);

    return {
      name: config.name,
      chainId: Number(network.chainId),
      isTestnet: config.isTestnet,
      blockNumber,
    };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.provider.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get network name
   */
  getNetwork(): string {
    return this.network;
  }

  /**
   * Get chain ID (sync)
   */
  getChainIdSync(): number {
    return this.chainId;
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.provider.destroy();
  }
}

/**
 * Create a BerachainClient instance
 */
export function createBerachainClient(config: BerachainClientConfig): BerachainClient {
  return new BerachainClient(config);
}
