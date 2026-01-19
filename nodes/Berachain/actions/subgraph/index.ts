/**
 * Subgraph Resource Operations
 * [Velocity BPA Licensing Notice] - BSL 1.1
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { serializeObject } from '../../utils/serializeUtils';
import { BerachainClient } from '../../transport/berachainClient';
import axios from 'axios';

export const subgraphOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['subgraph'] } },
		options: [
			{ name: 'Query Subgraph', value: 'querySubgraph', description: 'Execute a GraphQL query', action: 'Query subgraph' },
			{ name: 'Get Status', value: 'getStatus', description: 'Get subgraph status', action: 'Get status' },
		],
		default: 'querySubgraph',
	},
];

export const subgraphFields: INodeProperties[] = [
	{
		displayName: 'Subgraph URL',
		name: 'subgraphUrl',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://api.thegraph.com/subgraphs/name/...',
		description: 'Subgraph endpoint URL',
		displayOptions: { show: { resource: ['subgraph'] } },
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		typeOptions: { rows: 10 },
		required: true,
		default: '',
		placeholder: '{ pools(first: 10) { id token0 token1 } }',
		description: 'GraphQL query',
		displayOptions: { show: { resource: ['subgraph'], operation: ['querySubgraph'] } },
	},
	{
		displayName: 'Variables',
		name: 'variables',
		type: 'json',
		default: '{}',
		description: 'Query variables (JSON object)',
		displayOptions: { show: { resource: ['subgraph'], operation: ['querySubgraph'] } },
	},
];

export async function executeSubgraphOperation(
	this: IExecuteFunctions,
	_client: BerachainClient,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];

	switch (operation) {
		case 'querySubgraph': {
			const subgraphUrl = this.getNodeParameter('subgraphUrl', index) as string;
			const query = this.getNodeParameter('query', index) as string;
			const variablesStr = this.getNodeParameter('variables', index) as string;
			const variables = typeof variablesStr === 'string' ? JSON.parse(variablesStr) : variablesStr;
			
			const response = await axios.post(subgraphUrl, {
				query,
				variables,
			}, {
				headers: { 'Content-Type': 'application/json' },
			});
			
			if (response.data.errors) {
				throw new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`);
			}
			
			returnData.push({ json: response.data.data });
			break;
		}

		case 'getStatus': {
			const subgraphUrl = this.getNodeParameter('subgraphUrl', index) as string;
			
			// Query for indexing status
			const statusQuery = `
				{
					_meta {
						block { number hash timestamp }
						deployment
						hasIndexingErrors
					}
				}
			`;
			
			try {
				const response = await axios.post(subgraphUrl, {
					query: statusQuery,
				}, {
					headers: { 'Content-Type': 'application/json' },
				});
				
				returnData.push({ json: { 
					url: subgraphUrl, 
					status: 'healthy',
					...response.data.data?._meta 
				} });
			} catch (error) {
				returnData.push({ json: { 
					url: subgraphUrl, 
					status: 'error',
					error: error instanceof Error ? error.message : 'Unknown error'
				} });
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return returnData;
}
