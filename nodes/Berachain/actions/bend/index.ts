/**
 * Bend Lending Protocol Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, parseUnits, Contract } from 'ethers';
import { ERC20_ABI } from '../../constants/abis';

export const bendOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bend'] } },
		options: [
			{ name: 'Get Markets', value: 'getMarkets', description: 'List lending markets', action: 'Get markets' },
			{ name: 'Get User Position', value: 'getUserPosition', description: 'Get user lending position', action: 'Get user position' },
			{ name: 'Supply', value: 'supply', description: 'Supply assets', action: 'Supply' },
			{ name: 'Withdraw', value: 'withdraw', description: 'Withdraw assets', action: 'Withdraw' },
			{ name: 'Borrow', value: 'borrow', description: 'Borrow assets', action: 'Borrow' },
			{ name: 'Repay', value: 'repay', description: 'Repay borrowed assets', action: 'Repay' },
		],
		default: 'getMarkets',
	},
];

export const bendFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bend'], operation: ['getUserPosition'] } },
	},
	{
		displayName: 'Asset Address',
		name: 'asset',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bend'], operation: ['supply', 'withdraw', 'borrow', 'repay'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '0',
		displayOptions: { show: { resource: ['bend'], operation: ['supply', 'withdraw', 'borrow', 'repay'] } },
	},
];

export async function executeBendOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();
	const wallet = client.getWallet();

	switch (operation) {
		case 'getMarkets': {
			returnData.push({ json: {
				message: 'Market listing requires Bend protocol indexer integration',
				protocol: 'Bend',
			} });
			break;
		}

		case 'getUserPosition': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			
			returnData.push({ json: {
				address,
				message: 'User position requires Bend protocol integration',
			} });
			break;
		}

		case 'supply': {
			if (!wallet) throw new Error('Wallet required for supply');
			const asset = this.getNodeParameter('asset', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(asset)) throw new Error('Invalid asset address');
			
			const assetContract = new Contract(asset, ERC20_ABI, provider);
			const decimals = await assetContract.decimals();
			
			returnData.push({ json: {
				asset,
				amount: parseUnits(amount, decimals).toString(),
				message: 'Supply requires Bend LendingPool integration',
			} });
			break;
		}

		case 'withdraw': {
			if (!wallet) throw new Error('Wallet required for withdraw');
			const asset = this.getNodeParameter('asset', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(asset)) throw new Error('Invalid asset address');
			
			returnData.push({ json: {
				asset,
				amount,
				message: 'Withdraw requires Bend LendingPool integration',
			} });
			break;
		}

		case 'borrow': {
			if (!wallet) throw new Error('Wallet required for borrow');
			const asset = this.getNodeParameter('asset', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(asset)) throw new Error('Invalid asset address');
			
			returnData.push({ json: {
				asset,
				amount,
				message: 'Borrow requires Bend LendingPool integration',
			} });
			break;
		}

		case 'repay': {
			if (!wallet) throw new Error('Wallet required for repay');
			const asset = this.getNodeParameter('asset', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(asset)) throw new Error('Invalid asset address');
			
			returnData.push({ json: {
				asset,
				amount,
				message: 'Repay requires Bend LendingPool integration',
			} });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
