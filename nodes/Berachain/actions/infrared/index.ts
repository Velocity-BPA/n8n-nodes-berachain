/**
 * Infrared Protocol Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, parseUnits, Contract } from 'ethers';
import { ERC20_ABI } from '../../constants/abis';

export const infraredOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['infrared'] } },
		options: [
			{ name: 'Get Vaults', value: 'getVaults', description: 'List vaults', action: 'Get vaults' },
			{ name: 'Get Vault Info', value: 'getVaultInfo', description: 'Get vault info', action: 'Get vault info' },
			{ name: 'Get User Position', value: 'getUserPosition', description: 'Get user vault position', action: 'Get user position' },
			{ name: 'Deposit', value: 'deposit', description: 'Deposit to vault', action: 'Deposit' },
			{ name: 'Withdraw', value: 'withdraw', description: 'Withdraw from vault', action: 'Withdraw' },
			{ name: 'Claim Rewards', value: 'claimRewards', description: 'Claim rewards', action: 'Claim rewards' },
		],
		default: 'getVaults',
	},
];

export const infraredFields: INodeProperties[] = [
	{
		displayName: 'Vault Address',
		name: 'vaultAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['infrared'], operation: ['getVaultInfo', 'getUserPosition', 'deposit', 'withdraw', 'claimRewards'] } },
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['infrared'], operation: ['getUserPosition'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '0',
		displayOptions: { show: { resource: ['infrared'], operation: ['deposit', 'withdraw'] } },
	},
];

export async function executeInfraredOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();
	const wallet = client.getWallet();
	const network = client.getNetwork();

	switch (operation) {
		case 'getVaults': {
			returnData.push({ json: {
				network,
				message: 'Vault listing requires Infrared protocol indexer',
			} });
			break;
		}

		case 'getVaultInfo': {
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			
			try {
				const vaultContract = new Contract(vaultAddress, ERC20_ABI, provider);
				const [name, symbol, totalSupply] = await Promise.all([
					vaultContract.name(),
					vaultContract.symbol(),
					vaultContract.totalSupply(),
				]);
				returnData.push({ json: {
					address: vaultAddress,
					name,
					symbol,
					totalSupply: totalSupply.toString(),
				} });
			} catch {
				returnData.push({ json: { address: vaultAddress, error: 'Unable to fetch vault info' } });
			}
			break;
		}

		case 'getUserPosition': {
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			const address = this.getNodeParameter('address', index) as string;
			
			if (!isValidAddress(vaultAddress) || !isValidAddress(address)) {
				throw new Error('Invalid address');
			}
			
			const vaultContract = new Contract(vaultAddress, ERC20_ABI, provider);
			const balance = await vaultContract.balanceOf(address);
			returnData.push({ json: {
				vaultAddress,
				address,
				balance: balance.toString(),
				formatted: formatUnits(balance, 18),
			} });
			break;
		}

		case 'deposit': {
			if (!wallet) throw new Error('Wallet required for deposit');
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			
			returnData.push({ json: {
				vaultAddress,
				amount: parseUnits(amount, 18).toString(),
				message: 'Deposit requires Infrared vault contract integration',
			} });
			break;
		}

		case 'withdraw': {
			if (!wallet) throw new Error('Wallet required for withdraw');
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			
			returnData.push({ json: {
				vaultAddress,
				amount: parseUnits(amount, 18).toString(),
				message: 'Withdraw requires Infrared vault contract integration',
			} });
			break;
		}

		case 'claimRewards': {
			if (!wallet) throw new Error('Wallet required for claiming rewards');
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			
			returnData.push({ json: {
				vaultAddress,
				message: 'Claim rewards requires Infrared vault contract integration',
			} });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
