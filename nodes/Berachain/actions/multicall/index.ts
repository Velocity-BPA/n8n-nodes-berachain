/**
 * Multicall Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { Contract, Interface } from 'ethers';

const MULTICALL3_ABI = [
	'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
	'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] results)',
	'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] results)',
];

// Multicall3 deployed address (same on most chains)
const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';

export const multicallOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['multicall'] } },
		options: [
			{ name: 'Aggregate', value: 'aggregate', description: 'Batch multiple read calls', action: 'Aggregate' },
			{ name: 'Try Aggregate', value: 'tryAggregate', description: 'Batch calls with failure handling', action: 'Try aggregate' },
		],
		default: 'aggregate',
	},
];

export const multicallFields: INodeProperties[] = [
	{
		displayName: 'Calls',
		name: 'calls',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: { show: { resource: ['multicall'] } },
		description: 'Array of call objects: [{target, abi, functionName, args}]',
	},
	{
		displayName: 'Allow Failures',
		name: 'allowFailures',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['multicall'], operation: ['tryAggregate'] } },
		description: 'Whether to allow individual calls to fail',
	},
];

interface CallConfig {
	target: string;
	abi: unknown[];
	functionName: string;
	args?: unknown[];
}

function serializeResult(value: unknown): unknown {
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
	return value;
}

export async function executeMulticallOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();

	switch (operation) {
		case 'aggregate': {
			const callsJson = this.getNodeParameter('calls', index) as string;
			const callConfigs: CallConfig[] = typeof callsJson === 'string' ? JSON.parse(callsJson) : callsJson;
			
			if (!Array.isArray(callConfigs) || callConfigs.length === 0) {
				throw new Error('Calls must be a non-empty array');
			}
			
			// Encode each call
			const encodedCalls: { target: string; callData: string }[] = [];
			const interfaces: Interface[] = [];
			
			for (const call of callConfigs) {
				if (!isValidAddress(call.target)) {
					throw new Error(`Invalid target address: ${call.target}`);
				}
				const iface = new Interface(call.abi);
				interfaces.push(iface);
				const callData = iface.encodeFunctionData(call.functionName, call.args || []);
				encodedCalls.push({ target: call.target, callData });
			}
			
			// Execute multicall
			const multicall = new Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
			const [blockNumber, returnDatas] = await multicall.aggregate(encodedCalls);
			
			// Decode results
			const results = returnDatas.map((data: string, i: number) => {
				try {
					const decoded = interfaces[i].decodeFunctionResult(callConfigs[i].functionName, data);
					return {
						success: true,
						target: callConfigs[i].target,
						functionName: callConfigs[i].functionName,
						result: serializeResult(decoded.length === 1 ? decoded[0] : decoded),
					};
				} catch (e) {
					return {
						success: false,
						target: callConfigs[i].target,
						functionName: callConfigs[i].functionName,
						error: (e as Error).message,
					};
				}
			});
			
			returnData.push({
				json: {
					blockNumber: blockNumber.toString(),
					results,
				},
			});
			break;
		}

		case 'tryAggregate': {
			const callsJson = this.getNodeParameter('calls', index) as string;
			const allowFailures = this.getNodeParameter('allowFailures', index, true) as boolean;
			const callConfigs: CallConfig[] = typeof callsJson === 'string' ? JSON.parse(callsJson) : callsJson;
			
			if (!Array.isArray(callConfigs) || callConfigs.length === 0) {
				throw new Error('Calls must be a non-empty array');
			}
			
			// Encode each call
			const encodedCalls: { target: string; callData: string }[] = [];
			const interfaces: Interface[] = [];
			
			for (const call of callConfigs) {
				if (!isValidAddress(call.target)) {
					throw new Error(`Invalid target address: ${call.target}`);
				}
				const iface = new Interface(call.abi);
				interfaces.push(iface);
				const callData = iface.encodeFunctionData(call.functionName, call.args || []);
				encodedCalls.push({ target: call.target, callData });
			}
			
			// Execute multicall with try
			const multicall = new Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
			const rawResults = await multicall.tryAggregate(!allowFailures, encodedCalls);
			
			// Decode results
			const results = rawResults.map((result: { success: boolean; returnData: string }, i: number) => {
				if (!result.success) {
					return {
						success: false,
						target: callConfigs[i].target,
						functionName: callConfigs[i].functionName,
						error: 'Call failed',
					};
				}
				try {
					const decoded = interfaces[i].decodeFunctionResult(callConfigs[i].functionName, result.returnData);
					return {
						success: true,
						target: callConfigs[i].target,
						functionName: callConfigs[i].functionName,
						result: serializeResult(decoded.length === 1 ? decoded[0] : decoded),
					};
				} catch (e) {
					return {
						success: false,
						target: callConfigs[i].target,
						functionName: callConfigs[i].functionName,
						error: (e as Error).message,
					};
				}
			});
			
			returnData.push({
				json: {
					results,
					successCount: results.filter((r: { success: boolean }) => r.success).length,
					failureCount: results.filter((r: { success: boolean }) => !r.success).length,
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
