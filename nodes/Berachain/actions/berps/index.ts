/**
 * Berps Perpetuals Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { parseUnits } from 'ethers';

export const berpsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['berps'] } },
		options: [
			{ name: 'Get Markets', value: 'getMarkets', description: 'List trading pairs', action: 'Get markets' },
			{ name: 'Get Position', value: 'getPosition', description: 'Get trading position', action: 'Get position' },
			{ name: 'Get Positions', value: 'getPositions', description: 'List positions', action: 'Get positions' },
			{ name: 'Open Position', value: 'openPosition', description: 'Open position', action: 'Open position' },
			{ name: 'Close Position', value: 'closePosition', description: 'Close position', action: 'Close position' },
			{ name: 'Get Vault Info', value: 'getVaultInfo', description: 'Get vault info', action: 'Get vault info' },
			{ name: 'Deposit Vault', value: 'depositVault', description: 'Deposit to vault', action: 'Deposit vault' },
			{ name: 'Withdraw Vault', value: 'withdrawVault', description: 'Withdraw from vault', action: 'Withdraw vault' },
		],
		default: 'getMarkets',
	},
];

export const berpsFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['berps'], operation: ['getPosition', 'getPositions'] } },
	},
	{
		displayName: 'Pair Index',
		name: 'pairIndex',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: { show: { resource: ['berps'], operation: ['openPosition', 'closePosition'] } },
	},
	{
		displayName: 'Position Index',
		name: 'positionIndex',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['berps'], operation: ['closePosition'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '0',
		displayOptions: { show: { resource: ['berps'], operation: ['openPosition', 'depositVault', 'withdrawVault'] } },
	},
	{
		displayName: 'Leverage',
		name: 'leverage',
		type: 'number',
		default: 1,
		displayOptions: { show: { resource: ['berps'], operation: ['openPosition'] } },
	},
	{
		displayName: 'Is Long',
		name: 'isLong',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['berps'], operation: ['openPosition'] } },
	},
];

export async function executeBerpsOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const wallet = client.getWallet();

	switch (operation) {
		case 'getMarkets': {
			returnData.push({ json: {
				message: 'Market listing requires Berps protocol integration',
				protocol: 'Berps',
			} });
			break;
		}

		case 'getPosition': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			
			returnData.push({ json: {
				address,
				message: 'Position data requires Berps protocol integration',
			} });
			break;
		}

		case 'getPositions': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			
			returnData.push({ json: {
				address,
				positions: [],
				message: 'Position listing requires Berps protocol integration',
			} });
			break;
		}

		case 'openPosition': {
			if (!wallet) throw new Error('Wallet required for opening position');
			const pairIndex = this.getNodeParameter('pairIndex', index) as number;
			const amount = this.getNodeParameter('amount', index) as string;
			const leverage = this.getNodeParameter('leverage', index) as number;
			const isLong = this.getNodeParameter('isLong', index) as boolean;
			
			returnData.push({ json: {
				pairIndex,
				amount: parseUnits(amount, 18).toString(),
				leverage,
				isLong,
				message: 'Opening position requires Berps Trading contract integration',
			} });
			break;
		}

		case 'closePosition': {
			if (!wallet) throw new Error('Wallet required for closing position');
			const pairIndex = this.getNodeParameter('pairIndex', index) as number;
			const positionIndex = this.getNodeParameter('positionIndex', index) as number;
			
			returnData.push({ json: {
				pairIndex,
				positionIndex,
				message: 'Closing position requires Berps Trading contract integration',
			} });
			break;
		}

		case 'getVaultInfo': {
			returnData.push({ json: {
				message: 'Vault info requires Berps Vault contract integration',
			} });
			break;
		}

		case 'depositVault': {
			if (!wallet) throw new Error('Wallet required for vault deposit');
			const amount = this.getNodeParameter('amount', index) as string;
			
			returnData.push({ json: {
				amount: parseUnits(amount, 18).toString(),
				message: 'Vault deposit requires Berps Vault contract integration',
			} });
			break;
		}

		case 'withdrawVault': {
			if (!wallet) throw new Error('Wallet required for vault withdrawal');
			const amount = this.getNodeParameter('amount', index) as string;
			
			returnData.push({ json: {
				amount: parseUnits(amount, 18).toString(),
				message: 'Vault withdrawal requires Berps Vault contract integration',
			} });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
