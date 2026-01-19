/**
 * Validator Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { BerachainClient } from '../../transport/berachainClient';
import { isValidAddress } from '../../utils/addressUtils';
import { SAMPLE_VALIDATORS } from '../../constants';

export const validatorOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['validator'] } },
		options: [
			{ name: 'Get Validators', value: 'getValidators', description: 'Get list of validators', action: 'Get validators' },
			{ name: 'Get Validator Info', value: 'getValidatorInfo', description: 'Get validator information', action: 'Get validator info' },
			{ name: 'Get Validator Boosts', value: 'getValidatorBoosts', description: 'Get validator boost info', action: 'Get validator boosts' },
			{ name: 'Get Active Validators', value: 'getActiveValidators', description: 'Get active validators', action: 'Get active validators' },
		],
		default: 'getValidators',
	},
];

export const validatorFields: INodeProperties[] = [
	{
		displayName: 'Validator Address',
		name: 'validatorAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['validator'], operation: ['getValidatorInfo', 'getValidatorBoosts'] } },
		description: 'The validator address to query',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 10,
		displayOptions: { show: { resource: ['validator'], operation: ['getValidators', 'getActiveValidators'] } },
		description: 'Maximum number of validators to return',
	},
];

export async function executeValidatorOperation(
	this: IExecuteFunctions,
	client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	switch (operation) {
		case 'getValidators': {
			const limit = this.getNodeParameter('limit', index, 10) as number;
			const validators = SAMPLE_VALIDATORS.slice(0, limit);
			returnData.push({
				json: {
					validators: validators.map(v => ({
						address: v.address,
						name: v.name,
						description: v.description || '',
						website: v.website || '',
						commission: v.commission,
					})),
					count: validators.length,
				},
			});
			break;
		}

		case 'getValidatorInfo': {
			const validatorAddress = this.getNodeParameter('validatorAddress', index) as string;
			if (!isValidAddress(validatorAddress)) throw new Error('Invalid validator address');
			
			const validator = SAMPLE_VALIDATORS.find(
				v => v.address.toLowerCase() === validatorAddress.toLowerCase()
			);
			
			if (validator) {
				returnData.push({
					json: {
						address: validator.address,
						name: validator.name,
						description: validator.description || '',
						website: validator.website || '',
						commission: validator.commission,
					},
				});
			} else {
				returnData.push({
					json: {
						address: validatorAddress,
						name: 'Unknown Validator',
						description: '',
						website: '',
						commission: 0,
					},
				});
			}
			break;
		}

		case 'getValidatorBoosts': {
			const validatorAddress = this.getNodeParameter('validatorAddress', index) as string;
			if (!isValidAddress(validatorAddress)) throw new Error('Invalid validator address');
			
			// Mock data - in production would query contract
			returnData.push({
				json: {
					validator: validatorAddress,
					totalBoost: '0',
					queuedBoost: '0',
					activeBoost: '0',
					delegators: 0,
				},
			});
			break;
		}

		case 'getActiveValidators': {
			const limit = this.getNodeParameter('limit', index, 10) as number;
			// All validators in SAMPLE_VALIDATORS are considered active
			const activeValidators = SAMPLE_VALIDATORS.slice(0, limit);
			returnData.push({
				json: {
					validators: activeValidators.map(v => ({
						address: v.address,
						name: v.name,
						description: v.description || '',
						website: v.website || '',
						commission: v.commission,
					})),
					count: activeValidators.length,
				},
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
