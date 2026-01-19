/**
 * Account Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, Contract } from 'ethers';
import { BGT_ABI } from '../../constants/abis';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get BERA balance', action: 'Get balance' },
			{ name: 'Get Token Balances', value: 'getTokenBalances', description: 'Get token balances', action: 'Get token balances' },
			{ name: 'Get Transaction Count', value: 'getTransactionCount', description: 'Get nonce', action: 'Get transaction count' },
			{ name: 'Get Account Info', value: 'getAccountInfo', description: 'Get account info', action: 'Get account info' },
			{ name: 'Get BGT Balance', value: 'getBgtBalance', description: 'Get BGT balance', action: 'Get BGT balance' },
			{ name: 'Get Boosts', value: 'getBoosts', description: 'Get BGT boosts', action: 'Get boosts' },
			{ name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate gas', action: 'Estimate gas' },
		],
		default: 'getBalance',
	},
];

export const accountFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		description: 'Account address',
		displayOptions: { show: { resource: ['account'] } },
	},
	{
		displayName: 'Token Address',
		name: 'tokenAddress',
		type: 'string',
		default: '',
		description: 'Token contract address',
		displayOptions: { show: { resource: ['account'], operation: ['getTokenBalances'] } },
	},
	{
		displayName: 'To Address',
		name: 'to',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['account'], operation: ['estimateGas'] } },
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '0x',
		displayOptions: { show: { resource: ['account'], operation: ['estimateGas'] } },
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '0',
		displayOptions: { show: { resource: ['account'], operation: ['estimateGas'] } },
	},
];

export async function executeAccountOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const address = this.getNodeParameter('address', index) as string;
	
	if (!isValidAddress(address)) {
		throw new Error('Invalid address');
	}

	switch (operation) {
		case 'getBalance': {
			const balance = await client.getBalance(address);
			returnData.push({ json: { 
				address, 
				balance: balance.toString(),
				formatted: formatUnits(balance, 18),
			} });
			break;
		}

		case 'getTokenBalances': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index, '') as string;
			if (tokenAddress && isValidAddress(tokenAddress)) {
				const balance = await client.getTokenBalance(tokenAddress, address);
				returnData.push({ json: { address, tokenAddress, balance: balance.toString() } });
			} else {
				returnData.push({ json: { address, message: 'Provide token address for specific balance' } });
			}
			break;
		}

		case 'getTransactionCount': {
			const count = await client.getTransactionCount(address);
			returnData.push({ json: { address, transactionCount: count } });
			break;
		}

		case 'getAccountInfo': {
			const balance = await client.getBalance(address);
			const nonce = await client.getTransactionCount(address);
			returnData.push({ json: { 
				address, 
				balance: balance.toString(),
				formattedBalance: formatUnits(balance, 18),
				nonce,
			} });
			break;
		}

		case 'getBgtBalance': {
			const contracts = client.getContracts();
			const bgtContract = new Contract(contracts.bgt, BGT_ABI, client.getProvider());
			const balance = await bgtContract.balanceOf(address);
			returnData.push({ json: { 
				address, 
				balance: balance.toString(),
				formatted: formatUnits(balance, 18),
			} });
			break;
		}

		case 'getBoosts': {
			const contracts = client.getContracts();
			const bgtContract = new Contract(contracts.bgt, BGT_ABI, client.getProvider());
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

		case 'estimateGas': {
			const to = this.getNodeParameter('to', index) as string;
			const data = this.getNodeParameter('data', index) as string;
			const value = this.getNodeParameter('value', index) as string;
			const gas = await client.estimateGas({ from: address, to, data, value });
			returnData.push({ json: { address, estimatedGas: gas.toString() } });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
