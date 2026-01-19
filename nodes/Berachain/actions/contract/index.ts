/**
 * Contract Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { Contract, Interface } from 'ethers';
import { ERC20_ABI } from '../../constants/abis';

export const contractOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contract'] } },
		options: [
			{ name: 'Read', value: 'read', description: 'Read from contract', action: 'Read' },
			{ name: 'Write', value: 'write', description: 'Write to contract', action: 'Write' },
			{ name: 'Get Code', value: 'getCode', description: 'Get contract bytecode', action: 'Get code' },
			{ name: 'Encode Function', value: 'encodeFunction', description: 'Encode function call data', action: 'Encode function' },
			{ name: 'Decode Function', value: 'decodeFunction', description: 'Decode function call data', action: 'Decode function' },
		],
		default: 'read',
	},
];

export const contractFields: INodeProperties[] = [
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['contract'], operation: ['read', 'write', 'getCode'] } },
		description: 'The contract address',
	},
	{
		displayName: 'ABI',
		name: 'abi',
		type: 'json',
		required: true,
		default: '[]',
		displayOptions: { show: { resource: ['contract'], operation: ['read', 'write', 'encodeFunction', 'decodeFunction'] } },
		description: 'Contract ABI as JSON array',
	},
	{
		displayName: 'Function Name',
		name: 'functionName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['contract'], operation: ['read', 'write', 'encodeFunction'] } },
		description: 'Name of the function to call',
	},
	{
		displayName: 'Function Arguments',
		name: 'functionArgs',
		type: 'json',
		default: '[]',
		displayOptions: { show: { resource: ['contract'], operation: ['read', 'write', 'encodeFunction'] } },
		description: 'Function arguments as JSON array',
	},
	{
		displayName: 'Encoded Data',
		name: 'encodedData',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['contract'], operation: ['decodeFunction'] } },
		description: 'Encoded function call data to decode',
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

export async function executeContractOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();
	const wallet = client.getWallet();

	switch (operation) {
		case 'read': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const abiJson = this.getNodeParameter('abi', index) as string;
			const functionName = this.getNodeParameter('functionName', index) as string;
			const argsJson = this.getNodeParameter('functionArgs', index, '[]') as string;
			
			if (!isValidAddress(contractAddress)) throw new Error('Invalid contract address');
			
			const abi = typeof abiJson === 'string' ? JSON.parse(abiJson) : abiJson;
			const args = typeof argsJson === 'string' ? JSON.parse(argsJson) : argsJson;
			
			const contract = new Contract(contractAddress, abi, provider);
			const result = await contract[functionName](...args);
			
			returnData.push({
				json: {
					contract: contractAddress,
					function: functionName,
					result: serializeResult(result),
				},
			});
			break;
		}

		case 'write': {
			if (!wallet) throw new Error('Wallet required for write operations');
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const abiJson = this.getNodeParameter('abi', index) as string;
			const functionName = this.getNodeParameter('functionName', index) as string;
			const argsJson = this.getNodeParameter('functionArgs', index, '[]') as string;
			
			if (!isValidAddress(contractAddress)) throw new Error('Invalid contract address');
			
			const abi = typeof abiJson === 'string' ? JSON.parse(abiJson) : abiJson;
			const args = typeof argsJson === 'string' ? JSON.parse(argsJson) : argsJson;
			
			const contract = new Contract(contractAddress, abi, wallet);
			const tx = await contract[functionName](...args);
			const receipt = await tx.wait();
			
			returnData.push({
				json: {
					success: true,
					contract: contractAddress,
					function: functionName,
					transactionHash: receipt.hash,
					blockNumber: receipt.blockNumber,
					gasUsed: receipt.gasUsed.toString(),
				},
			});
			break;
		}

		case 'getCode': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			if (!isValidAddress(contractAddress)) throw new Error('Invalid contract address');
			
			const code = await provider.getCode(contractAddress);
			returnData.push({
				json: {
					address: contractAddress,
					code,
					hasCode: code !== '0x',
					codeLength: code.length > 2 ? (code.length - 2) / 2 : 0,
				},
			});
			break;
		}

		case 'encodeFunction': {
			const abiJson = this.getNodeParameter('abi', index) as string;
			const functionName = this.getNodeParameter('functionName', index) as string;
			const argsJson = this.getNodeParameter('functionArgs', index, '[]') as string;
			
			const abi = typeof abiJson === 'string' ? JSON.parse(abiJson) : abiJson;
			const args = typeof argsJson === 'string' ? JSON.parse(argsJson) : argsJson;
			
			const iface = new Interface(abi);
			const encoded = iface.encodeFunctionData(functionName, args);
			
			returnData.push({
				json: {
					function: functionName,
					encodedData: encoded,
				},
			});
			break;
		}

		case 'decodeFunction': {
			const abiJson = this.getNodeParameter('abi', index) as string;
			const encodedData = this.getNodeParameter('encodedData', index) as string;
			
			const abi = typeof abiJson === 'string' ? JSON.parse(abiJson) : abiJson;
			const iface = new Interface(abi);
			
			const decoded = iface.parseTransaction({ data: encodedData });
			if (!decoded) throw new Error('Failed to decode function data');
			
			returnData.push({
				json: {
					functionName: decoded.name,
					signature: decoded.signature,
					args: serializeResult(decoded.args),
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
