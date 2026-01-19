/**
 * Reward Vault Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, parseUnits, Contract } from 'ethers';
import { REWARD_VAULT_ABI } from '../../constants/abis';
import { SAMPLE_VAULTS } from '../../constants';

export const rewardVaultOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['rewardVault'] } },
		options: [
			{ name: 'Get Vaults', value: 'getVaults', description: 'Get list of reward vaults', action: 'Get vaults' },
			{ name: 'Get Vault Info', value: 'getVaultInfo', description: 'Get vault information', action: 'Get vault info' },
			{ name: 'Get Stake', value: 'getStake', description: 'Get user stake in vault', action: 'Get stake' },
			{ name: 'Get Rewards', value: 'getRewards', description: 'Get pending rewards', action: 'Get rewards' },
			{ name: 'Stake', value: 'stake', description: 'Stake tokens in vault', action: 'Stake' },
			{ name: 'Withdraw', value: 'withdraw', description: 'Withdraw tokens from vault', action: 'Withdraw' },
			{ name: 'Claim Rewards', value: 'claimRewards', description: 'Claim pending rewards', action: 'Claim rewards' },
		],
		default: 'getVaults',
	},
];

export const rewardVaultFields: INodeProperties[] = [
	{
		displayName: 'Vault Address',
		name: 'vaultAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['rewardVault'], operation: ['getVaultInfo', 'getStake', 'getRewards', 'stake', 'withdraw', 'claimRewards'] } },
		description: 'The reward vault address',
	},
	{
		displayName: 'User Address',
		name: 'userAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['rewardVault'], operation: ['getStake', 'getRewards'] } },
		description: 'The user address to query',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '0',
		displayOptions: { show: { resource: ['rewardVault'], operation: ['stake', 'withdraw'] } },
		description: 'Amount of tokens',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 10,
		displayOptions: { show: { resource: ['rewardVault'], operation: ['getVaults'] } },
		description: 'Maximum number of vaults to return',
	},
];

export async function executeRewardVaultOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();
	const wallet = client.getWallet();

	switch (operation) {
		case 'getVaults': {
			const limit = this.getNodeParameter('limit', index, 10) as number;
			const vaults = SAMPLE_VAULTS.slice(0, limit);
			returnData.push({
				json: {
					vaults: vaults.map(v => ({
						address: v.address,
						name: v.name,
						stakingToken: v.stakingToken,
						active: true,
					})),
					count: vaults.length,
				},
			});
			break;
		}

		case 'getVaultInfo': {
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			
			try {
				const vaultContract = new Contract(vaultAddress, REWARD_VAULT_ABI, provider);
				const [stakingToken, totalSupply] = await Promise.all([
					vaultContract.stakingToken().catch(() => '0x0'),
					vaultContract.totalSupply().catch(() => BigInt(0)),
				]);
				
				returnData.push({
					json: {
						address: vaultAddress,
						stakingToken: stakingToken,
						totalSupply: totalSupply.toString(),
						formattedTotalSupply: formatUnits(totalSupply, 18),
					},
				});
			} catch {
				returnData.push({
					json: {
						address: vaultAddress,
						stakingToken: '',
						totalSupply: '0',
						formattedTotalSupply: '0',
						error: 'Failed to fetch vault info',
					},
				});
			}
			break;
		}

		case 'getStake': {
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			const userAddress = this.getNodeParameter('userAddress', index) as string;
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			if (!isValidAddress(userAddress)) throw new Error('Invalid user address');
			
			try {
				const vaultContract = new Contract(vaultAddress, REWARD_VAULT_ABI, provider);
				const balance = await vaultContract.balanceOf(userAddress);
				returnData.push({
					json: {
						vault: vaultAddress,
						user: userAddress,
						stake: balance.toString(),
						formattedStake: formatUnits(balance, 18),
					},
				});
			} catch {
				returnData.push({
					json: {
						vault: vaultAddress,
						user: userAddress,
						stake: '0',
						formattedStake: '0',
					},
				});
			}
			break;
		}

		case 'getRewards': {
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			const userAddress = this.getNodeParameter('userAddress', index) as string;
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			if (!isValidAddress(userAddress)) throw new Error('Invalid user address');
			
			try {
				const vaultContract = new Contract(vaultAddress, REWARD_VAULT_ABI, provider);
				const rewards = await vaultContract.earned(userAddress);
				returnData.push({
					json: {
						vault: vaultAddress,
						user: userAddress,
						rewards: rewards.toString(),
						formattedRewards: formatUnits(rewards, 18),
					},
				});
			} catch {
				returnData.push({
					json: {
						vault: vaultAddress,
						user: userAddress,
						rewards: '0',
						formattedRewards: '0',
					},
				});
			}
			break;
		}

		case 'stake': {
			if (!wallet) throw new Error('Wallet required for this operation');
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			
			const vaultContract = new Contract(vaultAddress, REWARD_VAULT_ABI, wallet);
			const tx = await vaultContract.stake(parseUnits(amount, 18));
			const receipt = await tx.wait();
			returnData.push({
				json: {
					success: true,
					vault: vaultAddress,
					amount,
					transactionHash: receipt.hash,
				},
			});
			break;
		}

		case 'withdraw': {
			if (!wallet) throw new Error('Wallet required for this operation');
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			
			const vaultContract = new Contract(vaultAddress, REWARD_VAULT_ABI, wallet);
			const tx = await vaultContract.withdraw(parseUnits(amount, 18));
			const receipt = await tx.wait();
			returnData.push({
				json: {
					success: true,
					vault: vaultAddress,
					amount,
					transactionHash: receipt.hash,
				},
			});
			break;
		}

		case 'claimRewards': {
			if (!wallet) throw new Error('Wallet required for this operation');
			const vaultAddress = this.getNodeParameter('vaultAddress', index) as string;
			if (!isValidAddress(vaultAddress)) throw new Error('Invalid vault address');
			
			const vaultContract = new Contract(vaultAddress, REWARD_VAULT_ABI, wallet);
			const tx = await vaultContract.getReward();
			const receipt = await tx.wait();
			returnData.push({
				json: {
					success: true,
					vault: vaultAddress,
					transactionHash: receipt.hash,
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
