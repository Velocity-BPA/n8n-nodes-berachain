import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class BerachainApi implements ICredentialType {
	name = 'berachainApi';
	displayName = 'Berachain API';
	documentationUrl = 'https://docs.berachain.com/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for Berachain. Get your API key from the Berachain developer portal.',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.berachain.com/v1',
			description: 'Base URL for the Berachain API',
		},
	];
}