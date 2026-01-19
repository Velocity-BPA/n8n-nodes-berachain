/**
 * Block Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { serializeBlock } from '../../utils/serializeUtils';

export const blockOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['block'] } },
		options: [
			{ name: 'Get Latest Block', value: 'getLatestBlock', description: 'Get latest block', action: 'Get latest block' },
			{ name: 'Get Block By Number', value: 'getBlockByNumber', description: 'Get block by number', action: 'Get block by number' },
			{ name: 'Get Block Number', value: 'getBlockNumber', description: 'Get current block number', action: 'Get block number' },
			{ name: 'Get Block With Transactions', value: 'getBlockWithTx', description: 'Get block with transactions', action: 'Get block with transactions' },
		],
		default: 'getLatestBlock',
	},
];

export const blockFields: INodeProperties[] = [
	{
		displayName: 'Block Number',
		name: 'blockNumber',
		type: 'number',
		required: true,
		default: 0,
		description: 'Block number',
		displayOptions: { show: { resource: ['block'], operation: ['getBlockByNumber', 'getBlockWithTx'] } },
	},
];

export async function executeBlockOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	switch (operation) {
		case 'getLatestBlock': {
			const block = await client.getBlock('latest');
			returnData.push({ json: serializeBlock(block) });
			break;
		}

		case 'getBlockByNumber': {
			const blockNumber = this.getNodeParameter('blockNumber', index) as number;
			const block = await client.getBlock(blockNumber);
			returnData.push({ json: serializeBlock(block) });
			break;
		}

		case 'getBlockNumber': {
			const blockNumber = await client.getBlockNumber();
			returnData.push({ json: { blockNumber: blockNumber.toString() } });
			break;
		}

		case 'getBlockWithTx': {
			const blockNumber = this.getNodeParameter('blockNumber', index) as number;
			const block = await client.getBlockWithTransactions(blockNumber);
			returnData.push({ json: serializeBlock(block) });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
