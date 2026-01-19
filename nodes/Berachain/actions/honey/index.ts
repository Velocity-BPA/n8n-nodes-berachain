/**
 * HONEY Stablecoin Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, parseUnits, Contract } from 'ethers';
import { HONEY_ABI, ERC20_ABI } from '../../constants/abis';

export const honeyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['honey'] } },
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get HONEY balance', action: 'Get balance' },
			{ name: 'Get Info', value: 'getInfo', description: 'Get HONEY info', action: 'Get info' },
			{ name: 'Mint', value: 'mint', description: 'Mint HONEY', action: 'Mint' },
			{ name: 'Redeem', value: 'redeem', description: 'Redeem HONEY', action: 'Redeem' },
			{ name: 'Transfer', value: 'transfer', description: 'Transfer HONEY', action: 'Transfer' },
		],
		default: 'getBalance',
	},
];

export const honeyFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['honey'], operation: ['getBalance'] } },
	},
	{
		displayName: 'Collateral Address',
		name: 'collateral',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['honey'], operation: ['mint', 'redeem'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '0',
		displayOptions: { show: { resource: ['honey'], operation: ['mint', 'redeem', 'transfer'] } },
	},
	{
		displayName: 'To Address',
		name: 'to',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['honey'], operation: ['transfer'] } },
	},
];

export async function executeHoneyOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const contracts = client.getContracts();
	const provider = client.getProvider();
	const wallet = client.getWallet();
	const honeyContract = new Contract(contracts.honey, ERC20_ABI, wallet || provider);

	switch (operation) {
		case 'getBalance': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const balance = await honeyContract.balanceOf(address);
			returnData.push({ json: { 
				address, 
				balance: balance.toString(),
				formatted: formatUnits(balance, 18),
			} });
			break;
		}

		case 'getInfo': {
			const [name, symbol, totalSupply, decimals] = await Promise.all([
				honeyContract.name(),
				honeyContract.symbol(),
				honeyContract.totalSupply(),
				honeyContract.decimals(),
			]);
			returnData.push({ json: {
				address: contracts.honey,
				name,
				symbol,
				decimals: Number(decimals),
				totalSupply: totalSupply.toString(),
				formattedSupply: formatUnits(totalSupply, decimals),
			} });
			break;
		}

		case 'mint': {
			if (!wallet) throw new Error('Wallet required for minting');
			const collateral = this.getNodeParameter('collateral', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(collateral)) throw new Error('Invalid collateral address');
			
			returnData.push({ json: {
				collateral,
				amount,
				honeyFactory: contracts.honeyFactory,
				message: 'Minting requires HoneyFactory contract integration',
			} });
			break;
		}

		case 'redeem': {
			if (!wallet) throw new Error('Wallet required for redeeming');
			const collateral = this.getNodeParameter('collateral', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(collateral)) throw new Error('Invalid collateral address');
			
			returnData.push({ json: {
				collateral,
				amount: parseUnits(amount, 18).toString(),
				honeyFactory: contracts.honeyFactory,
				message: 'Redeeming requires HoneyFactory contract integration',
			} });
			break;
		}

		case 'transfer': {
			if (!wallet) throw new Error('Wallet required for transfer');
			const to = this.getNodeParameter('to', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(to)) throw new Error('Invalid recipient address');
			
			const tx = await honeyContract.transfer(to, parseUnits(amount, 18));
			const receipt = await tx.wait();
			returnData.push({ json: {
				success: true,
				to,
				amount,
				transactionHash: receipt.hash,
			} });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
