/**
 * Governance Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { serializeObject } from '../../utils/serializeUtils';
import { BerachainClient } from '../../transport/berachainClient';
import { BgtClient } from '../../transport/bgtClient';
import { isValidAddress } from '../../utils/addressUtils';
import { formatUnits } from 'ethers';

export const governanceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['governance'] } },
		options: [
			{ name: 'Get Voting Power', value: 'getVotingPower', description: 'Get voting power', action: 'Get voting power' },
			{ name: 'Get Past Votes', value: 'getPastVotes', description: 'Get historical voting power', action: 'Get past votes' },
			{ name: 'Get Delegate', value: 'getDelegate', description: 'Get current delegate', action: 'Get delegate' },
			{ name: 'Delegate', value: 'delegate', description: 'Delegate voting power', action: 'Delegate' },
		],
		default: 'getVotingPower',
	},
];

export const governanceFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Account address',
		displayOptions: { show: { resource: ['governance'], operation: ['getVotingPower', 'getPastVotes', 'getDelegate'] } },
	},
	{
		displayName: 'Block Number',
		name: 'blockNumber',
		type: 'number',
		required: true,
		default: 0,
		description: 'Block number for historical voting power',
		displayOptions: { show: { resource: ['governance'], operation: ['getPastVotes'] } },
	},
	{
		displayName: 'Delegatee Address',
		name: 'delegatee',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Address to delegate voting power to',
		displayOptions: { show: { resource: ['governance'], operation: ['delegate'] } },
	},
];

export async function executeGovernanceOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const bgtClient = new BgtClient(client);

	switch (operation) {
		case 'getVotingPower': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const votes = await bgtClient.getVotes(address);
			returnData.push({ json: { address, votes: votes.toString(), formatted: formatUnits(votes, 18) } });
			break;
		}

		case 'getPastVotes': {
			const address = this.getNodeParameter('address', index) as string;
			const blockNumber = this.getNodeParameter('blockNumber', index) as number;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const votes = await bgtClient.getPastVotes(address, blockNumber);
			returnData.push({ json: { address, blockNumber, votes: votes.toString(), formatted: formatUnits(votes, 18) } });
			break;
		}

		case 'getDelegate': {
			const address = this.getNodeParameter('address', index) as string;
			if (!isValidAddress(address)) throw new Error('Invalid address');
			const delegate = await bgtClient.getDelegate(address);
			returnData.push({ json: { address, delegate } });
			break;
		}

		case 'delegate': {
			const delegatee = this.getNodeParameter('delegatee', index) as string;
			if (!isValidAddress(delegatee)) throw new Error('Invalid delegatee address');
			const tx = await bgtClient.delegate(delegatee);
			returnData.push({ json: { txHash: tx.hash, delegatee, status: 'pending' } });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
