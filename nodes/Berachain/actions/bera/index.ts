/**
 * BERA Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { serializeObject } from '../../utils/serializeUtils';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { parseUnits, formatUnits } from 'ethers';

export const beraOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bera'] } },
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get BERA balance', action: 'Get balance' },
			{ name: 'Transfer', value: 'transfer', description: 'Transfer BERA', action: 'Transfer' },
			{ name: 'Wrap', value: 'wrap', description: 'Wrap BERA to WBERA', action: 'Wrap' },
			{ name: 'Unwrap', value: 'unwrap', description: 'Unwrap WBERA to BERA', action: 'Unwrap' },
			{ name: 'Get WBERA Balance', value: 'getWberaBalance', description: 'Get WBERA balance', action: 'Get WBERA balance' },
		],
		default: 'getBalance',
	},
];

export const beraFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Account address',
		displayOptions: { show: { resource: ['bera'], operation: ['getBalance', 'getWberaBalance'] } },
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
		displayOptions: { show: { resource: ['bera'], operation: ['transfer'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.0',
		description: 'Amount in BERA',
		displayOptions: { show: { resource: ['bera'], operation: ['transfer', 'wrap', 'unwrap'] } },
	},
];

export async function executeBeraOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	switch (operation) {
		case 'getBalance': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const balance = await client.getBalance(address);
			returnData.push({ json: { address, balance: balance.toString(), formatted: formatUnits(balance, 18), symbol: 'BERA' } });
			break;
		}

		case 'transfer': {
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(toAddress)) throw new Error('Invalid recipient');
			const tx = await client.sendBera(toAddress, parseUnits(amount, 18).toString());
			returnData.push({ json: { txHash: tx.hash, to: toAddress, amount, status: 'pending' } });
			break;
		}

		case 'wrap': {
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.wrapBera(parseUnits(amount, 18).toString());
			returnData.push({ json: { txHash: tx.hash, amount, action: 'wrap', status: 'pending' } });
			break;
		}

		case 'unwrap': {
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.unwrapBera(parseUnits(amount, 18).toString());
			returnData.push({ json: { txHash: tx.hash, amount, action: 'unwrap', status: 'pending' } });
			break;
		}

		case 'getWberaBalance': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const balance = await client.getWberaBalance(address);
			returnData.push({ json: { address, balance: balance.toString(), formatted: formatUnits(balance, 18), symbol: 'WBERA' } });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
