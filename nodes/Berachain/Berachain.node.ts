/**
 * Berachain n8n Node
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * For licensing information, visit https://velobpa.com/licensing
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { BerachainClient } from './transport/berachainClient';

// Import all action modules
import { accountOperations, accountFields, executeAccountOperation } from './actions/account';
import { transactionOperations, transactionFields, executeTransactionOperation } from './actions/transaction';
import { beraOperations, beraFields, executeBeraOperation } from './actions/bera';
import { bgtOperations, bgtFields, executeBgtOperation } from './actions/bgt';
import { honeyOperations, honeyFields, executeHoneyOperation } from './actions/honey';
import { validatorOperations, validatorFields, executeValidatorOperation } from './actions/validator';
import { rewardVaultOperations, rewardVaultFields, executeRewardVaultOperation } from './actions/rewardVault';
import { cuttingBoardOperations, cuttingBoardFields, executeCuttingBoardOperation } from './actions/cuttingBoard';
import { gaugeOperations, gaugeFields, executeGaugeOperation } from './actions/gauge';
import { bexOperations, bexFields, executeBexOperation } from './actions/bex';
import { bendOperations, bendFields, executeBendOperation } from './actions/bend';
import { berpsOperations, berpsFields, executeBerpsOperation } from './actions/berps';
import { contractOperations, contractFields, executeContractOperation } from './actions/contract';
import { tokenOperations, tokenFields, executeTokenOperation } from './actions/token';
import { nftOperations, nftFields, executeNftOperation } from './actions/nft';
import { blockOperations, blockFields, executeBlockOperation } from './actions/block';
import { eventOperations, eventFields, executeEventOperation } from './actions/event';
import { governanceOperations, governanceFields, executeGovernanceOperation } from './actions/governance';
import { infraredOperations, infraredFields, executeInfraredOperation } from './actions/infrared';
import { multicallOperations, multicallFields, executeMulticallOperation } from './actions/multicall';
import { analyticsOperations, analyticsFields, executeAnalyticsOperation } from './actions/analytics';
import { subgraphOperations, subgraphFields, executeSubgraphOperation } from './actions/subgraph';
import { utilityOperations, utilityFields, executeUtilityOperation } from './actions/utility';

export class Berachain implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Berachain',
		name: 'berachain',
		icon: 'file:berachain.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with Berachain Proof of Liquidity blockchain',
		defaults: { name: 'Berachain' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{ name: 'berachainNetwork', required: true },
			{ name: 'berachainApi', required: false },
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account', description: 'Account operations' },
					{ name: 'Analytics', value: 'analytics', description: 'Network analytics' },
					{ name: 'BERA', value: 'bera', description: 'Native BERA token' },
					{ name: 'Bend', value: 'bend', description: 'Bend lending protocol' },
					{ name: 'Berps', value: 'berps', description: 'Berps perpetuals' },
					{ name: 'BEX', value: 'bex', description: 'BEX DEX operations' },
					{ name: 'BGT', value: 'bgt', description: 'BGT governance token' },
					{ name: 'Block', value: 'block', description: 'Block operations' },
					{ name: 'Contract', value: 'contract', description: 'Smart contract operations' },
					{ name: 'Cutting Board', value: 'cuttingBoard', description: 'Validator reward distribution' },
					{ name: 'Event', value: 'event', description: 'Event log operations' },
					{ name: 'Gauge', value: 'gauge', description: 'BGT gauge voting' },
					{ name: 'Governance', value: 'governance', description: 'On-chain governance' },
					{ name: 'HONEY', value: 'honey', description: 'HONEY stablecoin' },
					{ name: 'Infrared', value: 'infrared', description: 'Infrared liquid staking' },
					{ name: 'Multicall', value: 'multicall', description: 'Batch contract calls' },
					{ name: 'NFT', value: 'nft', description: 'NFT operations' },
					{ name: 'Reward Vault', value: 'rewardVault', description: 'BGT reward vaults' },
					{ name: 'Subgraph', value: 'subgraph', description: 'GraphQL subgraph queries' },
					{ name: 'Token', value: 'token', description: 'ERC20 token operations' },
					{ name: 'Transaction', value: 'transaction', description: 'Transaction operations' },
					{ name: 'Utility', value: 'utility', description: 'Utility functions' },
					{ name: 'Validator', value: 'validator', description: 'Validator operations' },
				],
				default: 'account',
			},
			// Account
			...accountOperations,
			...accountFields,
			// Transaction
			...transactionOperations,
			...transactionFields,
			// BERA
			...beraOperations,
			...beraFields,
			// BGT
			...bgtOperations,
			...bgtFields,
			// HONEY
			...honeyOperations,
			...honeyFields,
			// Validator
			...validatorOperations,
			...validatorFields,
			// Reward Vault
			...rewardVaultOperations,
			...rewardVaultFields,
			// Cutting Board
			...cuttingBoardOperations,
			...cuttingBoardFields,
			// Gauge
			...gaugeOperations,
			...gaugeFields,
			// BEX
			...bexOperations,
			...bexFields,
			// Bend
			...bendOperations,
			...bendFields,
			// Berps
			...berpsOperations,
			...berpsFields,
			// Contract
			...contractOperations,
			...contractFields,
			// Token
			...tokenOperations,
			...tokenFields,
			// NFT
			...nftOperations,
			...nftFields,
			// Block
			...blockOperations,
			...blockFields,
			// Event
			...eventOperations,
			...eventFields,
			// Governance
			...governanceOperations,
			...governanceFields,
			// Infrared
			...infraredOperations,
			...infraredFields,
			// Multicall
			...multicallOperations,
			...multicallFields,
			// Analytics
			...analyticsOperations,
			...analyticsFields,
			// Subgraph
			...subgraphOperations,
			...subgraphFields,
			// Utility
			...utilityOperations,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('berachainNetwork');
		
		// Determine network and RPC
		let rpcUrl: string;
		let network: 'mainnet' | 'bartio' = 'bartio';
		
		if (credentials.network === 'mainnet') {
			rpcUrl = credentials.mainnetRpcUrl as string || 'https://rpc.berachain.com';
			network = 'mainnet';
		} else if (credentials.network === 'bartio') {
			rpcUrl = credentials.bartioRpcUrl as string || 'https://bartio.rpc.berachain.com';
			network = 'bartio';
		} else {
			rpcUrl = credentials.customRpcUrl as string;
			network = 'bartio'; // Default to bartio for custom
		}

		// Create client
		const client = new BerachainClient({
			rpcUrl,
			privateKey: credentials.privateKey as string | undefined,
			network,
		});

		try {
			for (let i = 0; i < items.length; i++) {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let result: INodeExecutionData[] = [];

				switch (resource) {
					case 'account':
						result = await executeAccountOperation.call(this, client, operation, i);
						break;
					case 'transaction':
						result = await executeTransactionOperation.call(this, client, operation, i);
						break;
					case 'bera':
						result = await executeBeraOperation.call(this, client, operation, i);
						break;
					case 'bgt':
						result = await executeBgtOperation.call(this, client, operation, i);
						break;
					case 'honey':
						result = await executeHoneyOperation.call(this, client, operation, i);
						break;
					case 'validator':
						result = await executeValidatorOperation.call(this, client, operation, i);
						break;
					case 'rewardVault':
						result = await executeRewardVaultOperation.call(this, client, operation, i);
						break;
					case 'cuttingBoard':
						result = await executeCuttingBoardOperation.call(this, client, operation, i);
						break;
					case 'gauge':
						result = await executeGaugeOperation.call(this, client, operation, i);
						break;
					case 'bex':
						result = await executeBexOperation.call(this, client, operation, i);
						break;
					case 'bend':
						result = await executeBendOperation.call(this, client, operation, i);
						break;
					case 'berps':
						result = await executeBerpsOperation.call(this, client, operation, i);
						break;
					case 'contract':
						result = await executeContractOperation.call(this, client, operation, i);
						break;
					case 'token':
						result = await executeTokenOperation.call(this, client, operation, i);
						break;
					case 'nft':
						result = await executeNftOperation.call(this, client, operation, i);
						break;
					case 'block':
						result = await executeBlockOperation.call(this, client, operation, i);
						break;
					case 'event':
						result = await executeEventOperation.call(this, client, operation, i);
						break;
					case 'governance':
						result = await executeGovernanceOperation.call(this, client, operation, i);
						break;
					case 'infrared':
						result = await executeInfraredOperation.call(this, client, operation, i);
						break;
					case 'multicall':
						result = await executeMulticallOperation.call(this, client, operation, i);
						break;
					case 'analytics':
						result = await executeAnalyticsOperation.call(this, client, operation, i);
						break;
					case 'subgraph':
						result = await executeSubgraphOperation.call(this, client, operation, i);
						break;
					case 'utility':
						result = await executeUtilityOperation.call(this, client, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			}
		} finally {
			client.close();
		}

		return [returnData];
	}
}
