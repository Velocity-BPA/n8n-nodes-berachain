/**
 * Event Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { Interface } from 'ethers';

export const eventOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['event'] } },
		options: [
			{ name: 'Get Logs', value: 'getLogs', description: 'Get event logs', action: 'Get logs' },
			{ name: 'Parse Log', value: 'parseLog', description: 'Parse event log data', action: 'Parse log' },
			{ name: 'Get Topic Hash', value: 'getTopicHash', description: 'Get event topic hash', action: 'Get topic hash' },
		],
		default: 'getLogs',
	},
];

export const eventFields: INodeProperties[] = [
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['event'], operation: ['getLogs'] } },
		description: 'Contract address to filter logs',
	},
	{
		displayName: 'Topics',
		name: 'topics',
		type: 'json',
		default: '[]',
		displayOptions: { show: { resource: ['event'], operation: ['getLogs'] } },
		description: 'Event topics as JSON array',
	},
	{
		displayName: 'From Block',
		name: 'fromBlock',
		type: 'string',
		default: 'latest',
		displayOptions: { show: { resource: ['event'], operation: ['getLogs'] } },
		description: 'Starting block number or "latest"',
	},
	{
		displayName: 'To Block',
		name: 'toBlock',
		type: 'string',
		default: 'latest',
		displayOptions: { show: { resource: ['event'], operation: ['getLogs'] } },
		description: 'Ending block number or "latest"',
	},
	{
		displayName: 'ABI',
		name: 'abi',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: { show: { resource: ['event'], operation: ['parseLog', 'getTopicHash'] } },
		description: 'Contract ABI as JSON array',
	},
	{
		displayName: 'Log Data',
		name: 'logData',
		type: 'json',
		required: true,
		default: '{}',
		displayOptions: { show: { resource: ['event'], operation: ['parseLog'] } },
		description: 'Log object with topics and data',
	},
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['event'], operation: ['getTopicHash'] } },
		description: 'Name of the event',
	},
];

function serializeResult(value: unknown): string | number | boolean | null | Record<string, unknown> | unknown[] {
	if (typeof value === 'bigint') {
		return value.toString();
	}
	if (Array.isArray(value)) {
		return value.map(serializeResult);
	}
	if (value && typeof value === 'object') {
		const obj: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) {
			obj[k] = serializeResult(v);
		}
		return obj;
	}
	return value as string | number | boolean | null;
}

export async function executeEventOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();

	switch (operation) {
		case 'getLogs': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const topicsJson = this.getNodeParameter('topics', index, '[]') as string;
			const fromBlock = this.getNodeParameter('fromBlock', index, 'latest') as string;
			const toBlock = this.getNodeParameter('toBlock', index, 'latest') as string;
			
			if (contractAddress && !isValidAddress(contractAddress)) {
				throw new Error('Invalid contract address');
			}
			
			const topics = typeof topicsJson === 'string' ? JSON.parse(topicsJson) : topicsJson;
			
			const filter: {
				address?: string;
				topics?: (string | null)[];
				fromBlock: string | number;
				toBlock: string | number;
			} = {
				fromBlock: fromBlock === 'latest' ? 'latest' : parseInt(fromBlock, 10),
				toBlock: toBlock === 'latest' ? 'latest' : parseInt(toBlock, 10),
			};
			
			if (contractAddress) {
				filter.address = contractAddress;
			}
			if (topics && topics.length > 0) {
				filter.topics = topics;
			}
			
			const logs = await provider.getLogs(filter);
			
			returnData.push({
				json: {
					logs: logs.map(log => ({
						address: log.address,
						topics: log.topics,
						data: log.data,
						blockNumber: log.blockNumber,
						blockHash: log.blockHash,
						transactionHash: log.transactionHash,
						transactionIndex: log.transactionIndex,
						logIndex: log.index,
					})),
					count: logs.length,
				},
			});
			break;
		}

		case 'parseLog': {
			const abiJson = this.getNodeParameter('abi', index) as string;
			const logDataJson = this.getNodeParameter('logData', index) as string;
			
			const abi = typeof abiJson === 'string' ? JSON.parse(abiJson) : abiJson;
			const logData = typeof logDataJson === 'string' ? JSON.parse(logDataJson) : logDataJson;
			
			const iface = new Interface(abi);
			const parsed = iface.parseLog({
				topics: logData.topics as string[],
				data: logData.data as string,
			});
			
			if (!parsed) throw new Error('Failed to parse log');
			
			returnData.push({
				json: {
					eventName: parsed.name,
					signature: parsed.signature,
					args: serializeResult(parsed.args),
				},
			});
			break;
		}

		case 'getTopicHash': {
			const abiJson = this.getNodeParameter('abi', index) as string;
			const eventName = this.getNodeParameter('eventName', index) as string;
			
			const abi = typeof abiJson === 'string' ? JSON.parse(abiJson) : abiJson;
			const iface = new Interface(abi);
			
			const eventFragment = iface.getEvent(eventName);
			if (!eventFragment) throw new Error(`Event ${eventName} not found in ABI`);
			
			// In ethers v6, use the topicHash property on the fragment
			const topicHash = eventFragment.topicHash;
			
			returnData.push({
				json: {
					eventName,
					signature: eventFragment.format(),
					topicHash,
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
