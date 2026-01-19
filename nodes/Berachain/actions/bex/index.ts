/**
 * BEX (DEX) Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, parseUnits, Contract } from 'ethers';
import { BEX_ROUTER_ABI, ERC20_ABI } from '../../constants/abis';

export const bexOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bex'] } },
		options: [
			{ name: 'Get Pool', value: 'getPool', description: 'Get pool info', action: 'Get pool' },
			{ name: 'Get Pools', value: 'getPools', description: 'List pools', action: 'Get pools' },
			{ name: 'Get Quote', value: 'getQuote', description: 'Get swap quote', action: 'Get quote' },
			{ name: 'Swap', value: 'swap', description: 'Execute swap', action: 'Swap' },
			{ name: 'Add Liquidity', value: 'addLiquidity', description: 'Add liquidity', action: 'Add liquidity' },
			{ name: 'Remove Liquidity', value: 'removeLiquidity', description: 'Remove liquidity', action: 'Remove liquidity' },
		],
		default: 'getPool',
	},
];

export const bexFields: INodeProperties[] = [
	{
		displayName: 'Pool Address',
		name: 'poolAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bex'], operation: ['getPool', 'addLiquidity', 'removeLiquidity'] } },
	},
	{
		displayName: 'Token In',
		name: 'tokenIn',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bex'], operation: ['getQuote', 'swap'] } },
	},
	{
		displayName: 'Token Out',
		name: 'tokenOut',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['bex'], operation: ['getQuote', 'swap'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '0',
		displayOptions: { show: { resource: ['bex'], operation: ['getQuote', 'swap', 'addLiquidity', 'removeLiquidity'] } },
	},
	{
		displayName: 'Slippage (%)',
		name: 'slippage',
		type: 'number',
		default: 0.5,
		displayOptions: { show: { resource: ['bex'], operation: ['swap', 'addLiquidity', 'removeLiquidity'] } },
	},
];

export async function executeBexOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const contracts = client.getContracts();
	const provider = client.getProvider();
	const wallet = client.getWallet();

	switch (operation) {
		case 'getPool': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			if (!isValidAddress(poolAddress)) throw new Error('Invalid pool address');
			
			// Basic pool info from ERC20 interface
			const poolContract = new Contract(poolAddress, ERC20_ABI, provider);
			try {
				const [name, symbol, totalSupply] = await Promise.all([
					poolContract.name(),
					poolContract.symbol(),
					poolContract.totalSupply(),
				]);
				returnData.push({ json: {
					address: poolAddress,
					name,
					symbol,
					totalSupply: totalSupply.toString(),
				} });
			} catch {
				returnData.push({ json: { address: poolAddress, error: 'Unable to fetch pool info' } });
			}
			break;
		}

		case 'getPools': {
			// Return placeholder - would need indexer for real implementation
			returnData.push({ json: { 
				message: 'Pool listing requires indexer integration',
				bexRouter: contracts.bexRouter,
			} });
			break;
		}

		case 'getQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(tokenIn) || !isValidAddress(tokenOut)) {
				throw new Error('Invalid token address');
			}

			// Get token decimals
			const tokenInContract = new Contract(tokenIn, ERC20_ABI, provider);
			const decimals = await tokenInContract.decimals();
			const amountIn = parseUnits(amount, decimals);

			returnData.push({ json: {
				tokenIn,
				tokenOut,
				amountIn: amountIn.toString(),
				message: 'Quote requires DEX router integration',
			} });
			break;
		}

		case 'swap': {
			if (!wallet) throw new Error('Wallet required for swap');
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const slippage = this.getNodeParameter('slippage', index) as number;

			if (!isValidAddress(tokenIn) || !isValidAddress(tokenOut)) {
				throw new Error('Invalid token address');
			}

			const tokenInContract = new Contract(tokenIn, ERC20_ABI, provider);
			const decimals = await tokenInContract.decimals();
			const amountIn = parseUnits(amount, decimals);

			returnData.push({ json: {
				tokenIn,
				tokenOut,
				amountIn: amountIn.toString(),
				slippage,
				message: 'Swap execution requires router contract integration',
			} });
			break;
		}

		case 'addLiquidity': {
			if (!wallet) throw new Error('Wallet required for adding liquidity');
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			returnData.push({ json: {
				poolAddress,
				amount,
				message: 'Add liquidity requires pool contract integration',
			} });
			break;
		}

		case 'removeLiquidity': {
			if (!wallet) throw new Error('Wallet required for removing liquidity');
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			returnData.push({ json: {
				poolAddress,
				amount,
				message: 'Remove liquidity requires pool contract integration',
			} });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
