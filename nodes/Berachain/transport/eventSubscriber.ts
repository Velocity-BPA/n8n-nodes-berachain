/**
 * Event Subscriber Client for Berachain
 * Handles WebSocket subscriptions for real-time blockchain events
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import { ABIS } from '../constants/abis';
import { getContractAddress } from '../constants/contracts';
import { getNetworkConfig } from '../constants/networks';

export type EventType =
	| 'block'
	| 'transaction'
	| 'transfer'
	| 'bgtClaimed'
	| 'bgtDelegated'
	| 'boostQueued'
	| 'boostActivated'
	| 'boostDropped'
	| 'honeyMinted'
	| 'honeyRedeemed'
	| 'validatorRegistered'
	| 'cuttingBoardUpdated'
	| 'rewardsDistributed'
	| 'vaultStaked'
	| 'vaultUnstaked'
	| 'vaultRewardsClaimed'
	| 'swap'
	| 'liquidityAdded'
	| 'liquidityRemoved'
	| 'bendSupply'
	| 'bendBorrow'
	| 'bendRepay'
	| 'bendLiquidation'
	| 'positionOpened'
	| 'positionClosed'
	| 'positionLiquidated'
	| 'proposalCreated'
	| 'voteCast';

export interface EventFilter {
	type: EventType;
	address?: string;
	fromAddress?: string;
	toAddress?: string;
	minAmount?: string;
	pairIndex?: number;
	validatorAddress?: string;
	vaultAddress?: string;
}

export interface BlockEvent {
	type: 'block';
	blockNumber: number;
	blockHash: string;
	timestamp: number;
	proposer?: string;
	transactionCount: number;
}

export interface TransactionEvent {
	type: 'transaction';
	hash: string;
	from: string;
	to: string;
	value: string;
	blockNumber: number;
	status: 'pending' | 'confirmed' | 'failed';
}

export interface TransferEvent {
	type: 'transfer';
	token: string;
	from: string;
	to: string;
	amount: string;
	transactionHash: string;
	blockNumber: number;
}

export interface BGTEvent {
	type: 'bgtClaimed' | 'bgtDelegated' | 'boostQueued' | 'boostActivated' | 'boostDropped';
	account: string;
	amount?: string;
	validator?: string;
	transactionHash: string;
	blockNumber: number;
}

export interface HONEYEvent {
	type: 'honeyMinted' | 'honeyRedeemed';
	account: string;
	amount: string;
	collateral?: string;
	collateralAmount?: string;
	transactionHash: string;
	blockNumber: number;
}

export interface ValidatorEvent {
	type: 'validatorRegistered' | 'cuttingBoardUpdated' | 'rewardsDistributed';
	validator: string;
	data?: Record<string, unknown>;
	transactionHash: string;
	blockNumber: number;
}

export interface VaultEvent {
	type: 'vaultStaked' | 'vaultUnstaked' | 'vaultRewardsClaimed';
	vault: string;
	account: string;
	amount: string;
	transactionHash: string;
	blockNumber: number;
}

export interface DEXEvent {
	type: 'swap' | 'liquidityAdded' | 'liquidityRemoved';
	pool: string;
	account: string;
	tokenIn?: string;
	tokenOut?: string;
	amountIn?: string;
	amountOut?: string;
	transactionHash: string;
	blockNumber: number;
}

export interface LendingEvent {
	type: 'bendSupply' | 'bendBorrow' | 'bendRepay' | 'bendLiquidation';
	asset: string;
	account: string;
	amount: string;
	transactionHash: string;
	blockNumber: number;
}

export interface PerpsEvent {
	type: 'positionOpened' | 'positionClosed' | 'positionLiquidated';
	account: string;
	pairIndex: number;
	positionIndex: number;
	size?: string;
	price?: string;
	pnl?: string;
	transactionHash: string;
	blockNumber: number;
}

export interface GovernanceEvent {
	type: 'proposalCreated' | 'voteCast';
	proposalId: string;
	account?: string;
	support?: boolean;
	votes?: string;
	transactionHash: string;
	blockNumber: number;
}

export type BerachainEvent =
	| BlockEvent
	| TransactionEvent
	| TransferEvent
	| BGTEvent
	| HONEYEvent
	| ValidatorEvent
	| VaultEvent
	| DEXEvent
	| LendingEvent
	| PerpsEvent
	| GovernanceEvent;

export class EventSubscriber extends EventEmitter {
	private provider: ethers.WebSocketProvider | null = null;
	private network: string;
	private wsUrl: string;
	private subscriptions: Map<string, { filter: EventFilter; listener: ethers.Listener }> =
		new Map();
	private isConnected: boolean = false;
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectDelay: number = 1000;

	constructor(network: string, wsUrl?: string) {
		super();
		this.network = network;
		const networkConfig = getNetworkConfig(network);
		this.wsUrl = wsUrl || networkConfig.wsUrl;
	}

	/**
	 * Connect to WebSocket provider
	 */
	async connect(): Promise<void> {
		try {
			this.provider = new ethers.WebSocketProvider(this.wsUrl);

			// Wait for connection
			await this.provider.ready;
			this.isConnected = true;
			this.reconnectAttempts = 0;

			// Set up disconnect handler using provider's network events
			this.provider.on('error', (error: Error) => {
				this.emit('error', error);
			});

			// Check for disconnect periodically
			const checkConnection = async () => {
				try {
					await this.provider?.getNetwork();
				} catch {
					this.handleDisconnect();
				}
			};
			setInterval(checkConnection, 30000);

			this.emit('connected');
		} catch (error) {
			this.emit('error', error);
			await this.attemptReconnect();
		}
	}

	/**
	 * Disconnect from WebSocket
	 */
	async disconnect(): Promise<void> {
		if (this.provider) {
			// Remove all subscriptions
			for (const [id] of this.subscriptions) {
				await this.unsubscribe(id);
			}

			await this.provider.destroy();
			this.provider = null;
			this.isConnected = false;
			this.emit('disconnected');
		}
	}

	/**
	 * Subscribe to new blocks
	 */
	async subscribeToBlocks(callback: (event: BlockEvent) => void): Promise<string> {
		if (!this.provider) {
			throw new Error('Not connected');
		}

		const subscriptionId = `blocks-${Date.now()}`;

		const listener = async (blockNumber: number) => {
			try {
				const block = await this.provider!.getBlock(blockNumber);
				if (block) {
					const event: BlockEvent = {
						type: 'block',
						blockNumber: block.number,
						blockHash: block.hash!,
						timestamp: block.timestamp,
						proposer: block.miner,
						transactionCount: block.transactions.length,
					};
					callback(event);
				}
			} catch (error) {
				this.emit('error', error);
			}
		};

		this.provider.on('block', listener);
		this.subscriptions.set(subscriptionId, {
			filter: { type: 'block' },
			listener,
		});

		return subscriptionId;
	}

	/**
	 * Subscribe to pending transactions
	 */
	async subscribeToPendingTransactions(
		callback: (event: TransactionEvent) => void,
		filter?: { from?: string; to?: string },
	): Promise<string> {
		if (!this.provider) {
			throw new Error('Not connected');
		}

		const subscriptionId = `pending-${Date.now()}`;

		const listener = async (txHash: string) => {
			try {
				const tx = await this.provider!.getTransaction(txHash);
				if (tx) {
					// Apply filters
					if (filter?.from && tx.from.toLowerCase() !== filter.from.toLowerCase()) {
						return;
					}
					if (filter?.to && tx.to?.toLowerCase() !== filter.to.toLowerCase()) {
						return;
					}

					const event: TransactionEvent = {
						type: 'transaction',
						hash: tx.hash,
						from: tx.from,
						to: tx.to || '',
						value: tx.value.toString(),
						blockNumber: tx.blockNumber || 0,
						status: 'pending',
					};
					callback(event);
				}
			} catch (error) {
				// Transaction may be dropped
			}
		};

		this.provider.on('pending', listener);
		this.subscriptions.set(subscriptionId, {
			filter: { type: 'transaction', fromAddress: filter?.from, toAddress: filter?.to },
			listener,
		});

		return subscriptionId;
	}

	/**
	 * Subscribe to ERC20 transfers
	 */
	async subscribeToTransfers(
		tokenAddress: string,
		callback: (event: TransferEvent) => void,
		filter?: { from?: string; to?: string; minAmount?: string },
	): Promise<string> {
		if (!this.provider) {
			throw new Error('Not connected');
		}

		const subscriptionId = `transfers-${tokenAddress}-${Date.now()}`;

		const contract = new ethers.Contract(tokenAddress, ABIS.ERC20, this.provider);

		const eventFilter = contract.filters.Transfer(
			filter?.from || null,
			filter?.to || null,
		);

		const listener = (from: string, to: string, amount: bigint, event: ethers.EventLog) => {
			// Apply min amount filter
			if (filter?.minAmount && BigInt(amount) < BigInt(filter.minAmount)) {
				return;
			}

			const transferEvent: TransferEvent = {
				type: 'transfer',
				token: tokenAddress,
				from,
				to,
				amount: amount.toString(),
				transactionHash: event.transactionHash,
				blockNumber: event.blockNumber,
			};
			callback(transferEvent);
		};

		contract.on(eventFilter, listener);
		this.subscriptions.set(subscriptionId, {
			filter: { type: 'transfer', address: tokenAddress, ...filter },
			listener: listener as ethers.Listener,
		});

		return subscriptionId;
	}

	/**
	 * Subscribe to BGT events
	 */
	async subscribeToBGTEvents(
		callback: (event: BGTEvent) => void,
		eventTypes?: Array<BGTEvent['type']>,
	): Promise<string> {
		if (!this.provider) {
			throw new Error('Not connected');
		}

		const subscriptionId = `bgt-${Date.now()}`;
		const bgtAddress = getContractAddress(this.network, 'bgt');
		const bgt = new ethers.Contract(bgtAddress, ABIS.BGT, this.provider);

		// Subscribe to relevant BGT events
		const listeners: ethers.Listener[] = [];

		if (!eventTypes || eventTypes.includes('bgtDelegated')) {
			const delegateFilter = bgt.filters.DelegateChanged();
			const delegateListener = (
				delegator: string,
				fromDelegate: string,
				toDelegate: string,
				event: ethers.EventLog,
			) => {
				callback({
					type: 'bgtDelegated',
					account: delegator,
					validator: toDelegate,
					transactionHash: event.transactionHash,
					blockNumber: event.blockNumber,
				});
			};
			bgt.on(delegateFilter, delegateListener);
			listeners.push(delegateListener as ethers.Listener);
		}

		this.subscriptions.set(subscriptionId, {
			filter: { type: 'bgtDelegated' },
			listener: listeners[0] || (() => {}),
		});

		return subscriptionId;
	}

	/**
	 * Subscribe to HONEY mint/redeem events
	 */
	async subscribeToHONEYEvents(
		callback: (event: HONEYEvent) => void,
	): Promise<string> {
		if (!this.provider) {
			throw new Error('Not connected');
		}

		const subscriptionId = `honey-${Date.now()}`;
		const honeyAddress = getContractAddress(this.network, 'honey');
		const honey = new ethers.Contract(honeyAddress, ABIS.HONEY, this.provider);

		// Transfer events can indicate mints (from zero) or burns (to zero)
		const transferFilter = honey.filters.Transfer();

		const listener = (from: string, to: string, amount: bigint, event: ethers.EventLog) => {
			if (from === ethers.ZeroAddress) {
				callback({
					type: 'honeyMinted',
					account: to,
					amount: amount.toString(),
					transactionHash: event.transactionHash,
					blockNumber: event.blockNumber,
				});
			} else if (to === ethers.ZeroAddress) {
				callback({
					type: 'honeyRedeemed',
					account: from,
					amount: amount.toString(),
					transactionHash: event.transactionHash,
					blockNumber: event.blockNumber,
				});
			}
		};

		honey.on(transferFilter, listener);
		this.subscriptions.set(subscriptionId, {
			filter: { type: 'honeyMinted' },
			listener: listener as ethers.Listener,
		});

		return subscriptionId;
	}

	/**
	 * Subscribe to vault staking events
	 */
	async subscribeToVaultEvents(
		vaultAddress: string,
		callback: (event: VaultEvent) => void,
	): Promise<string> {
		if (!this.provider) {
			throw new Error('Not connected');
		}

		const subscriptionId = `vault-${vaultAddress}-${Date.now()}`;
		const vault = new ethers.Contract(vaultAddress, ABIS.REWARD_VAULT, this.provider);

		// Listen for Staked events
		const stakedFilter = vault.filters.Staked();
		const stakedListener = (
			account: string,
			amount: bigint,
			event: ethers.EventLog,
		) => {
			callback({
				type: 'vaultStaked',
				vault: vaultAddress,
				account,
				amount: amount.toString(),
				transactionHash: event.transactionHash,
				blockNumber: event.blockNumber,
			});
		};

		vault.on(stakedFilter, stakedListener);
		this.subscriptions.set(subscriptionId, {
			filter: { type: 'vaultStaked', vaultAddress },
			listener: stakedListener as ethers.Listener,
		});

		return subscriptionId;
	}

	/**
	 * Subscribe to BEX swap events
	 */
	async subscribeToSwaps(
		poolAddress: string,
		callback: (event: DEXEvent) => void,
		filter?: { minAmount?: string },
	): Promise<string> {
		if (!this.provider) {
			throw new Error('Not connected');
		}

		const subscriptionId = `swap-${poolAddress}-${Date.now()}`;
		const pool = new ethers.Contract(poolAddress, ABIS.BEX_PAIR, this.provider);

		const swapFilter = pool.filters.Swap();
		const listener = (
			sender: string,
			amount0In: bigint,
			amount1In: bigint,
			amount0Out: bigint,
			amount1Out: bigint,
			to: string,
			event: ethers.EventLog,
		) => {
			const amountIn = amount0In > 0n ? amount0In : amount1In;
			const amountOut = amount0Out > 0n ? amount0Out : amount1Out;

			// Apply min amount filter
			if (filter?.minAmount && amountIn < BigInt(filter.minAmount)) {
				return;
			}

			callback({
				type: 'swap',
				pool: poolAddress,
				account: sender,
				amountIn: amountIn.toString(),
				amountOut: amountOut.toString(),
				transactionHash: event.transactionHash,
				blockNumber: event.blockNumber,
			});
		};

		pool.on(swapFilter, listener);
		this.subscriptions.set(subscriptionId, {
			filter: { type: 'swap', address: poolAddress },
			listener: listener as ethers.Listener,
		});

		return subscriptionId;
	}

	/**
	 * Subscribe to custom contract events
	 */
	async subscribeToContractEvent(
		contractAddress: string,
		abi: string[],
		eventName: string,
		callback: (event: Record<string, unknown>) => void,
		filter?: Record<string, unknown>,
	): Promise<string> {
		if (!this.provider) {
			throw new Error('Not connected');
		}

		const subscriptionId = `custom-${contractAddress}-${eventName}-${Date.now()}`;
		const contract = new ethers.Contract(contractAddress, abi, this.provider);

		const eventFilter = contract.filters[eventName]?.(...Object.values(filter || {}));
		if (!eventFilter) {
			throw new Error(`Event ${eventName} not found in ABI`);
		}

		const listener = (...args: unknown[]) => {
			const event = args[args.length - 1] as ethers.EventLog;
			callback({
				...Object.fromEntries(
					args.slice(0, -1).map((arg, i) => [`arg${i}`, arg]),
				),
				transactionHash: event.transactionHash,
				blockNumber: event.blockNumber,
			});
		};

		contract.on(eventFilter, listener);
		this.subscriptions.set(subscriptionId, {
			filter: { type: 'transfer', address: contractAddress }, // Generic type
			listener: listener as ethers.Listener,
		});

		return subscriptionId;
	}

	/**
	 * Unsubscribe from an event
	 */
	async unsubscribe(subscriptionId: string): Promise<boolean> {
		const subscription = this.subscriptions.get(subscriptionId);
		if (!subscription || !this.provider) {
			return false;
		}

		this.provider.off(subscription.filter.type, subscription.listener);
		this.subscriptions.delete(subscriptionId);

		return true;
	}

	/**
	 * Get all active subscriptions
	 */
	getSubscriptions(): Array<{ id: string; filter: EventFilter }> {
		return Array.from(this.subscriptions.entries()).map(([id, { filter }]) => ({
			id,
			filter,
		}));
	}

	/**
	 * Check connection status
	 */
	isActive(): boolean {
		return this.isConnected && this.provider !== null;
	}

	/**
	 * Handle disconnect and attempt reconnect
	 */
	private handleDisconnect(): void {
		this.isConnected = false;
		this.emit('disconnected');
		this.attemptReconnect();
	}

	/**
	 * Attempt to reconnect with exponential backoff
	 */
	private async attemptReconnect(): Promise<void> {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			this.emit('error', new Error('Max reconnection attempts reached'));
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

		this.emit('reconnecting', {
			attempt: this.reconnectAttempts,
			maxAttempts: this.maxReconnectAttempts,
			delay,
		});

		await new Promise((resolve) => setTimeout(resolve, delay));

		try {
			await this.connect();

			// Restore subscriptions
			// Note: In a real implementation, you'd need to re-subscribe to all events
			this.emit('reconnected');
		} catch {
			await this.attemptReconnect();
		}
	}
}
