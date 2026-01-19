/**
 * Gauge Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits, Contract } from 'ethers';
import { SAMPLE_GAUGES, VOTING_CONFIG } from '../../constants';

const GAUGE_ABI = [
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address) view returns (uint256)',
	'function earned(address) view returns (uint256)',
	'function rewardRate() view returns (uint256)',
	'function stakingToken() view returns (address)',
];

export const gaugeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['gauge'] } },
		options: [
			{ name: 'Get Gauges', value: 'getGauges', description: 'Get list of gauges', action: 'Get gauges' },
			{ name: 'Get Gauge Info', value: 'getGaugeInfo', description: 'Get gauge information', action: 'Get gauge info' },
			{ name: 'Get Voting Config', value: 'getVotingConfig', description: 'Get gauge voting config', action: 'Get voting config' },
			{ name: 'Get Gauge Weight', value: 'getGaugeWeight', description: 'Get gauge weight/votes', action: 'Get gauge weight' },
			{ name: 'Get User Position', value: 'getUserPosition', description: 'Get user position in gauge', action: 'Get user position' },
		],
		default: 'getGauges',
	},
];

export const gaugeFields: INodeProperties[] = [
	{
		displayName: 'Gauge Address',
		name: 'gaugeAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['gauge'], operation: ['getGaugeInfo', 'getGaugeWeight', 'getUserPosition'] } },
		description: 'The gauge address',
	},
	{
		displayName: 'User Address',
		name: 'userAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['gauge'], operation: ['getUserPosition'] } },
		description: 'The user address to query',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 10,
		displayOptions: { show: { resource: ['gauge'], operation: ['getGauges'] } },
		description: 'Maximum number of gauges to return',
	},
];

export async function executeGaugeOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const provider = client.getProvider();

	switch (operation) {
		case 'getGauges': {
			const limit = this.getNodeParameter('limit', index, 10) as number;
			const gauges = SAMPLE_GAUGES.slice(0, limit);
			returnData.push({
				json: {
					gauges: gauges.map(g => ({
						address: g.address,
						name: g.name,
						rewardVault: g.rewardVault,
						protocol: g.protocol,
						weight: g.weight,
						isActive: g.isActive,
					})),
					count: gauges.length,
				},
			});
			break;
		}

		case 'getGaugeInfo': {
			const gaugeAddress = this.getNodeParameter('gaugeAddress', index) as string;
			if (!isValidAddress(gaugeAddress)) throw new Error('Invalid gauge address');
			
			try {
				const gaugeContract = new Contract(gaugeAddress, GAUGE_ABI, provider);
				const [totalSupply, rewardRate, stakingToken] = await Promise.all([
					gaugeContract.totalSupply().catch(() => BigInt(0)),
					gaugeContract.rewardRate().catch(() => BigInt(0)),
					gaugeContract.stakingToken().catch(() => '0x0'),
				]);
				
				returnData.push({
					json: {
						address: gaugeAddress,
						totalSupply: totalSupply.toString(),
						formattedTotalSupply: formatUnits(totalSupply, 18),
						rewardRate: rewardRate.toString(),
						formattedRewardRate: formatUnits(rewardRate, 18),
						stakingToken,
					},
				});
			} catch {
				returnData.push({
					json: {
						address: gaugeAddress,
						totalSupply: '0',
						formattedTotalSupply: '0',
						rewardRate: '0',
						formattedRewardRate: '0',
						stakingToken: '',
						error: 'Failed to fetch gauge info',
					},
				});
			}
			break;
		}

		case 'getVotingConfig': {
			returnData.push({
				json: {
					votingPeriod: VOTING_CONFIG.votingPeriod,
					minVoteAmount: VOTING_CONFIG.minVoteAmount,
					maxGaugesPerVote: VOTING_CONFIG.maxGaugesPerVote,
					voteDecay: VOTING_CONFIG.voteDecay,
					decayPeriod: VOTING_CONFIG.decayPeriod,
				},
			});
			break;
		}

		case 'getGaugeWeight': {
			const gaugeAddress = this.getNodeParameter('gaugeAddress', index) as string;
			if (!isValidAddress(gaugeAddress)) throw new Error('Invalid gauge address');
			
			try {
				const gaugeContract = new Contract(gaugeAddress, GAUGE_ABI, provider);
				const totalSupply = await gaugeContract.totalSupply();
				returnData.push({
					json: {
						gauge: gaugeAddress,
						weight: totalSupply.toString(),
						formattedWeight: formatUnits(totalSupply, 18),
					},
				});
			} catch {
				returnData.push({
					json: {
						gauge: gaugeAddress,
						weight: '0',
						formattedWeight: '0',
					},
				});
			}
			break;
		}

		case 'getUserPosition': {
			const gaugeAddress = this.getNodeParameter('gaugeAddress', index) as string;
			const userAddress = this.getNodeParameter('userAddress', index) as string;
			if (!isValidAddress(gaugeAddress)) throw new Error('Invalid gauge address');
			if (!isValidAddress(userAddress)) throw new Error('Invalid user address');
			
			try {
				const gaugeContract = new Contract(gaugeAddress, GAUGE_ABI, provider);
				const [balance, earned] = await Promise.all([
					gaugeContract.balanceOf(userAddress),
					gaugeContract.earned(userAddress).catch(() => BigInt(0)),
				]);
				
				returnData.push({
					json: {
						gauge: gaugeAddress,
						user: userAddress,
						balance: balance.toString(),
						formattedBalance: formatUnits(balance, 18),
						pendingRewards: earned.toString(),
						formattedPendingRewards: formatUnits(earned, 18),
					},
				});
			} catch {
				returnData.push({
					json: {
						gauge: gaugeAddress,
						user: userAddress,
						balance: '0',
						formattedBalance: '0',
						pendingRewards: '0',
						formattedPendingRewards: '0',
					},
				});
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
