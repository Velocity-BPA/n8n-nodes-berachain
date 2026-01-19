/**
 * Cutting Board Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { serializeObject } from '../../utils/serializeUtils';
import { BerachainClient } from '../../transport/berachainClient';
import { BgtClient } from '../../transport/bgtClient';
import { isValidAddress } from '../../utils/addressUtils';
import { CUTTING_BOARD_CONFIG } from '../../constants/validators';

export const cuttingBoardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['cuttingBoard'] } },
		options: [
			{ name: 'Get Config', value: 'getConfig', description: 'Get cutting board configuration', action: 'Get config' },
			{ name: 'Get Distribution', value: 'getDistribution', description: 'Get validator reward distribution', action: 'Get distribution' },
			{ name: 'Get Weights', value: 'getWeights', description: 'Get vault weights for validator', action: 'Get weights' },
		],
		default: 'getConfig',
	},
];

export const cuttingBoardFields: INodeProperties[] = [
	{
		displayName: 'Validator Address',
		name: 'validatorAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Validator pubkey address',
		displayOptions: { show: { resource: ['cuttingBoard'], operation: ['getDistribution', 'getWeights'] } },
	},
];

export async function executeCuttingBoardOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const bgtClient = new BgtClient(client);

	switch (operation) {
		case 'getConfig': {
			returnData.push({ json: { config: CUTTING_BOARD_CONFIG } });
			break;
		}

		case 'getDistribution': {
			const validatorAddress = this.getNodeParameter('validatorAddress', index) as string;
			if (!isValidAddress(validatorAddress)) throw new Error('Invalid validator address');
			const cuttingBoard = await bgtClient.getValidatorCuttingBoard(validatorAddress);
			returnData.push({ json: { validator: validatorAddress, distribution: cuttingBoard } });
			break;
		}

		case 'getWeights': {
			const validatorAddress = this.getNodeParameter('validatorAddress', index) as string;
			if (!isValidAddress(validatorAddress)) throw new Error('Invalid validator address');
			const cuttingBoard = await bgtClient.getValidatorCuttingBoard(validatorAddress);
			returnData.push({ json: { validator: validatorAddress, weights: cuttingBoard } });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
