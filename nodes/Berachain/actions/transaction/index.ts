/**
 * Transaction Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { serializeTransaction, serializeReceipt, serializeObject } from '../../utils/serializeUtils';
import { isValidAddress } from '../../utils/addressUtils';
import { parseUnits } from 'ethers';

export const transactionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['transaction'] } },
		options: [
			{ name: 'Send BERA', value: 'sendBera', description: 'Send BERA', action: 'Send BERA' },
			{ name: 'Send Transaction', value: 'sendTransaction', description: 'Send transaction', action: 'Send transaction' },
			{ name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction', action: 'Get transaction' },
			{ name: 'Get Receipt', value: 'getReceipt', description: 'Get receipt', action: 'Get receipt' },
			{ name: 'Wait For Transaction', value: 'waitForTransaction', description: 'Wait for confirmation', action: 'Wait for transaction' },
			{ name: 'Get Gas Price', value: 'getGasPrice', description: 'Get gas price', action: 'Get gas price' },
			{ name: 'Get Fee Data', value: 'getFeeData', description: 'Get fee data', action: 'Get fee data' },
		],
		default: 'getTransaction',
	},
];

export const transactionFields: INodeProperties[] = [
	{
		displayName: 'To Address',
		name: 'to',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['transaction'], operation: ['sendBera', 'sendTransaction'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '0',
		displayOptions: { show: { resource: ['transaction'], operation: ['sendBera'] } },
	},
	{
		displayName: 'Transaction Hash',
		name: 'txHash',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['transaction'], operation: ['getTransaction', 'getReceipt', 'waitForTransaction'] } },
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '0x',
		displayOptions: { show: { resource: ['transaction'], operation: ['sendTransaction'] } },
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '0',
		displayOptions: { show: { resource: ['transaction'], operation: ['sendTransaction'] } },
	},
];

export async function executeTransactionOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	switch (operation) {
		case 'sendBera': {
			const to = this.getNodeParameter('to', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(to)) throw new Error('Invalid to address');
			const result = await client.sendTransaction({ to, value: parseUnits(amount, 18) });
			returnData.push({ json: serializeObject({ hash: result.hash, to, amount }) as IDataObject });
			break;
		}

		case 'sendTransaction': {
			const to = this.getNodeParameter('to', index) as string;
			const data = this.getNodeParameter('data', index) as string;
			const value = this.getNodeParameter('value', index) as string;
			if (!isValidAddress(to)) throw new Error('Invalid to address');
			const result = await client.sendTransaction({ to, data, value: parseUnits(value, 18) });
			returnData.push({ json: serializeObject({ hash: result.hash, to }) as IDataObject });
			break;
		}

		case 'getTransaction': {
			const txHash = this.getNodeParameter('txHash', index) as string;
			const tx = await client.getTransaction(txHash);
			returnData.push({ json: serializeTransaction(tx) });
			break;
		}

		case 'getReceipt': {
			const txHash = this.getNodeParameter('txHash', index) as string;
			const receipt = await client.getTransactionReceipt(txHash);
			returnData.push({ json: serializeReceipt(receipt) });
			break;
		}

		case 'waitForTransaction': {
			const txHash = this.getNodeParameter('txHash', index) as string;
			const receipt = await client.waitForTransaction(txHash);
			returnData.push({ json: serializeReceipt(receipt) });
			break;
		}

		case 'getGasPrice': {
			const gasPrice = await client.getGasPrice();
			returnData.push({ json: { gasPrice: gasPrice.toString() } });
			break;
		}

		case 'getFeeData': {
			const feeData = await client.getFeeData();
			returnData.push({ json: serializeObject({
				gasPrice: feeData.gasPrice?.toString(),
				maxFeePerGas: feeData.maxFeePerGas?.toString(),
				maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
			}) as IDataObject });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
