/**
 * Token Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { serializeObject } from '../../utils/serializeUtils';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { parseUnits, formatUnits } from 'ethers';

export const tokenOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['token'] } },
		options: [
			{ name: 'Get Info', value: 'getInfo', description: 'Get token info', action: 'Get info' },
			{ name: 'Get Balance', value: 'getBalance', description: 'Get token balance', action: 'Get balance' },
			{ name: 'Transfer', value: 'transfer', description: 'Transfer tokens', action: 'Transfer' },
			{ name: 'Approve', value: 'approve', description: 'Approve token spending', action: 'Approve' },
			{ name: 'Get Allowance', value: 'getAllowance', description: 'Get token allowance', action: 'Get allowance' },
		],
		default: 'getInfo',
	},
];

export const tokenFields: INodeProperties[] = [
	{
		displayName: 'Token Address',
		name: 'tokenAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Token contract address',
		displayOptions: { show: { resource: ['token'] } },
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Account address',
		displayOptions: { show: { resource: ['token'], operation: ['getBalance', 'getAllowance'] } },
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
		displayOptions: { show: { resource: ['token'], operation: ['transfer'] } },
	},
	{
		displayName: 'Spender Address',
		name: 'spenderAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Spender address',
		displayOptions: { show: { resource: ['token'], operation: ['approve', 'getAllowance'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount of tokens',
		displayOptions: { show: { resource: ['token'], operation: ['transfer', 'approve'] } },
	},
];

export async function executeTokenOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	switch (operation) {
		case 'getInfo': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			if (!isValidAddress(tokenAddress)) throw new Error('Invalid token address');
			const info = await client.getTokenInfo(tokenAddress);
			returnData.push({ json: { address: tokenAddress, ...info } });
			break;
		}

		case 'getBalance': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(tokenAddress) || !isValidAddress(address)) throw new Error('Invalid address');
			const balance = await client.getTokenBalance(tokenAddress, address);
			const info = await client.getTokenInfo(tokenAddress);
			returnData.push({ json: { token: tokenAddress, account: address, balance: balance.toString(), formatted: formatUnits(balance, info.decimals), symbol: info.symbol } });
			break;
		}

		case 'transfer': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(tokenAddress) || !isValidAddress(toAddress)) throw new Error('Invalid address');
			const info = await client.getTokenInfo(tokenAddress);
			const tx = await client.transferToken(tokenAddress, toAddress, parseUnits(amount, info.decimals).toString());
			returnData.push({ json: { txHash: tx.hash, token: tokenAddress, to: toAddress, amount, status: 'pending' } });
			break;
		}

		case 'approve': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const spenderAddress = this.getNodeParameter('spenderAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(tokenAddress) || !isValidAddress(spenderAddress)) throw new Error('Invalid address');
			const info = await client.getTokenInfo(tokenAddress);
			const tx = await client.approveToken(tokenAddress, spenderAddress, parseUnits(amount, info.decimals).toString());
			returnData.push({ json: { txHash: tx.hash, token: tokenAddress, spender: spenderAddress, amount, status: 'pending' } });
			break;
		}

		case 'getAllowance': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const address = this.getNodeParameter('address', index) as string;
			const spenderAddress = this.getNodeParameter('spenderAddress', index) as string;
			if (!isValidAddress(tokenAddress) || !isValidAddress(address) || !isValidAddress(spenderAddress)) throw new Error('Invalid address');
			const allowance = await client.getTokenAllowance(tokenAddress, address, spenderAddress);
			const info = await client.getTokenInfo(tokenAddress);
			returnData.push({ json: { token: tokenAddress, owner: address, spender: spenderAddress, allowance: allowance.toString(), formatted: formatUnits(allowance, info.decimals) } });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
