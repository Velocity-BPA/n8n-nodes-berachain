/**
 * BGT Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, parseUnits, Contract } from 'ethers';
import { BGT_ABI } from '../../constants/abis';

export const bgtOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bgt'] } },
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get BGT balance', action: 'Get balance' },
			{ name: 'Get Balances', value: 'getBalances', description: 'Get detailed balances', action: 'Get balances' },
			{ name: 'Get Boosts', value: 'getBoosts', description: 'Get boost info', action: 'Get boosts' },
			{ name: 'Queue Boost', value: 'queueBoost', description: 'Queue BGT boost', action: 'Queue boost' },
			{ name: 'Activate Boost', value: 'activateBoost', description: 'Activate boost', action: 'Activate boost' },
			{ name: 'Cancel Boost', value: 'cancelBoost', description: 'Cancel boost', action: 'Cancel boost' },
			{ name: 'Drop Boost', value: 'dropBoost', description: 'Drop boost', action: 'Drop boost' },
			{ name: 'Delegate', value: 'delegate', description: 'Delegate votes', action: 'Delegate' },
			{ name: 'Get Delegate', value: 'getDelegate', description: 'Get delegate', action: 'Get delegate' },
			{ name: 'Get Votes', value: 'getVotes', description: 'Get voting power', action: 'Get votes' },
		],
		default: 'getBalance',
	},
];

export const bgtFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bgt'], operation: ['getBalance', 'getBalances', 'getBoosts', 'getDelegate', 'getVotes'] } },
	},
	{
		displayName: 'Validator Address',
		name: 'validator',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bgt'], operation: ['queueBoost', 'activateBoost', 'cancelBoost', 'dropBoost'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '0',
		displayOptions: { show: { resource: ['bgt'], operation: ['queueBoost', 'dropBoost'] } },
	},
	{
		displayName: 'Delegatee Address',
		name: 'delegatee',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bgt'], operation: ['delegate'] } },
	},
];

export async function executeBgtOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const contracts = client.getContracts();
	const provider = client.getProvider();
	const wallet = client.getWallet();
	const bgtContract = new Contract(contracts.bgt, BGT_ABI, wallet || provider);

	switch (operation) {
		case 'getBalance': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const balance = await bgtContract.balanceOf(address);
			returnData.push({ json: { address, balance: balance.toString(), formatted: formatUnits(balance, 18) } });
			break;
		}

		case 'getBalances': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const balance = await bgtContract.balanceOf(address);
			const unboosted = await bgtContract.unboostedBalanceOf(address);
			const boosted = balance - unboosted;
			returnData.push({ json: {
				address,
				total: balance.toString(),
				unboosted: unboosted.toString(),
				boosted: boosted.toString(),
				formattedTotal: formatUnits(balance, 18),
				formattedUnboosted: formatUnits(unboosted, 18),
				formattedBoosted: formatUnits(boosted, 18),
			} });
			break;
		}

		case 'getBoosts': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const balance = await bgtContract.balanceOf(address);
			const unboosted = await bgtContract.unboostedBalanceOf(address);
			const boosted = balance - unboosted;
			returnData.push({ json: {
				address,
				total: balance.toString(),
				unboosted: unboosted.toString(),
				boosted: boosted.toString(),
			} });
			break;
		}

		case 'queueBoost': {
			if (!wallet) throw new Error('Wallet required for this operation');
			const validator = this.getNodeParameter('validator', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(validator)) throw new Error('Invalid validator address');
			const tx = await bgtContract.queueBoost(validator, parseUnits(amount, 18));
			const receipt = await tx.wait();
			returnData.push({ json: { success: true, validator, amount, transactionHash: receipt.hash } });
			break;
		}

		case 'activateBoost': {
			if (!wallet) throw new Error('Wallet required for this operation');
			const validator = this.getNodeParameter('validator', index) as string;
			if (!isValidAddress(validator)) throw new Error('Invalid validator address');
			const tx = await bgtContract.activateBoost(validator);
			const receipt = await tx.wait();
			returnData.push({ json: { success: true, validator, transactionHash: receipt.hash } });
			break;
		}

		case 'cancelBoost': {
			if (!wallet) throw new Error('Wallet required for this operation');
			const validator = this.getNodeParameter('validator', index) as string;
			if (!isValidAddress(validator)) throw new Error('Invalid validator address');
			const tx = await bgtContract.cancelBoost(validator);
			const receipt = await tx.wait();
			returnData.push({ json: { success: true, validator, transactionHash: receipt.hash } });
			break;
		}

		case 'dropBoost': {
			if (!wallet) throw new Error('Wallet required for this operation');
			const validator = this.getNodeParameter('validator', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(validator)) throw new Error('Invalid validator address');
			const tx = await bgtContract.dropBoost(validator, parseUnits(amount, 18));
			const receipt = await tx.wait();
			returnData.push({ json: { success: true, validator, amount, transactionHash: receipt.hash } });
			break;
		}

		case 'delegate': {
			if (!wallet) throw new Error('Wallet required for this operation');
			const delegatee = this.getNodeParameter('delegatee', index) as string;
			if (!isValidAddress(delegatee)) throw new Error('Invalid delegatee address');
			const tx = await bgtContract.delegate(delegatee);
			const receipt = await tx.wait();
			returnData.push({ json: { success: true, delegatee, transactionHash: receipt.hash } });
			break;
		}

		case 'getDelegate': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const delegate = await bgtContract.delegates(address);
			returnData.push({ json: { address, delegate } });
			break;
		}

		case 'getVotes': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const votes = await bgtContract.getVotes(address);
			returnData.push({ json: { address, votes: votes.toString(), formatted: formatUnits(votes, 18) } });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
