/**
 * Utility Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { serializeObject } from '../../utils/serializeUtils';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress, getChecksumAddress, shortenAddress } from '../../utils/addressUtils';
import { keccak256 } from '../../utils/encodingUtils';
import { parseUnits, formatUnits } from 'ethers';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['utility'] } },
		options: [
			{ name: 'Validate Address', value: 'validateAddress', description: 'Validate an address', action: 'Validate address' },
			{ name: 'Checksum Address', value: 'checksumAddress', description: 'Get checksummed address', action: 'Checksum address' },
			{ name: 'Convert Units', value: 'convertUnits', description: 'Convert between units', action: 'Convert units' },
			{ name: 'Hash Data', value: 'hashData', description: 'Keccak256 hash data', action: 'Hash data' },
			{ name: 'Get Chain ID', value: 'getChainId', description: 'Get current chain ID', action: 'Get chain ID' },
			{ name: 'Test Connection', value: 'testConnection', description: 'Test RPC connection', action: 'Test connection' },
		],
		default: 'validateAddress',
	},
];

export const utilityFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Address to validate or checksum',
		displayOptions: { show: { resource: ['utility'], operation: ['validateAddress', 'checksumAddress'] } },
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		required: true,
		default: '',
		description: 'Value to convert',
		displayOptions: { show: { resource: ['utility'], operation: ['convertUnits'] } },
	},
	{
		displayName: 'From Unit',
		name: 'fromUnit',
		type: 'options',
		options: [
			{ name: 'Wei', value: '0' },
			{ name: 'Gwei', value: '9' },
			{ name: 'Ether', value: '18' },
		],
		default: '18',
		description: 'Source unit',
		displayOptions: { show: { resource: ['utility'], operation: ['convertUnits'] } },
	},
	{
		displayName: 'To Unit',
		name: 'toUnit',
		type: 'options',
		options: [
			{ name: 'Wei', value: '0' },
			{ name: 'Gwei', value: '9' },
			{ name: 'Ether', value: '18' },
		],
		default: '0',
		description: 'Target unit',
		displayOptions: { show: { resource: ['utility'], operation: ['convertUnits'] } },
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		required: true,
		default: '',
		description: 'Data to hash (text or hex)',
		displayOptions: { show: { resource: ['utility'], operation: ['hashData'] } },
	},
];

export async function executeUtilityOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	switch (operation) {
		case 'validateAddress': {
			const address = this.getNodeParameter('address', index) as string;
			const isValid = isValidAddress(address);
			returnData.push({ json: { 
				address, 
				isValid, 
				checksummed: isValid ? getChecksumAddress(address) : null,
				shortened: isValid ? shortenAddress(address) : null,
			} });
			break;
		}

		case 'checksumAddress': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) {
				throw new Error('Invalid address');
			}
			const checksummed = getChecksumAddress(address);
			returnData.push({ json: { original: address, checksummed, shortened: shortenAddress(checksummed) } });
			break;
		}

		case 'convertUnits': {
			const value = this.getNodeParameter('value', index) as string;
			const fromUnit = parseInt(this.getNodeParameter('fromUnit', index) as string);
			const toUnit = parseInt(this.getNodeParameter('toUnit', index) as string);
			
			// Convert to wei first, then to target
			let weiValue: bigint;
			if (fromUnit === 0) {
				weiValue = BigInt(value);
			} else {
				weiValue = parseUnits(value, fromUnit);
			}
			
			let result: string;
			if (toUnit === 0) {
				result = weiValue.toString();
			} else {
				result = formatUnits(weiValue, toUnit);
			}
			
			returnData.push({ json: { input: value, fromUnit, toUnit, result, weiValue: weiValue.toString() } });
			break;
		}

		case 'hashData': {
			const data = this.getNodeParameter('data', index) as string;
			const hash = keccak256(data);
			returnData.push({ json: { input: data, hash } });
			break;
		}

		case 'getChainId': {
			const chainId = await client.getChainId();
			const networkInfo = await client.getNetworkInfo();
			returnData.push({ json: { chainId: chainId.toString(), networkName: networkInfo.name || 'unknown' } });
			break;
		}

		case 'testConnection': {
			const connected = await client.testConnection();
			const chainId = await client.getChainId();
			const blockNumber = await client.getBlockNumber();
			returnData.push({ json: { connected, chainId: chainId.toString(), blockNumber: blockNumber.toString() } });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
