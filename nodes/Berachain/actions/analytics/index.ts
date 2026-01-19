/**
 * Analytics Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, Contract } from 'ethers';
import { ERC20_ABI } from '../../constants/abis';

export const analyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['analytics'] } },
		options: [
			{ name: 'Get Network Stats', value: 'getNetworkStats', description: 'Get network statistics', action: 'Get network stats' },
			{ name: 'Get Gas Stats', value: 'getGasStats', description: 'Get gas price statistics', action: 'Get gas stats' },
			{ name: 'Get Block Stats', value: 'getBlockStats', description: 'Get block statistics', action: 'Get block stats' },
			{ name: 'Get Token Stats', value: 'getTokenStats', description: 'Get token statistics', action: 'Get token stats' },
			{ name: 'Get Address Activity', value: 'getAddressActivity', description: 'Get address activity', action: 'Get address activity' },
		],
		default: 'getNetworkStats',
	},
];

export const analyticsFields: INodeProperties[] = [
	{
		displayName: 'Token Address',
		name: 'tokenAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['getTokenStats'] } },
		description: 'The token contract address',
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['getAddressActivity'] } },
		description: 'The address to analyze',
	},
	{
		displayName: 'Block Count',
		name: 'blockCount',
		type: 'number',
		default: 100,
		displayOptions: { show: { resource: ['analytics'], operation: ['getBlockStats'] } },
		description: 'Number of recent blocks to analyze',
	},
];

export async function executeAnalyticsOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();

	switch (operation) {
		case 'getNetworkStats': {
			const [blockNumber, network, feeData] = await Promise.all([
				provider.getBlockNumber(),
				provider.getNetwork(),
				provider.getFeeData(),
			]);
			
			returnData.push({
				json: {
					blockNumber,
					chainId: network.chainId.toString(),
					networkName: network.name,
					gasPrice: feeData.gasPrice ? feeData.gasPrice.toString() : '0',
					maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas.toString() : '0',
					maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas.toString() : '0',
				},
			});
			break;
		}

		case 'getGasStats': {
			const feeData = await provider.getFeeData();
			const gasPrice = feeData.gasPrice || BigInt(0);
			
			returnData.push({
				json: {
					gasPrice: gasPrice.toString(),
					gasPriceGwei: formatUnits(gasPrice, 'gwei'),
					maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas.toString() : null,
					maxFeePerGasGwei: feeData.maxFeePerGas ? formatUnits(feeData.maxFeePerGas, 'gwei') : null,
					maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas.toString() : null,
					maxPriorityFeePerGasGwei: feeData.maxPriorityFeePerGas ? formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
				},
			});
			break;
		}

		case 'getBlockStats': {
			const blockCount = this.getNodeParameter('blockCount', index, 100) as number;
			const latestBlockNumber = await provider.getBlockNumber();
			const startBlock = Math.max(0, latestBlockNumber - blockCount + 1);
			
			// Get sample of blocks (every 10th block to avoid too many requests)
			const sampleSize = Math.min(10, blockCount);
			const step = Math.floor(blockCount / sampleSize);
			const blockPromises: Promise<unknown>[] = [];
			
			for (let i = 0; i < sampleSize; i++) {
				const blockNum = startBlock + (i * step);
				blockPromises.push(provider.getBlock(blockNum));
			}
			
			const blocks = await Promise.all(blockPromises);
			const validBlocks = blocks.filter(b => b !== null) as Array<{
				timestamp: number;
				gasUsed: bigint;
				gasLimit: bigint;
				transactions: string[];
			}>;
			
			const avgGasUsed = validBlocks.length > 0
				? validBlocks.reduce((sum, b) => sum + b.gasUsed, BigInt(0)) / BigInt(validBlocks.length)
				: BigInt(0);
			
			const avgTxCount = validBlocks.length > 0
				? validBlocks.reduce((sum, b) => sum + b.transactions.length, 0) / validBlocks.length
				: 0;
			
			const avgBlockTime = validBlocks.length > 1
				? (validBlocks[validBlocks.length - 1].timestamp - validBlocks[0].timestamp) / (validBlocks.length - 1)
				: 0;
			
			returnData.push({
				json: {
					latestBlock: latestBlockNumber,
					blocksAnalyzed: validBlocks.length,
					averageGasUsed: avgGasUsed.toString(),
					averageTransactionsPerBlock: Math.round(avgTxCount * 100) / 100,
					averageBlockTime: Math.round(avgBlockTime * 100) / 100,
				},
			});
			break;
		}

		case 'getTokenStats': {
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			if (!isValidAddress(tokenAddress)) throw new Error('Invalid token address');
			
			const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
			
			const [name, symbol, decimals, totalSupply] = await Promise.all([
				tokenContract.name().catch(() => 'Unknown'),
				tokenContract.symbol().catch(() => 'UNKNOWN'),
				tokenContract.decimals().catch(() => 18),
				tokenContract.totalSupply().catch(() => BigInt(0)),
			]);
			
			returnData.push({
				json: {
					address: tokenAddress,
					name,
					symbol,
					decimals: Number(decimals),
					totalSupply: totalSupply.toString(),
					formattedTotalSupply: formatUnits(totalSupply, Number(decimals)),
				},
			});
			break;
		}

		case 'getAddressActivity': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			
			const [balance, txCount, code] = await Promise.all([
				provider.getBalance(address),
				provider.getTransactionCount(address),
				provider.getCode(address),
			]);
			
			const isContract = code !== '0x';
			
			returnData.push({
				json: {
					address,
					balance: balance.toString(),
					formattedBalance: formatUnits(balance, 18),
					transactionCount: txCount,
					isContract,
					codeSize: isContract ? (code.length - 2) / 2 : 0,
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
