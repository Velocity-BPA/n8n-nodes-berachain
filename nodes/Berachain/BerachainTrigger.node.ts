/**
 * BerachainTrigger.node.ts
 * n8n trigger node for real-time Berachain blockchain events
 *
 * SPDX-License-Identifier: BSL-1.1
 * Copyright (c) 2025 Velocity BPA
 * See LICENSE file for details
 */

import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
} from 'n8n-workflow';
import { ethers } from 'ethers';
import { NETWORKS, NetworkConfig } from './constants/networks';
import { ABIS } from './constants/abis';
import { getContractAddress, ContractAddresses } from './constants/contracts';

export class BerachainTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Berachain Trigger',
		name: 'berachainTrigger',
		icon: 'file:berachain.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Triggers workflow on Berachain blockchain events',
		defaults: {
			name: 'Berachain Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'berachainNetwork',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event Type',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'New Block',
						value: 'newBlock',
						description: 'Trigger on each new block',
					},
					{
						name: 'Pending Transaction',
						value: 'pendingTransaction',
						description: 'Trigger on pending transactions',
					},
					{
						name: 'BGT Queued',
						value: 'bgtQueued',
						description: 'Trigger when BGT is queued for boost',
					},
					{
						name: 'BGT Activated',
						value: 'bgtActivated',
						description: 'Trigger when BGT boost is activated',
					},
					{
						name: 'BGT Dropped',
						value: 'bgtDropped',
						description: 'Trigger when BGT boost is dropped',
					},
					{
						name: 'BGT Delegated',
						value: 'bgtDelegated',
						description: 'Trigger when BGT delegation changes',
					},
					{
						name: 'HONEY Minted',
						value: 'honeyMinted',
						description: 'Trigger when HONEY is minted',
					},
					{
						name: 'HONEY Redeemed',
						value: 'honeyRedeemed',
						description: 'Trigger when HONEY is redeemed',
					},
					{
						name: 'Validator Reward',
						value: 'validatorReward',
						description: 'Trigger on validator reward distribution',
					},
					{
						name: 'Vault Stake',
						value: 'vaultStake',
						description: 'Trigger when tokens are staked in reward vault',
					},
					{
						name: 'Vault Withdraw',
						value: 'vaultWithdraw',
						description: 'Trigger when tokens are withdrawn from reward vault',
					},
					{
						name: 'BEX Swap',
						value: 'bexSwap',
						description: 'Trigger on BEX swap events',
					},
					{
						name: 'Bend Supply',
						value: 'bendSupply',
						description: 'Trigger on Bend supply events',
					},
					{
						name: 'Bend Borrow',
						value: 'bendBorrow',
						description: 'Trigger on Bend borrow events',
					},
					{
						name: 'Berps Position Opened',
						value: 'berpsPositionOpened',
						description: 'Trigger when Berps position is opened',
					},
					{
						name: 'Berps Position Closed',
						value: 'berpsPositionClosed',
						description: 'Trigger when Berps position is closed',
					},
					{
						name: 'Contract Event',
						value: 'contractEvent',
						description: 'Trigger on custom contract events',
					},
				],
				default: 'newBlock',
				description: 'The event type to trigger on',
			},
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				displayOptions: {
					show: {
						event: ['contractEvent', 'vaultStake', 'vaultWithdraw'],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'Contract address to monitor',
			},
			{
				displayName: 'Event Name',
				name: 'eventName',
				type: 'string',
				displayOptions: {
					show: {
						event: ['contractEvent'],
					},
				},
				default: '',
				placeholder: 'Transfer',
				description: 'Name of the event to listen for',
			},
			{
				displayName: 'Event ABI',
				name: 'eventAbi',
				type: 'string',
				displayOptions: {
					show: {
						event: ['contractEvent'],
					},
				},
				default: '',
				placeholder: 'event Transfer(address indexed from, address indexed to, uint256 value)',
				description: 'Event ABI signature',
			},
			{
				displayName: 'Filter Address',
				name: 'filterAddress',
				type: 'string',
				displayOptions: {
					show: {
						event: [
							'bgtQueued',
							'bgtActivated',
							'bgtDropped',
							'bgtDelegated',
							'honeyMinted',
							'honeyRedeemed',
							'vaultStake',
							'vaultWithdraw',
							'bexSwap',
							'bendSupply',
							'bendBorrow',
							'berpsPositionOpened',
							'berpsPositionClosed',
						],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'Filter events by address (optional)',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Block Data',
						name: 'includeBlock',
						type: 'boolean',
						default: false,
						description: 'Whether to include full block data with events',
					},
					{
						displayName: 'Include Transaction Data',
						name: 'includeTransaction',
						type: 'boolean',
						default: false,
						description: 'Whether to include full transaction data',
					},
					{
						displayName: 'Decode Logs',
						name: 'decodeLogs',
						type: 'boolean',
						default: true,
						description: 'Whether to decode event logs with known ABIs',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const event = this.getNodeParameter('event') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Get credentials
		const credentials = await this.getCredentials('berachainNetwork');
		const network = (credentials.network as string) || 'bartio';

		// Get RPC URL
		let rpcUrl: string;
		if (network === 'custom') {
			rpcUrl = credentials.customRpcUrl as string;
		} else {
			const networkConfig = NETWORKS[network as keyof typeof NETWORKS] as NetworkConfig;
			rpcUrl = networkConfig?.rpcUrl || NETWORKS.bartio.rpcUrl;
		}

		// Create provider
		const provider = new ethers.JsonRpcProvider(rpcUrl);

		// Track listeners for cleanup
		const listeners: Array<{ remove: () => void }> = [];

		const emit = (data: IDataObject) => {
			this.emit([this.helpers.returnJsonArray([data])]);
		};

		// Helper to get contract address safely
		const getAddress = (contract: keyof ContractAddresses): string => {
			try {
				return getContractAddress(network, contract);
			} catch {
				return '';
			}
		};

		const setupListener = async () => {
			switch (event) {
				case 'newBlock': {
					const blockHandler = async (blockNumber: number) => {
						const blockData: IDataObject = { blockNumber };

						if (options.includeBlock) {
							const block = await provider.getBlock(blockNumber);
							if (block) {
								blockData.block = {
									hash: block.hash,
									parentHash: block.parentHash,
									number: block.number,
									timestamp: block.timestamp,
									gasLimit: block.gasLimit.toString(),
									gasUsed: block.gasUsed.toString(),
									baseFeePerGas: block.baseFeePerGas?.toString(),
									miner: block.miner,
									transactionCount: block.transactions?.length || 0,
								};
							}
						}

						emit(blockData);
					};

					provider.on('block', blockHandler);
					listeners.push({
						remove: () => provider.off('block', blockHandler),
					});
					break;
				}

				case 'pendingTransaction': {
					const pendingHandler = async (txHash: string) => {
						const txData: IDataObject = { transactionHash: txHash };

						if (options.includeTransaction) {
							const tx = await provider.getTransaction(txHash);
							if (tx) {
								txData.transaction = {
									hash: tx.hash,
									from: tx.from,
									to: tx.to,
									value: tx.value.toString(),
									gasLimit: tx.gasLimit.toString(),
									gasPrice: tx.gasPrice?.toString(),
									nonce: tx.nonce,
									data: tx.data,
								};
							}
						}

						emit(txData);
					};

					provider.on('pending', pendingHandler);
					listeners.push({
						remove: () => provider.off('pending', pendingHandler),
					});
					break;
				}

				case 'bgtQueued':
				case 'bgtActivated':
				case 'bgtDropped':
				case 'bgtDelegated': {
					const filterAddress = this.getNodeParameter('filterAddress', '') as string;
					const bgtAddress = getAddress('bgt');

					if (!bgtAddress) {
						throw new Error('BGT contract address not found for this network');
					}

					const eventMap: Record<string, string> = {
						bgtQueued: 'QueueBoost',
						bgtActivated: 'ActivateBoost',
						bgtDropped: 'DropBoost',
						bgtDelegated: 'DelegateChanged',
					};

					const eventName = eventMap[event];
					const bgtInterface = new ethers.Interface(ABIS.BGT);
					const topicHash = bgtInterface.getEvent(eventName)?.topicHash;

					if (!topicHash) {
						throw new Error(`Event ${eventName} not found in BGT ABI`);
					}

					const filter: ethers.Filter = {
						address: bgtAddress,
						topics: [topicHash],
					};

					if (filterAddress && ethers.isAddress(filterAddress)) {
						filter.topics = [
							topicHash,
							ethers.zeroPadValue(filterAddress, 32),
						];
					}

					const logHandler = async (log: ethers.Log) => {
						const decoded = bgtInterface.parseLog({
							topics: log.topics as string[],
							data: log.data,
						});

						const eventData: IDataObject = {
							event: eventName,
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
							args: decoded?.args ? Object.fromEntries(
								decoded.args.map((arg: unknown, i: number) => [
									decoded.fragment.inputs[i]?.name || `arg${i}`,
									typeof arg === 'bigint' ? arg.toString() : arg,
								])
							) : {},
						};

						emit(eventData);
					};

					provider.on(filter, logHandler);
					listeners.push({
						remove: () => provider.off(filter, logHandler),
					});
					break;
				}

				case 'honeyMinted':
				case 'honeyRedeemed': {
					const filterAddress = this.getNodeParameter('filterAddress', '') as string;
					const honeyFactoryAddress = getAddress('honeyFactory');

					if (!honeyFactoryAddress) {
						throw new Error('HONEY factory address not found for this network');
					}

					const eventName = event === 'honeyMinted' ? 'Mint' : 'Redeem';
					const honeyInterface = new ethers.Interface(ABIS.HONEY);
					const topicHash = honeyInterface.getEvent(eventName)?.topicHash;

					if (!topicHash) {
						throw new Error(`Event ${eventName} not found in HONEY ABI`);
					}

					const filter: ethers.Filter = {
						address: honeyFactoryAddress,
						topics: [topicHash],
					};

					if (filterAddress && ethers.isAddress(filterAddress)) {
						filter.topics = [
							topicHash,
							ethers.zeroPadValue(filterAddress, 32),
						];
					}

					const logHandler = async (log: ethers.Log) => {
						const decoded = honeyInterface.parseLog({
							topics: log.topics as string[],
							data: log.data,
						});

						const eventData: IDataObject = {
							event: eventName,
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
							args: decoded?.args ? Object.fromEntries(
								decoded.args.map((arg: unknown, i: number) => [
									decoded.fragment.inputs[i]?.name || `arg${i}`,
									typeof arg === 'bigint' ? arg.toString() : arg,
								])
							) : {},
						};

						emit(eventData);
					};

					provider.on(filter, logHandler);
					listeners.push({
						remove: () => provider.off(filter, logHandler),
					});
					break;
				}

				case 'validatorReward': {
					const berachefAddress = getAddress('berachef');

					if (!berachefAddress) {
						throw new Error('Berachef address not found for this network');
					}

					const berachefInterface = new ethers.Interface(ABIS.BERACHEF);
					const topicHash = berachefInterface.getEvent('RewardDistributed')?.topicHash;

					if (!topicHash) {
						throw new Error('RewardDistributed event not found in Berachef ABI');
					}

					const filter: ethers.Filter = {
						address: berachefAddress,
						topics: [topicHash],
					};

					const logHandler = async (log: ethers.Log) => {
						const decoded = berachefInterface.parseLog({
							topics: log.topics as string[],
							data: log.data,
						});

						const eventData: IDataObject = {
							event: 'RewardDistributed',
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
							args: decoded?.args ? Object.fromEntries(
								decoded.args.map((arg: unknown, i: number) => [
									decoded.fragment.inputs[i]?.name || `arg${i}`,
									typeof arg === 'bigint' ? arg.toString() : arg,
								])
							) : {},
						};

						emit(eventData);
					};

					provider.on(filter, logHandler);
					listeners.push({
						remove: () => provider.off(filter, logHandler),
					});
					break;
				}

				case 'vaultStake':
				case 'vaultWithdraw': {
					const contractAddress = this.getNodeParameter('contractAddress', '') as string;
					const filterAddress = this.getNodeParameter('filterAddress', '') as string;

					if (!contractAddress || !ethers.isAddress(contractAddress)) {
						throw new Error('Valid vault contract address required');
					}

					const eventName = event === 'vaultStake' ? 'Staked' : 'Withdrawn';
					const vaultInterface = new ethers.Interface(ABIS.REWARD_VAULT);
					const topicHash = vaultInterface.getEvent(eventName)?.topicHash;

					if (!topicHash) {
						throw new Error(`Event ${eventName} not found in Reward Vault ABI`);
					}

					const filter: ethers.Filter = {
						address: contractAddress,
						topics: [topicHash],
					};

					if (filterAddress && ethers.isAddress(filterAddress)) {
						filter.topics = [
							topicHash,
							ethers.zeroPadValue(filterAddress, 32),
						];
					}

					const logHandler = async (log: ethers.Log) => {
						const decoded = vaultInterface.parseLog({
							topics: log.topics as string[],
							data: log.data,
						});

						const eventData: IDataObject = {
							event: eventName,
							vaultAddress: contractAddress,
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
							args: decoded?.args ? Object.fromEntries(
								decoded.args.map((arg: unknown, i: number) => [
									decoded.fragment.inputs[i]?.name || `arg${i}`,
									typeof arg === 'bigint' ? arg.toString() : arg,
								])
							) : {},
						};

						emit(eventData);
					};

					provider.on(filter, logHandler);
					listeners.push({
						remove: () => provider.off(filter, logHandler),
					});
					break;
				}

				case 'bexSwap': {
					const filterAddress = this.getNodeParameter('filterAddress', '') as string;
					const bexAddress = getAddress('bexRouter');

					if (!bexAddress) {
						throw new Error('BEX router address not found for this network');
					}

					const bexInterface = new ethers.Interface(ABIS.BEX_ROUTER);
					const topicHash = bexInterface.getEvent('Swap')?.topicHash;

					if (!topicHash) {
						throw new Error('Swap event not found in BEX ABI');
					}

					const filter: ethers.Filter = {
						address: bexAddress,
						topics: [topicHash],
					};

					if (filterAddress && ethers.isAddress(filterAddress)) {
						filter.topics = [
							topicHash,
							ethers.zeroPadValue(filterAddress, 32),
						];
					}

					const logHandler = async (log: ethers.Log) => {
						const decoded = bexInterface.parseLog({
							topics: log.topics as string[],
							data: log.data,
						});

						const eventData: IDataObject = {
							event: 'Swap',
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
							args: decoded?.args ? Object.fromEntries(
								decoded.args.map((arg: unknown, i: number) => [
									decoded.fragment.inputs[i]?.name || `arg${i}`,
									typeof arg === 'bigint' ? arg.toString() : arg,
								])
							) : {},
						};

						emit(eventData);
					};

					provider.on(filter, logHandler);
					listeners.push({
						remove: () => provider.off(filter, logHandler),
					});
					break;
				}

				case 'bendSupply':
				case 'bendBorrow': {
					const filterAddress = this.getNodeParameter('filterAddress', '') as string;
					const bendPoolAddress = getAddress('bendPool');

					if (!bendPoolAddress) {
						throw new Error('Bend pool address not found for this network');
					}

					const eventName = event === 'bendSupply' ? 'Supply' : 'Borrow';
					const bendInterface = new ethers.Interface(ABIS.BEND_POOL);
					const topicHash = bendInterface.getEvent(eventName)?.topicHash;

					if (!topicHash) {
						throw new Error(`Event ${eventName} not found in Bend ABI`);
					}

					const filter: ethers.Filter = {
						address: bendPoolAddress,
						topics: [topicHash],
					};

					if (filterAddress && ethers.isAddress(filterAddress)) {
						filter.topics = [
							topicHash,
							ethers.zeroPadValue(filterAddress, 32),
						];
					}

					const logHandler = async (log: ethers.Log) => {
						const decoded = bendInterface.parseLog({
							topics: log.topics as string[],
							data: log.data,
						});

						const eventData: IDataObject = {
							event: eventName,
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
							args: decoded?.args ? Object.fromEntries(
								decoded.args.map((arg: unknown, i: number) => [
									decoded.fragment.inputs[i]?.name || `arg${i}`,
									typeof arg === 'bigint' ? arg.toString() : arg,
								])
							) : {},
						};

						emit(eventData);
					};

					provider.on(filter, logHandler);
					listeners.push({
						remove: () => provider.off(filter, logHandler),
					});
					break;
				}

				case 'berpsPositionOpened':
				case 'berpsPositionClosed': {
					const filterAddress = this.getNodeParameter('filterAddress', '') as string;
					const berpsAddress = getAddress('berpsTrading');

					if (!berpsAddress) {
						throw new Error('Berps trading address not found for this network');
					}

					const eventName = event === 'berpsPositionOpened' ? 'TradeOpened' : 'TradeClosed';
					const berpsInterface = new ethers.Interface(ABIS.BERPS_TRADING);
					const topicHash = berpsInterface.getEvent(eventName)?.topicHash;

					if (!topicHash) {
						throw new Error(`Event ${eventName} not found in Berps ABI`);
					}

					const filter: ethers.Filter = {
						address: berpsAddress,
						topics: [topicHash],
					};

					if (filterAddress && ethers.isAddress(filterAddress)) {
						filter.topics = [
							topicHash,
							ethers.zeroPadValue(filterAddress, 32),
						];
					}

					const logHandler = async (log: ethers.Log) => {
						const decoded = berpsInterface.parseLog({
							topics: log.topics as string[],
							data: log.data,
						});

						const eventData: IDataObject = {
							event: eventName,
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
							args: decoded?.args ? Object.fromEntries(
								decoded.args.map((arg: unknown, i: number) => [
									decoded.fragment.inputs[i]?.name || `arg${i}`,
									typeof arg === 'bigint' ? arg.toString() : arg,
								])
							) : {},
						};

						emit(eventData);
					};

					provider.on(filter, logHandler);
					listeners.push({
						remove: () => provider.off(filter, logHandler),
					});
					break;
				}

				case 'contractEvent': {
					const contractAddress = this.getNodeParameter('contractAddress', '') as string;
					const eventName = this.getNodeParameter('eventName', '') as string;
					const eventAbi = this.getNodeParameter('eventAbi', '') as string;

					if (!contractAddress || !ethers.isAddress(contractAddress)) {
						throw new Error('Valid contract address required');
					}

					if (!eventAbi) {
						throw new Error('Event ABI required for custom contract events');
					}

					const contractInterface = new ethers.Interface([eventAbi]);
					const topicHash = contractInterface.getEvent(eventName)?.topicHash;

					if (!topicHash) {
						throw new Error(`Event ${eventName} not found in provided ABI`);
					}

					const filter: ethers.Filter = {
						address: contractAddress,
						topics: [topicHash],
					};

					const logHandler = async (log: ethers.Log) => {
						let decoded: ethers.LogDescription | null = null;
						try {
							decoded = contractInterface.parseLog({
								topics: log.topics as string[],
								data: log.data,
							});
						} catch {
							// Unable to decode
						}

						const eventData: IDataObject = {
							event: eventName,
							contractAddress,
							blockNumber: log.blockNumber,
							transactionHash: log.transactionHash,
							logIndex: log.index,
							topics: log.topics,
							data: log.data,
							args: decoded?.args ? Object.fromEntries(
								decoded.args.map((arg: unknown, i: number) => [
									decoded!.fragment.inputs[i]?.name || `arg${i}`,
									typeof arg === 'bigint' ? arg.toString() : arg,
								])
							) : {},
						};

						emit(eventData);
					};

					provider.on(filter, logHandler);
					listeners.push({
						remove: () => provider.off(filter, logHandler),
					});
					break;
				}

				default:
					throw new Error(`Unknown event type: ${event}`);
			}
		};

		await setupListener();

		// Return cleanup function
		const closeFunction = async () => {
			for (const listener of listeners) {
				listener.remove();
			}
			provider.destroy();
		};

		return {
			closeFunction,
		};
	}
}
